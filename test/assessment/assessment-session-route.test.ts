import { existsSync, readFileSync } from "node:fs";

import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import {
  DrizzleAssessmentDraftSessionRepository,
  type AssessmentDraftSessionRepository,
} from "@/db/repositories/assessment-draft-session-repository";
import {
  assessmentDraftSessions,
  type AssessmentDraftSessionInsert,
  type AssessmentDraftSessionRecord,
} from "@/db/schema";
import {
  assessmentDraftSessionBootstrapSchema,
  assessmentDraftSessionSnapshotSchema,
  assessmentDraftSessionUpdateSchema,
} from "@/domain/assessment/draft-schema";
import {
  ASSESSMENT_DRAFT_SESSION_COOKIE,
  buildAssessmentDraftSessionCookie,
  createAssessmentDraftSessionToken,
  readAssessmentDraftSessionToken,
} from "@/domain/assessment/draft-session";
import type { AssessmentDraftSessionSnapshot } from "@/features/assessment/types";

class FakeAssessmentDraftSessionDb {
  insertedValues: AssessmentDraftSessionInsert[] = [];
  deletedTokens: string[] = [];

  insert() {
    return {
      values: (values: AssessmentDraftSessionInsert) => ({
        returning: async () => {
          const savedRecord = this.toRecord(values);
          this.insertedValues = [values];

          return [savedRecord];
        },
      }),
    };
  }

  select() {
    return {
      from: () => ({
        where: () => ({
          limit: async () => {
            const saved = this.insertedValues[0];

            return saved ? [this.toRecord(saved)] : [];
          },
        }),
      }),
    };
  }

  update() {
    return {
      set: (values: Partial<AssessmentDraftSessionInsert>) => ({
        where: () => ({
          returning: async () => {
            const current = this.insertedValues[0];

            if (!current) {
              return [];
            }

            const updated = {
              ...current,
              ...values,
            } satisfies AssessmentDraftSessionInsert;

            this.insertedValues = [updated];

            return [this.toRecord(updated)];
          },
        }),
      }),
    };
  }

  delete() {
    return {
      where: () => {
        const saved = this.insertedValues[0];

        if (saved) {
          this.deletedTokens.push(saved.sessionToken);
          this.insertedValues = [];
        }

        return Promise.resolve();
      },
    };
  }

  private toRecord(values: AssessmentDraftSessionInsert): AssessmentDraftSessionRecord {
    return {
      id: "draft-session-1",
      sessionToken: values.sessionToken,
      assessmentVersion: values.assessmentVersion,
      draftAnswers: values.draftAnswers,
      draftProgress: values.draftProgress,
      createdAt: values.createdAt,
      updatedAt: values.updatedAt,
    };
  }
}

function buildDraftSnapshot(): AssessmentDraftSessionSnapshot {
  return {
    assessmentVersion: assessmentDefinition.version,
    answers: {
      [assessmentDefinition.questions[0]!.id]: 5,
    },
    progress: {
      answeredCount: 1,
      totalQuestions: assessmentDefinition.questions.length,
      currentQuestionId: assessmentDefinition.questions[1]!.id,
      isComplete: false,
    },
  };
}

describe("assessment draft session contract", () => {
  it("defines an opaque anonymous assessment cookie boundary", () => {
    const token = createAssessmentDraftSessionToken();
    const cookie = buildAssessmentDraftSessionCookie(token);

    expect(ASSESSMENT_DRAFT_SESSION_COOKIE.name).toBe("assessment_session");
    expect(token).toMatch(/^[A-Za-z]+$/);
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(cookie).toEqual({
      name: "assessment_session",
      value: token,
      options: expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      }),
    });
    expect(readAssessmentDraftSessionToken(cookie.value)).toBe(token);
    expect(readAssessmentDraftSessionToken("")).toBeNull();
  });

  it("stores the canonical anonymous draft payload in a dedicated postgres table", () => {
    const columns = getTableColumns(assessmentDraftSessions);

    expect(Object.keys(columns)).toEqual(
      expect.arrayContaining([
        "sessionToken",
        "assessmentVersion",
        "draftAnswers",
        "draftProgress",
        "createdAt",
        "updatedAt",
      ]),
    );
  });

  it("validates the canonical bootstrap, update, and snapshot route payloads", () => {
    const snapshot = buildDraftSnapshot();

    expect(
      assessmentDraftSessionBootstrapSchema.parse({
        assessmentVersion: assessmentDefinition.version,
      }),
    ).toEqual({
      assessmentVersion: assessmentDefinition.version,
    });

    expect(assessmentDraftSessionUpdateSchema.parse(snapshot)).toEqual(snapshot);
    expect(assessmentDraftSessionSnapshotSchema.parse(snapshot)).toEqual(snapshot);
  });

  it("persists draft sessions by opaque session token through the repository boundary", async () => {
    const db = new FakeAssessmentDraftSessionDb();
    const repository: AssessmentDraftSessionRepository =
      new DrizzleAssessmentDraftSessionRepository(db as never);
    const sessionToken = createAssessmentDraftSessionToken();
    const createdAt = new Date("2026-03-29T12:00:00.000Z");
    const snapshot = buildDraftSnapshot();

    const created = await repository.createDraftSession({
      sessionToken,
      ...snapshot,
      createdAt,
      updatedAt: createdAt,
    });

    expect(created.sessionToken).toBe(sessionToken);
    expect(created.draftAnswers).toEqual(snapshot.answers);
    expect(created.draftProgress).toEqual(snapshot.progress);

    const loaded = await repository.findBySessionToken(sessionToken);

    expect(loaded?.sessionToken).toBe(sessionToken);

    const updated = await repository.updateDraftSession(sessionToken, {
      answers: {
        ...snapshot.answers,
        [assessmentDefinition.questions[1]!.id]: 3,
      },
      progress: {
        answeredCount: 2,
        totalQuestions: assessmentDefinition.questions.length,
        currentQuestionId: assessmentDefinition.questions[2]!.id,
        isComplete: false,
      },
      updatedAt: new Date("2026-03-29T12:05:00.000Z"),
    });

    expect(updated?.draftProgress.answeredCount).toBe(2);
    expect(updated?.draftAnswers[assessmentDefinition.questions[1]!.id]).toBe(3);

    await repository.deleteDraftSession(sessionToken);

    expect(await repository.findBySessionToken(sessionToken)).toBeNull();
    expect(db.deletedTokens).toContain(sessionToken);
  });

  it("checks in drizzle migration artifacts for the draft session table", () => {
    expect(existsSync("drizzle/0002_phase3_assessment_drafts.sql")).toBe(true);
    expect(existsSync("drizzle/meta/0002_snapshot.json")).toBe(true);

    if (existsSync("drizzle/0002_phase3_assessment_drafts.sql")) {
      expect(readFileSync("drizzle/0002_phase3_assessment_drafts.sql", "utf8")).toContain(
        'CREATE TABLE "assessment_draft_sessions"',
      );
    }
  });
});
