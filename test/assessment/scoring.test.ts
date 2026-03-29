import { describe, expect, it } from "vitest";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import {
  NORMALIZATION_FORMULA,
  PRIMARY_TYPE_TIE_BREAK,
  WING_TIE_BREAK,
} from "@/domain/assessment/constants";
import { scoreAssessment } from "@/domain/assessment/scoring";
import type { EnneagramType } from "@/domain/assessment/types";
import {
  buildEqualTopAnswers,
  buildTypeDominantAnswers,
  buildUniformAnswers,
} from "./fixtures";

function calculateRawScores(
  answers: ReturnType<typeof buildUniformAnswers>,
): Record<EnneagramType, number> {
  const answerByQuestionId = new Map(
    answers.map((answer) => [answer.questionId, answer.value] as const),
  );

  return assessmentDefinition.questions.reduce(
    (totals, question) => {
      const value = answerByQuestionId.get(question.id);

      if (!value) {
        throw new Error(`Missing answer for question ${question.id}`);
      }

      for (const [typeId, weights] of Object.entries(question.typeWeights)) {
        totals[Number(typeId) as EnneagramType] += weights[value - 1];
      }

      return totals;
    },
    {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    } satisfies Record<EnneagramType, number>,
  );
}

describe("scoreAssessment", () => {
  it("highest raw total wins primary type for a dominant result", () => {
    const answers = buildTypeDominantAnswers(8);

    const result = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    expect(result.primaryType).toBe(8);
    expect(result.rawScores[8]).toBeGreaterThan(result.rawScores[7]);
    expect(result.rawScores[8]).toBeGreaterThan(result.rawScores[9]);
  });

  it(`equal top raw totals resolve with PRIMARY_TYPE_TIE_BREAK = ${PRIMARY_TYPE_TIE_BREAK}`, () => {
    const answers = buildEqualTopAnswers([2, 3]);

    const result = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    expect(result.rawScores[2]).toBe(result.rawScores[3]);
    expect(result.primaryType).toBe(2);
  });

  it(`normalized scores use ${NORMALIZATION_FORMULA} and stay chart-ready`, () => {
    const answers = buildTypeDominantAnswers(8);
    const expectedRawScores = calculateRawScores(answers);
    const totalRawScore = Object.values(expectedRawScores).reduce(
      (sum, rawScore) => sum + rawScore,
      0,
    );

    const result = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    for (const typeId of Object.keys(expectedRawScores) as Array<
      `${EnneagramType}`
    >) {
      const numericTypeId = Number(typeId) as EnneagramType;
      const rawScore = expectedRawScores[numericTypeId];
      const expectedNormalizedScore =
        Math.round((rawScore / totalRawScore) * 1000) / 10;

      expect(result.normalizedScores[numericTypeId]).toBe(
        expectedNormalizedScore,
      );
      expect(result.normalizedScores[numericTypeId]).toBeGreaterThanOrEqual(0);
      expect(result.normalizedScores[numericTypeId]).toBeLessThanOrEqual(100);
    }
  });

  it(`wing is chosen from adjacent types only, breaking ties with ${WING_TIE_BREAK}`, () => {
    const answers = buildEqualTopAnswers([1, 2]);

    const result = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    expect(result.primaryType).toBe(1);
    expect(result.rawScores[2]).toBe(result.rawScores[9]);
    expect(result.wingType).toBe(2);
  });

  it("growthType and stressType come from fixed maps keyed by primary type", () => {
    const answers = buildTypeDominantAnswers(5);

    const result = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    expect(result.primaryType).toBe(5);
    expect(result.growthType).toBe(8);
    expect(result.stressType).toBe(7);
  });

  it("nearbyTypes keeps exactly the top 3 non-primary candidates sorted by raw score descending then type id ascending", () => {
    const answers = buildUniformAnswers(5);

    const result = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    expect(result.primaryType).toBe(1);
    expect(result.nearbyTypes).toHaveLength(3);
    expect(result.nearbyTypes.map(({ typeId }) => typeId)).toEqual([2, 9, 3]);

    for (let index = 1; index < result.nearbyTypes.length; index += 1) {
      const previous = result.nearbyTypes[index - 1];
      const current = result.nearbyTypes[index];

      expect(previous.typeId).not.toBe(result.primaryType);
      expect(current.typeId).not.toBe(result.primaryType);

      if (previous.rawScore === current.rawScore) {
        expect(previous.typeId).toBeLessThan(current.typeId);
      } else {
        expect(previous.rawScore).toBeGreaterThanOrEqual(current.rawScore);
      }
    }
  });
});
