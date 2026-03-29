import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import type { AssessmentResultRecord } from "@/db/schema";
import {
  ASSESSMENT_DRAFT_SESSION_COOKIE,
  readAssessmentDraftSessionToken,
} from "@/domain/assessment/draft-session";
import type { AssessmentResultSnapshotDraft } from "@/domain/assessment/result-snapshot";

function buildPrimaryFocusedAnswers(typeId: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) {
  return assessmentDefinition.questions.map((question) => {
    const targetFiveWeight = question.typeWeights[typeId][4];
    const hasStrictHighestFiveWeight = Object.entries(question.typeWeights).every(
      ([candidateTypeId, weights]) =>
        Number(candidateTypeId) === typeId || targetFiveWeight > weights[4],
    );

    return {
      questionId: question.id,
      value: hasStrictHighestFiveWeight ? 5 : 1,
    } as const;
  });
}

const repositoryState: {
  saveCalls: AssessmentResultSnapshotDraft[];
  savedRecord: AssessmentResultRecord | null;
} = {
  saveCalls: [],
  savedRecord: null,
};

const {
  cookiesMock,
  finalizeDraftSessionMock,
  findDraftSessionMock,
} = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  finalizeDraftSessionMock: vi.fn(),
  findDraftSessionMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/db/repositories/assessment-result-repository", () => {
  class MockAssessmentResultRepository {
    async save(snapshot: AssessmentResultSnapshotDraft): Promise<AssessmentResultRecord> {
      repositoryState.saveCalls.push(snapshot);

      if (!repositoryState.savedRecord) {
        throw new Error("savedRecord must be configured by the test");
      }

      return repositoryState.savedRecord;
    }

    async findById(): Promise<null> {
      return null;
    }

    async findByPublicId(): Promise<null> {
      return null;
    }
  }

  return {
    DrizzleAssessmentResultRepository: MockAssessmentResultRepository,
  };
});

vi.mock("@/db/repositories/assessment-draft-session-repository", () => {
  class MockAssessmentDraftSessionRepository {
    findBySessionToken = findDraftSessionMock;
    finalizeDraftSession = finalizeDraftSessionMock;
  }

  return {
    DrizzleAssessmentDraftSessionRepository: MockAssessmentDraftSessionRepository,
  };
});

class FakeCookiesStore {
  constructor(private readonly values = new Map<string, string>()) {}

  get(name: string) {
    const value = this.values.get(name);
    return value ? { name, value } : undefined;
  }
}

let POST: typeof import("@/app/api/assessments/score/route").POST;

async function postJson(body: unknown) {
  return POST(
    new Request("http://localhost/api/assessments/score", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/assessments/score", () => {
  beforeEach(async () => {
    repositoryState.saveCalls = [];
    repositoryState.savedRecord = null;
    cookiesMock.mockResolvedValue(new FakeCookiesStore());
    finalizeDraftSessionMock.mockReset();
    findDraftSessionMock.mockReset();
    ({ POST } = await import("@/app/api/assessments/score/route"));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns status: 200 with the computed result and permanent public link for a valid payload", async () => {
    repositoryState.savedRecord = {
      id: "snapshot-1",
      publicId: "PublicResultTokenValue",
      adminToken: "AdminTokenValueForRouteTest",
      assessmentVersion: assessmentDefinition.version,
      scoringVersion: assessmentDefinition.scoringVersion,
      copyVersion: assessmentDefinition.copyVersion,
      primaryType: "8",
      wingType: "7",
      growthType: "2",
      stressType: "5",
      rawScores: { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 60, 7: 70, 8: 80, 9: 90 },
      normalizedScores: { 1: 11, 2: 22, 3: 33, 4: 44, 5: 55, 6: 66, 7: 77, 8: 88, 9: 99 },
      nearbyTypes: [],
      answers: buildPrimaryFocusedAnswers(8),
      createdAt: new Date("2026-03-29T00:00:00.000Z"),
    };

    const response = await postJson({
      assessmentVersion: assessmentDefinition.version,
      answers: buildPrimaryFocusedAnswers(8),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.result.primaryType).toBe(8);
    expect(payload.result.assessmentVersion).toBe(assessmentDefinition.version);
    expect(payload.publicResult).toEqual({
      publicId: repositoryState.savedRecord.publicId,
      href: `/results/${repositoryState.savedRecord.publicId}`,
    });
  });

  it("persists the immutable snapshot immediately after scoring", async () => {
    const answers = buildPrimaryFocusedAnswers(5);
    repositoryState.savedRecord = {
      id: "snapshot-2",
      publicId: "StoredPublicResultId",
      adminToken: "StoredAdminTokenValueForRoute",
      assessmentVersion: assessmentDefinition.version,
      scoringVersion: assessmentDefinition.scoringVersion,
      copyVersion: assessmentDefinition.copyVersion,
      primaryType: "5",
      wingType: "4",
      growthType: "8",
      stressType: "7",
      rawScores: { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 15, 7: 17, 8: 19, 9: 12 },
      normalizedScores: { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 15, 7: 17, 8: 19, 9: 12 },
      nearbyTypes: [],
      answers,
      createdAt: new Date("2026-03-29T01:00:00.000Z"),
    };

    const response = await postJson({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    expect(response.status).toBe(200);
    expect(repositoryState.saveCalls).toHaveLength(1);
    expect(repositoryState.saveCalls[0].answers).toEqual(answers);
    expect(repositoryState.saveCalls[0].assessmentVersion).toBe(
      assessmentDefinition.version,
    );
    expect(repositoryState.saveCalls[0].copyVersion).toBe(
      assessmentDefinition.copyVersion,
    );
    expect(repositoryState.saveCalls[0].publicId).toMatch(/^[A-Za-z]+$/);
  });

  it("finalizes the canonical anonymous draft session after a successful submit", async () => {
    repositoryState.savedRecord = {
      id: "snapshot-3",
      publicId: "FinalizedPublicResultId",
      adminToken: "StoredAdminTokenValueForFinalize",
      assessmentVersion: assessmentDefinition.version,
      scoringVersion: assessmentDefinition.scoringVersion,
      copyVersion: assessmentDefinition.copyVersion,
      primaryType: "1",
      wingType: "9",
      growthType: "7",
      stressType: "4",
      rawScores: { 1: 90, 2: 20, 3: 15, 4: 13, 5: 10, 6: 12, 7: 22, 8: 18, 9: 25 },
      normalizedScores: { 1: 90, 2: 20, 3: 15, 4: 13, 5: 10, 6: 12, 7: 22, 8: 18, 9: 25 },
      nearbyTypes: [],
      answers: buildPrimaryFocusedAnswers(1),
      createdAt: new Date("2026-03-29T02:00:00.000Z"),
    };

    const sessionToken = readAssessmentDraftSessionToken("existing-draft-token");
    cookiesMock.mockResolvedValue(
      new FakeCookiesStore(
        new Map([[ASSESSMENT_DRAFT_SESSION_COOKIE.name, "existing-draft-token"]]),
      ),
    );
    findDraftSessionMock.mockResolvedValue({
      id: "draft-session-1",
      sessionToken,
    });

    const response = await postJson({
      assessmentVersion: assessmentDefinition.version,
      answers: buildPrimaryFocusedAnswers(1),
    });

    expect(response.status).toBe(200);
    expect(findDraftSessionMock).toHaveBeenCalledWith("existing-draft-token");
    expect(finalizeDraftSessionMock).toHaveBeenCalledWith("existing-draft-token");
  });

  it("returns 400 for invalid payload shape", async () => {
    const response = await postJson({
      assessmentVersion: assessmentDefinition.version,
      answers: [{ questionId: "q_001", value: 6 }],
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_PAYLOAD_SHAPE");
    expect(finalizeDraftSessionMock).not.toHaveBeenCalled();
  });

  it("returns 400 for an unknown assessmentVersion", async () => {
    const response = await postJson({
      assessmentVersion: "ko-enneagram-v999",
      answers: buildPrimaryFocusedAnswers(8),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("UNKNOWN_ASSESSMENT_VERSION");
    expect(finalizeDraftSessionMock).not.toHaveBeenCalled();
  });

  it("returns 400 for duplicate questionId values", async () => {
    const answers = buildPrimaryFocusedAnswers(8);
    const duplicateAnswers = answers.map((answer, index) =>
      index === 1 ? { ...answer, questionId: answers[0].questionId } : answer,
    );
    const response = await postJson({
      assessmentVersion: assessmentDefinition.version,
      answers: duplicateAnswers,
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("DUPLICATE_QUESTION_ID");
  });

  it("returns 400 for incomplete answer coverage", async () => {
    const response = await postJson({
      assessmentVersion: assessmentDefinition.version,
      answers: buildPrimaryFocusedAnswers(8).slice(0, -1),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INCOMPLETE_ANSWER_COVERAGE");
  });
});
