import { describe, expect, it } from "vitest";

import { assessmentDefinitionV3 } from "@/content/assessments/ko/v3";
import { scoreAssessment } from "@/domain/assessment/scoring";
import type {
  EnneagramType,
  ForcedChoiceAssessmentQuestion,
  ForcedChoiceSide,
} from "@/domain/assessment/types";

const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];
const questions = assessmentDefinitionV3.questions as readonly ForcedChoiceAssessmentQuestion[];

function buildAnswers(
  resolver: (
    question: ForcedChoiceAssessmentQuestion,
    index: number,
  ) => ForcedChoiceSide,
) {
  return questions.map((question, index) => ({
    questionId: question.id,
    selectedSide: resolver(question, index),
  }));
}

function buildTypeFocusedAnswers(typeId: EnneagramType) {
  const provisionalScores = Object.fromEntries(
    enneagramTypes.map((candidateTypeId) => [candidateTypeId, 0]),
  ) as Record<EnneagramType, number>;

  return buildAnswers((question) => {
    if (question.left.keyedType === typeId) {
      provisionalScores[typeId] += 1;
      return "left";
    }

    if (question.right.keyedType === typeId) {
      provisionalScores[typeId] += 1;
      return "right";
    }

    const selectedSide =
      provisionalScores[question.left.keyedType] <= provisionalScores[question.right.keyedType]
        ? "left"
        : "right";
    const selectedType =
      selectedSide === "left" ? question.left.keyedType : question.right.keyedType;

    provisionalScores[selectedType] += 1;

    return selectedSide;
  });
}

function buildPairFocusedAnswers(
  [typeA, typeB]: readonly [EnneagramType, EnneagramType],
) {
  const answers = buildTypeFocusedAnswers(typeA);
  let primaryReductions = 0;
  let secondaryBoosts = 0;
  let pairAlternation = 0;

  for (const [index, question] of questions.entries()) {
    const primarySide =
      question.left.keyedType === typeA
        ? "left"
        : question.right.keyedType === typeA
          ? "right"
          : null;
    const secondarySide =
      question.left.keyedType === typeB
        ? "left"
        : question.right.keyedType === typeB
          ? "right"
          : null;

    if (primarySide && secondarySide) {
      answers[index] = {
        questionId: question.id,
        selectedSide: pairAlternation % 2 === 0 ? primarySide : secondarySide,
      };
      pairAlternation += 1;
      continue;
    }

    if (
      primarySide &&
      secondarySide === null &&
      question.pairCategory === "baseline" &&
      primaryReductions < 2
    ) {
      answers[index] = {
        questionId: question.id,
        selectedSide: primarySide === "left" ? "right" : "left",
      };
      primaryReductions += 1;
      continue;
    }

    if (
      secondarySide &&
      primarySide === null &&
      question.pairCategory === "baseline" &&
      secondaryBoosts < 5
    ) {
      answers[index] = {
        questionId: question.id,
        selectedSide: secondarySide,
      };
      secondaryBoosts += 1;
    }
  }

  return answers;
}

describe("scoreAssessment v3", () => {
  it.each([8, 3, 4, 5] as const)(
    "produces a clear %s-dominant profile from forced-choice answers",
    (typeId) => {
      const result = scoreAssessment({
        assessmentVersion: assessmentDefinitionV3.version,
        answers: buildTypeFocusedAnswers(typeId),
      });

      expect(result.primaryType).toBe(typeId);
      expect(result.resultStatus).toBe("clear");
      expect(result.rawScores[typeId]).toBe(12);
      expect(result.normalizedScores[typeId]).toBe(100);
      expect(result.wingType).toBeNull();
    },
  );

  it("normalizes scores by exposure count instead of forcing the full distribution to sum to 100", () => {
    const result = scoreAssessment({
      assessmentVersion: assessmentDefinitionV3.version,
      answers: buildTypeFocusedAnswers(8),
    });

    const normalizedTotal = Object.values(result.normalizedScores).reduce(
      (sum, score) => sum + score,
      0,
    );

    expect(result.normalizedScores[8]).toBe(result.rawScores[8] / 12 * 100);
    expect(normalizedTotal).not.toBe(100);
  });

  it.each([
    [3, 8],
    [4, 5],
    [6, 9],
  ] as const)(
    "does not overstate discriminator pair %s-%s as a clear result",
    (typeA, typeB) => {
      const result = scoreAssessment({
        assessmentVersion: assessmentDefinitionV3.version,
        answers: buildPairFocusedAnswers([typeA, typeB]),
      });

      expect([result.primaryType, ...result.nearbyTypes.map((item) => item.typeId)]).toEqual(
        expect.arrayContaining([typeA, typeB]),
      );
      expect(result.resultStatus).not.toBe("clear");
      expect(result.wingType).toBeNull();
    },
  );

  it("keeps all nine raw score buckets within the fixed 0-12 exposure range", () => {
    const result = scoreAssessment({
      assessmentVersion: assessmentDefinitionV3.version,
      answers: buildTypeFocusedAnswers(1),
    });

    for (const typeId of enneagramTypes) {
      expect(result.rawScores[typeId]).toBeGreaterThanOrEqual(0);
      expect(result.rawScores[typeId]).toBeLessThanOrEqual(12);
      expect(result.normalizedScores[typeId]).toBeGreaterThanOrEqual(0);
      expect(result.normalizedScores[typeId]).toBeLessThanOrEqual(100);
    }
  });
});
