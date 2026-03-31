import { existsSync, readFileSync } from "node:fs";

import { getTableColumns } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { assessmentDefinition } from "@/content/assessments";
import { assessmentDefinition as assessmentDefinitionV1 } from "@/content/assessments/ko/v1";
import {
  ADMIN_STATS_EVENT_TYPES,
  type AdminStatsEventRepository,
} from "@/db/repositories/admin-stats-event-repository";
import {
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

const {
  adminStatsEventRepositoryConstructorMock,
  cookiesMock,
  repositoryConstructorMock,
} = vi.hoisted(() => ({
  adminStatsEventRepositoryConstructorMock: vi.fn(),
  cookiesMock: vi.fn(),
  repositoryConstructorMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/db/repositories/assessment-draft-session-repository", async () => {
  const actual = await vi.importActual<
    typeof import("@/db/repositories/assessment-draft-session-repository")
  >("@/db/repositories/assessment-draft-session-repository");

  return {
    ...actual,
    DrizzleAssessmentDraftSessionRepository: repositoryConstructorMock,
  };
});

vi.mock("@/db/repositories/admin-stats-event-repository", async () => {
  const actual = await vi.importActual<
    typeof import("@/db/repositories/admin-stats-event-repository")
  >("@/db/repositories/admin-stats-event-repository");

  return {
    ...actual,
    DrizzleAdminStatsEventRepository: adminStatsEventRepositoryConstructorMock,
  };
});

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

class FakeCookiesStore {
  private readonly values = new Map<string, string>();
  readonly setCalls: Array<{ name: string; value: string; options: object }> = [];
  readonly deleteCalls: string[] = [];

  constructor(seed?: Record<string, string>) {
    Object.entries(seed ?? {}).forEach(([name, value]) => {
      this.values.set(name, value);
    });
  }

  get(name: string) {
    const value = this.values.get(name);
    return value ? { name, value } : undefined;
  }

  set(name: string, value: string, options: object) {
    this.values.set(name, value);
    this.setCalls.push({ name, value, options });
  }

  delete(name: string) {
    this.values.delete(name);
    this.deleteCalls.push(name);
  }
}

class FakeDraftSessionRepository implements AssessmentDraftSessionRepository {
  constructor(
    private readonly entries = new Map<string, AssessmentDraftSessionRecord>(),
  ) {}

  async createDraftSession(
    session: AssessmentDraftSessionSnapshot & {
      sessionToken: string;
      createdAt: Date;
      updatedAt: Date;
    },
  ) {
    const record: AssessmentDraftSessionRecord = {
      id: `draft-${session.sessionToken}`,
      sessionToken: session.sessionToken,
      assessmentVersion: session.assessmentVersion,
      draftAnswers: session.answers,
      draftProgress: session.progress,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    this.entries.set(session.sessionToken, record);

    return record;
  }

  async findBySessionToken(sessionToken: string) {
    return this.entries.get(sessionToken) ?? null;
  }

  async updateDraftSession(
    sessionToken: string,
    session: {
      answers: AssessmentDraftSessionSnapshot["answers"];
      progress: AssessmentDraftSessionSnapshot["progress"];
      updatedAt: Date;
    },
  ) {
    const current = this.entries.get(sessionToken);

    if (!current) {
      return null;
    }

    const updated: AssessmentDraftSessionRecord = {
      ...current,
      draftAnswers: session.answers,
      draftProgress: session.progress,
      updatedAt: session.updatedAt,
    };

    this.entries.set(sessionToken, updated);

    return updated;
  }

  async deleteDraftSession(sessionToken: string) {
    this.entries.delete(sessionToken);
  }

  async finalizeDraftSession(sessionToken: string) {
    await this.deleteDraftSession(sessionToken);
  }
}

class FakeAdminStatsEventRepository implements AdminStatsEventRepository {
  readonly events: Array<{
    eventType: string;
    occurredAt: Date;
  }> = [];

  async recordEvent(input: { eventType: string; occurredAt: Date }) {
    const record = {
      id: `event-${this.events.length + 1}`,
      eventType: input.eventType,
      occurredAt: input.occurredAt,
    };

    this.events.push(record);

    return record;
  }

  async listEvents() {
    return this.events.map((event, index) => ({
      id: `event-${index + 1}`,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
    }));
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

function buildLegacyDraftSnapshot(): AssessmentDraftSessionSnapshot {
  return {
    assessmentVersion: assessmentDefinitionV1.version,
    answers: {
      [assessmentDefinitionV1.questions[0]!.id]: 5,
    },
    progress: {
      answeredCount: 1,
      totalQuestions: assessmentDefinitionV1.questions.length,
      currentQuestionId: assessmentDefinitionV1.questions[1]!.id,
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
    const actualModule = await vi.importActual<
      typeof import("@/db/repositories/assessment-draft-session-repository")
    >("@/db/repositories/assessment-draft-session-repository");
    const repository: AssessmentDraftSessionRepository =
      new actualModule.DrizzleAssessmentDraftSessionRepository(db as never);
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

describe("assessment session routes", () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesMock.mockReset();
    repositoryConstructorMock.mockReset();
    adminStatsEventRepositoryConstructorMock.mockReset();
  });

  it("bootstraps a canonical draft session and sets the anonymous cookie", async () => {
    const cookieStore = new FakeCookiesStore();
    const repository = new FakeDraftSessionRepository();
    const adminStatsEventRepository = new FakeAdminStatsEventRepository();

    cookiesMock.mockResolvedValue(cookieStore);
    repositoryConstructorMock.mockImplementation(() => repository);
    adminStatsEventRepositoryConstructorMock.mockImplementation(
      () => adminStatsEventRepository,
    );

    const { POST } = await import("@/app/api/assessment-session/route");
    const response = await POST(
      new Request("http://localhost/api/assessment-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assessmentVersion: assessmentDefinition.version,
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: {
        assessmentVersion: assessmentDefinition.version,
        answers: {},
        progress: {
          answeredCount: 0,
          totalQuestions: assessmentDefinition.questions.length,
          currentQuestionId: assessmentDefinition.questions[0]!.id,
          isComplete: false,
        },
      },
    });
    expect(cookieStore.setCalls).toHaveLength(1);
    expect(cookieStore.setCalls[0]).toEqual({
      name: ASSESSMENT_DRAFT_SESSION_COOKIE.name,
      value: expect.any(String),
      options: ASSESSMENT_DRAFT_SESSION_COOKIE.options,
    });
    expect(adminStatsEventRepository.events).toHaveLength(1);
    expect(adminStatsEventRepository.events[0]?.eventType).toBe(
      ADMIN_STATS_EVENT_TYPES.assessmentStarted,
    );
  });

  it("reuses the cookie-backed draft session on bootstrap and load", async () => {
    const snapshot = buildDraftSnapshot();
    const cookieStore = new FakeCookiesStore({
      [ASSESSMENT_DRAFT_SESSION_COOKIE.name]: "existing-token",
    });
    const repository = new FakeDraftSessionRepository(
      new Map([
        [
          "existing-token",
          {
            id: "draft-existing-token",
            sessionToken: "existing-token",
            assessmentVersion: snapshot.assessmentVersion,
            draftAnswers: snapshot.answers,
            draftProgress: snapshot.progress,
            createdAt: new Date("2026-03-29T12:00:00.000Z"),
            updatedAt: new Date("2026-03-29T12:00:00.000Z"),
          },
        ],
      ]),
    );
    const adminStatsEventRepository = new FakeAdminStatsEventRepository();

    cookiesMock.mockResolvedValue(cookieStore);
    repositoryConstructorMock.mockImplementation(() => repository);
    adminStatsEventRepositoryConstructorMock.mockImplementation(
      () => adminStatsEventRepository,
    );

    const routeModule = await import("@/app/api/assessment-session/route");
    const postResponse = await routeModule.POST(
      new Request("http://localhost/api/assessment-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assessmentVersion: assessmentDefinition.version,
        }),
      }),
    );
    const getResponse = await routeModule.GET();

    await expect(postResponse.json()).resolves.toEqual({
      session: snapshot,
    });
    await expect(getResponse.json()).resolves.toEqual({
      session: snapshot,
    });
    expect(cookieStore.setCalls).toHaveLength(0);
    expect(adminStatsEventRepository.events).toEqual([]);
  });

  it("resets a stored legacy-version draft session during active-version bootstrap", async () => {
    const legacySnapshot = buildLegacyDraftSnapshot();
    const cookieStore = new FakeCookiesStore({
      [ASSESSMENT_DRAFT_SESSION_COOKIE.name]: "legacy-token",
    });
    const repository = new FakeDraftSessionRepository(
      new Map([
        [
          "legacy-token",
          {
            id: "draft-legacy-token",
            sessionToken: "legacy-token",
            assessmentVersion: legacySnapshot.assessmentVersion,
            draftAnswers: legacySnapshot.answers,
            draftProgress: legacySnapshot.progress,
            createdAt: new Date("2026-03-29T12:00:00.000Z"),
            updatedAt: new Date("2026-03-29T12:00:00.000Z"),
          },
        ],
      ]),
    );
    const adminStatsEventRepository = new FakeAdminStatsEventRepository();

    cookiesMock.mockResolvedValue(cookieStore);
    repositoryConstructorMock.mockImplementation(() => repository);
    adminStatsEventRepositoryConstructorMock.mockImplementation(
      () => adminStatsEventRepository,
    );

    const routeModule = await import("@/app/api/assessment-session/route");
    const postResponse = await routeModule.POST(
      new Request("http://localhost/api/assessment-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assessmentVersion: assessmentDefinition.version,
        }),
      }),
    );
    const getResponse = await routeModule.GET();

    await expect(postResponse.json()).resolves.toEqual({
      session: {
        assessmentVersion: assessmentDefinition.version,
        answers: {},
        progress: {
          answeredCount: 0,
          totalQuestions: assessmentDefinition.questions.length,
          currentQuestionId: assessmentDefinition.questions[0]!.id,
          isComplete: false,
        },
      },
    });
    await expect(getResponse.json()).resolves.toEqual({
      session: {
        assessmentVersion: assessmentDefinition.version,
        answers: {},
        progress: {
          answeredCount: 0,
          totalQuestions: assessmentDefinition.questions.length,
          currentQuestionId: assessmentDefinition.questions[0]!.id,
          isComplete: false,
        },
      },
    });
    expect(cookieStore.setCalls).toEqual([
      {
        name: ASSESSMENT_DRAFT_SESSION_COOKIE.name,
        value: "legacy-token",
        options: ASSESSMENT_DRAFT_SESSION_COOKIE.options,
      },
    ]);
    expect(adminStatsEventRepository.events).toHaveLength(1);
    expect(adminStatsEventRepository.events[0]?.eventType).toBe(
      ADMIN_STATS_EVENT_TYPES.assessmentStarted,
    );
  });

  it("clears the canonical draft session through an explicit delete boundary", async () => {
    const snapshot = buildDraftSnapshot();
    const cookieStore = new FakeCookiesStore({
      [ASSESSMENT_DRAFT_SESSION_COOKIE.name]: "existing-token",
    });
    const repository = new FakeDraftSessionRepository(
      new Map([
        [
          "existing-token",
          {
            id: "draft-existing-token",
            sessionToken: "existing-token",
            assessmentVersion: snapshot.assessmentVersion,
            draftAnswers: snapshot.answers,
            draftProgress: snapshot.progress,
            createdAt: new Date("2026-03-29T12:00:00.000Z"),
            updatedAt: new Date("2026-03-29T12:00:00.000Z"),
          },
        ],
      ]),
    );

    cookiesMock.mockResolvedValue(cookieStore);
    repositoryConstructorMock.mockImplementation(() => repository);

    const { DELETE, GET } = await import("@/app/api/assessment-session/route");
    const response = await DELETE();

    expect(response.status).toBe(204);
    expect(cookieStore.deleteCalls).toEqual([ASSESSMENT_DRAFT_SESSION_COOKIE.name]);
    await expect(GET().then((getResponse) => getResponse.json())).resolves.toEqual({
      error: {
        code: "ASSESSMENT_SESSION_NOT_FOUND",
        message: "No anonymous assessment draft session was found.",
      },
    });
  });

  it("updates the canonical draft through the draft route", async () => {
    const snapshot = buildDraftSnapshot();
    const nextSnapshot: AssessmentDraftSessionSnapshot = {
      assessmentVersion: snapshot.assessmentVersion,
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
    };
    const cookieStore = new FakeCookiesStore({
      [ASSESSMENT_DRAFT_SESSION_COOKIE.name]: "existing-token",
    });
    const repository = new FakeDraftSessionRepository(
      new Map([
        [
          "existing-token",
          {
            id: "draft-existing-token",
            sessionToken: "existing-token",
            assessmentVersion: snapshot.assessmentVersion,
            draftAnswers: snapshot.answers,
            draftProgress: snapshot.progress,
            createdAt: new Date("2026-03-29T12:00:00.000Z"),
            updatedAt: new Date("2026-03-29T12:00:00.000Z"),
          },
        ],
      ]),
    );

    cookiesMock.mockResolvedValue(cookieStore);
    repositoryConstructorMock.mockImplementation(() => repository);

    const { PATCH } = await import("@/app/api/assessment-session/draft/route");
    const response = await PATCH(
      new Request("http://localhost/api/assessment-session/draft", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nextSnapshot),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: nextSnapshot,
    });
  });

  it("rejects draft updates with stale assessment versions", async () => {
    const cookieStore = new FakeCookiesStore({
      [ASSESSMENT_DRAFT_SESSION_COOKIE.name]: "existing-token",
    });
    const repository = new FakeDraftSessionRepository(
      new Map([
        [
          "existing-token",
          {
            id: "draft-existing-token",
            sessionToken: "existing-token",
            assessmentVersion: assessmentDefinition.version,
            draftAnswers: {},
            draftProgress: {
              answeredCount: 0,
              totalQuestions: assessmentDefinition.questions.length,
              currentQuestionId: assessmentDefinition.questions[0]!.id,
              isComplete: false,
            },
            createdAt: new Date("2026-03-29T12:00:00.000Z"),
            updatedAt: new Date("2026-03-29T12:00:00.000Z"),
          },
        ],
      ]),
    );

    cookiesMock.mockResolvedValue(cookieStore);
    repositoryConstructorMock.mockImplementation(() => repository);

    const { PATCH } = await import("@/app/api/assessment-session/draft/route");
    const response = await PATCH(
      new Request("http://localhost/api/assessment-session/draft", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assessmentVersion: "legacy-version",
          answers: {},
          progress: {
            answeredCount: 0,
            totalQuestions: assessmentDefinition.questions.length,
            currentQuestionId: assessmentDefinition.questions[0]!.id,
            isComplete: false,
          },
        }),
      }),
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "ASSESSMENT_VERSION_MISMATCH",
        message: "Draft payload assessment version does not match the canonical session.",
      },
    });
  });

  it("returns an anonymous-session error when no cookie-backed draft exists", async () => {
    const cookieStore = new FakeCookiesStore();
    const repository = new FakeDraftSessionRepository();

    cookiesMock.mockResolvedValue(cookieStore);
    repositoryConstructorMock.mockImplementation(() => repository);

    const { GET } = await import("@/app/api/assessment-session/route");
    const response = await GET();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "ASSESSMENT_SESSION_NOT_FOUND",
        message: "No anonymous assessment draft session was found.",
      },
    });
  });
});
