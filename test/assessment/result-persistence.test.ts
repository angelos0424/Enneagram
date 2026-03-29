import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { getTableColumns } from "drizzle-orm";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import {
  DrizzleAssessmentResultRepository,
  type AssessmentResultRepository,
} from "@/db/repositories/assessment-result-repository";
import {
  assessmentResults,
  type AssessmentResultInsert,
  type AssessmentResultRecord,
} from "@/db/schema";
import {
  buildAssessmentResultSnapshot,
  type AssessmentResultSnapshotDraft,
} from "@/domain/assessment/result-snapshot";
import { scoreAssessment } from "@/domain/assessment/scoring";

import { buildTypeDominantAnswers } from "./fixtures";

function expectOpaqueToken(token: string, minimumLength: number) {
  expect(token).toMatch(/^[A-Za-z]+$/);
  expect(token.length).toBeGreaterThanOrEqual(minimumLength);
}

class SpyAssessmentResultRepository implements AssessmentResultRepository {
  savedSnapshots: AssessmentResultSnapshotDraft[] = [];

  async save(snapshot: AssessmentResultSnapshotDraft): Promise<AssessmentResultRecord> {
    const record: AssessmentResultRecord = {
      id: "db-record-1",
      publicId: snapshot.publicId,
      adminToken: snapshot.adminToken,
      assessmentVersion: snapshot.assessmentVersion,
      scoringVersion: snapshot.scoringVersion,
      copyVersion: snapshot.copyVersion,
      primaryType: String(snapshot.primaryType),
      wingType: String(snapshot.wingType),
      growthType: String(snapshot.growthType),
      stressType: String(snapshot.stressType),
      rawScores: snapshot.rawScores,
      normalizedScores: snapshot.normalizedScores,
      nearbyTypes: snapshot.nearbyTypes,
      answers: snapshot.answers,
      createdAt: snapshot.createdAt,
    };

    this.savedSnapshots.push({
      ...snapshot,
      nearbyTypes: [...snapshot.nearbyTypes],
      answers: [...snapshot.answers],
    });

    return record;
  }

  async findById(id: string): Promise<AssessmentResultRecord | null> {
    const snapshot = id === "db-record-1" ? this.savedSnapshots[0] : undefined;

    return snapshot
      ? {
          id,
          publicId: snapshot.publicId,
          adminToken: snapshot.adminToken,
          assessmentVersion: snapshot.assessmentVersion,
          scoringVersion: snapshot.scoringVersion,
          copyVersion: snapshot.copyVersion,
          primaryType: String(snapshot.primaryType),
          wingType: String(snapshot.wingType),
          growthType: String(snapshot.growthType),
          stressType: String(snapshot.stressType),
          rawScores: snapshot.rawScores,
          normalizedScores: snapshot.normalizedScores,
          nearbyTypes: snapshot.nearbyTypes,
          answers: snapshot.answers,
          createdAt: snapshot.createdAt,
        }
      : null;
  }

  async findByPublicId(publicId: string): Promise<AssessmentResultRecord | null> {
    const snapshot = this.savedSnapshots.find((candidate) => candidate.publicId === publicId);

    return snapshot
      ? {
          id: "db-record-1",
          publicId: snapshot.publicId,
          adminToken: snapshot.adminToken,
          assessmentVersion: snapshot.assessmentVersion,
          scoringVersion: snapshot.scoringVersion,
          copyVersion: snapshot.copyVersion,
          primaryType: String(snapshot.primaryType),
          wingType: String(snapshot.wingType),
          growthType: String(snapshot.growthType),
          stressType: String(snapshot.stressType),
          rawScores: snapshot.rawScores,
          normalizedScores: snapshot.normalizedScores,
          nearbyTypes: snapshot.nearbyTypes,
          answers: snapshot.answers,
          createdAt: snapshot.createdAt,
        }
      : null;
  }
}

class FakeAssessmentDb {
  insertedValues: AssessmentResultInsert[] = [];
  whereCalls: unknown[] = [];

  insert() {
    return {
      values: (values: AssessmentResultInsert) => ({
        returning: async () => {
          const savedRecord: AssessmentResultRecord = {
            id: "internal-uuid-1",
            publicId: values.publicId,
            adminToken: values.adminToken,
            assessmentVersion: values.assessmentVersion,
            scoringVersion: values.scoringVersion,
            copyVersion: values.copyVersion,
            primaryType: String(values.primaryType),
            wingType: String(values.wingType),
            growthType: String(values.growthType),
            stressType: String(values.stressType),
            rawScores: values.rawScores,
            normalizedScores: values.normalizedScores,
            nearbyTypes: values.nearbyTypes,
            answers: values.answers,
            createdAt: values.createdAt,
          };

          this.insertedValues.push(values);

          return [savedRecord];
        },
      }),
    };
  }

  select() {
    return {
      from: () => ({
        where: (whereCall: unknown) => {
          this.whereCalls.push(whereCall);

          return {
            limit: async () => {
              const saved = this.insertedValues[0];

              if (!saved) {
                return [];
              }

              return [
                {
                  id: "internal-uuid-1",
                  publicId: saved.publicId,
                  adminToken: saved.adminToken,
                  assessmentVersion: saved.assessmentVersion,
                  scoringVersion: saved.scoringVersion,
                  copyVersion: saved.copyVersion,
                  primaryType: String(saved.primaryType),
                  wingType: String(saved.wingType),
                  growthType: String(saved.growthType),
                  stressType: String(saved.stressType),
                  rawScores: saved.rawScores,
                  normalizedScores: saved.normalizedScores,
                  nearbyTypes: saved.nearbyTypes,
                  answers: saved.answers,
                  createdAt: saved.createdAt,
                } satisfies AssessmentResultRecord,
              ];
            },
          };
        },
      }),
    };
  }
}

describe("assessment result persistence", () => {
  it("includes the Phase 1 version trio with a generated opaque publicId", () => {
    const answers = buildTypeDominantAnswers(8);
    const scoredResult = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });
    const createdAt = new Date("2026-03-29T00:00:00.000Z");

    const snapshot = buildAssessmentResultSnapshot(scoredResult, answers, createdAt);

    expect(snapshot.assessmentVersion).toBe(scoredResult.assessmentVersion);
    expect(snapshot.scoringVersion).toBe(scoredResult.scoringVersion);
    expect(snapshot.copyVersion).toBe(scoredResult.copyVersion);
    expect(snapshot.createdAt).toEqual(createdAt);
    expectOpaqueToken(snapshot.publicId, 20);
  });

  it("carries an admin-only management token without leaking readable share data", () => {
    const answers = buildTypeDominantAnswers(5);
    const scoredResult = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    const snapshot = buildAssessmentResultSnapshot(scoredResult, answers);

    expectOpaqueToken(snapshot.publicId, 20);
    expectOpaqueToken(snapshot.adminToken, 32);
    expect(snapshot.adminToken).not.toBe(snapshot.publicId);
    expect(snapshot.publicId.toLowerCase()).not.toContain("type");
    expect(snapshot.adminToken.toLowerCase()).not.toContain("type");
  });

  it("keeps the immutable scored payload fields intact when link tokens are attached", () => {
    const answers = buildTypeDominantAnswers(2);
    const scoredResult = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    const snapshot = buildAssessmentResultSnapshot(scoredResult, answers);

    expect(snapshot.primaryType).toBe(scoredResult.primaryType);
    expect(snapshot.wingType).toBe(scoredResult.wingType);
    expect(snapshot.growthType).toBe(scoredResult.growthType);
    expect(snapshot.stressType).toBe(scoredResult.stressType);
    expect(snapshot.rawScores).toEqual(scoredResult.rawScores);
    expect(snapshot.normalizedScores).toEqual(scoredResult.normalizedScores);
    expect(snapshot.nearbyTypes).toEqual(scoredResult.nearbyTypes);
    expect(snapshot.answers).toEqual(answers);
  });

  it("exposes publicId and adminToken schema columns while keeping the version trio unchanged", () => {
    const columns = getTableColumns(assessmentResults);

    expect(Object.keys(columns)).toEqual(
      expect.arrayContaining([
        "assessmentVersion",
        "scoringVersion",
        "copyVersion",
        "publicId",
        "adminToken",
      ]),
    );
  });

  it("persists a tokenized snapshot and can retrieve it by publicId", async () => {
    const repository = new SpyAssessmentResultRepository();
    const answers = buildTypeDominantAnswers(7);
    const snapshot = buildAssessmentResultSnapshot(
      scoreAssessment({
        assessmentVersion: assessmentDefinition.version,
        answers,
      }),
      answers,
      new Date("2026-03-29T01:00:00.000Z"),
    );

    const savedRecord = await repository.save(snapshot);
    const foundRecord = await repository.findByPublicId(snapshot.publicId);

    expect(savedRecord.publicId).toBe(snapshot.publicId);
    expect(savedRecord.adminToken).toBe(snapshot.adminToken);
    expect(foundRecord?.publicId).toBe(snapshot.publicId);
    expect(foundRecord?.assessmentVersion).toBe(snapshot.assessmentVersion);
  });

  it("uses publicId rather than the internal uuid for the public lookup path", async () => {
    const fakeDb = new FakeAssessmentDb();
    const repository = new DrizzleAssessmentResultRepository(fakeDb as never);
    const answers = buildTypeDominantAnswers(3);
    const snapshot = buildAssessmentResultSnapshot(
      scoreAssessment({
        assessmentVersion: assessmentDefinition.version,
        answers,
      }),
      answers,
    );

    await repository.save(snapshot);
    const foundRecord = await repository.findByPublicId(snapshot.publicId);

    expect(foundRecord?.id).toBe("internal-uuid-1");
    expect(foundRecord?.publicId).toBe(snapshot.publicId);
    const repositorySource = readFileSync(
      "src/db/repositories/assessment-result-repository.ts",
      "utf8",
    );

    expect(repositorySource).toContain("findByPublicId");
    expect(repositorySource).toContain("assessmentResults.publicId");
    expect(repositorySource).not.toContain("findByPublicId(id:");
  });

  it("checks in the Drizzle migration artifacts for the tokenized schema change", () => {
    const migrationFile = "drizzle/0001_phase2_snapshot_tokens.sql";
    const snapshotFile = "drizzle/meta/0001_snapshot.json";
    const journalFile = "drizzle/meta/_journal.json";

    expect(existsSync(migrationFile)).toBe(true);
    expect(existsSync(snapshotFile)).toBe(true);
    expect(existsSync(journalFile)).toBe(true);
    expect(readFileSync(migrationFile, "utf8")).toContain("public_id");
    expect(readFileSync(migrationFile, "utf8")).toContain("admin_token");
    expect(readFileSync(journalFile, "utf8")).toContain("0001_phase2_snapshot_tokens");
  });
});
