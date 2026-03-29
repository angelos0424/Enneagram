import { describe, expect, it } from "vitest";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import { POST } from "@/app/api/assessments/score/route";

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
  it("returns status: 200 with the computed result for a valid payload", async () => {
    const response = await postJson({
      assessmentVersion: assessmentDefinition.version,
      answers: buildPrimaryFocusedAnswers(8),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.result.primaryType).toBe(8);
    expect(payload.result.assessmentVersion).toBe(assessmentDefinition.version);
  });

  it("returns 400 for invalid payload shape", async () => {
    const response = await postJson({
      assessmentVersion: assessmentDefinition.version,
      answers: [{ questionId: "q_001", value: 6 }],
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_PAYLOAD_SHAPE");
  });

  it("returns 400 for an unknown assessmentVersion", async () => {
    const response = await postJson({
      assessmentVersion: "ko-enneagram-v999",
      answers: buildPrimaryFocusedAnswers(8),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("UNKNOWN_ASSESSMENT_VERSION");
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
