import { describe, expect, it } from "vitest";

import { assessmentDefinitionV2 } from "@/content/assessments/ko/v2";
import { scoreAssessment } from "@/domain/assessment/scoring";
import type {
  EnneagramType,
  KeyedAssessmentQuestion,
  LikertValue,
} from "@/domain/assessment/types";

const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];

function buildAnswers(
  resolver: (question: KeyedAssessmentQuestion) => LikertValue,
) {
  return assessmentDefinitionV2.questions.map((question) => ({
    questionId: question.id,
    value: resolver(question),
  }));
}

function buildUniformAnswers(value: LikertValue) {
  return buildAnswers(() => value);
}

function buildPrimaryFocusedAnswers(typeId: EnneagramType) {
  return buildAnswers((question) => {
    if (question.keyedType !== typeId) {
      return 3;
    }

    return question.reverse ? 1 : 5;
  });
}

function buildPairFocusedAnswers(
  [typeA, typeB]: readonly [EnneagramType, EnneagramType],
) {
  return buildAnswers((question) => {
    if (question.keyedType !== typeA && question.keyedType !== typeB) {
      return 3;
    }

    return question.reverse ? 1 : 5;
  });
}

describe("scoreAssessment v2", () => {
  it("maps uniform midpoint answers to centered zero raw scores and non-probabilistic independent normalization", () => {
    const result = scoreAssessment({
      assessmentVersion: assessmentDefinitionV2.version,
      answers: buildUniformAnswers(3),
    });

    expect(result.resultStatus).toBe("insufficient_variance");

    for (const typeId of enneagramTypes) {
      expect(result.rawScores[typeId]).toBe(0);
      expect(result.normalizedScores[typeId]).toBe(50);
    }

    const normalizedTotal = Object.values(result.normalizedScores).reduce(
      (sum, score) => sum + score,
      0,
    );

    expect(normalizedTotal).not.toBe(100);
  });

  it("applies reverse-scored items by flipping the centered sign", () => {
    const reverseQuestion = assessmentDefinitionV2.questions.find(
      (question) => question.keyedType === 1 && question.reverse,
    );

    expect(reverseQuestion).toBeDefined();

    const lowAgreement = scoreAssessment({
      assessmentVersion: assessmentDefinitionV2.version,
      answers: buildAnswers((question) =>
        question.id === reverseQuestion?.id ? 1 : 3,
      ),
    });
    const highAgreement = scoreAssessment({
      assessmentVersion: assessmentDefinitionV2.version,
      answers: buildAnswers((question) =>
        question.id === reverseQuestion?.id ? 5 : 3,
      ),
    });

    expect(lowAgreement.rawScores[1]).toBe(2);
    expect(highAgreement.rawScores[1]).toBe(-2);
  });

  it("produces a clear dominant profile when one type's keyed items are strongly endorsed", () => {
    const result = scoreAssessment({
      assessmentVersion: assessmentDefinitionV2.version,
      answers: buildPrimaryFocusedAnswers(8),
    });

    expect(result.primaryType).toBe(8);
    expect(result.resultStatus).toBe("clear");
    expect(result.rawScores[8]).toBe(8);
    expect(result.normalizedScores[8]).toBe(100);

    for (const typeId of enneagramTypes.filter((candidate) => candidate !== 8)) {
      expect(result.rawScores[typeId]).toBe(0);
      expect(result.normalizedScores[typeId]).toBe(50);
    }
  });

  it("marks tied top profiles as mixed instead of treating the gap as clear", () => {
    const result = scoreAssessment({
      assessmentVersion: assessmentDefinitionV2.version,
      answers: buildPairFocusedAnswers([2, 3]),
    });

    expect(result.rawScores[2]).toBe(result.rawScores[3]);
    expect(result.resultStatus).toBe("mixed");
    expect(result.confidenceScore).toBe(0);
  });
});
