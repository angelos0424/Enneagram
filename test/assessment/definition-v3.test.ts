import { describe, expect, it } from "vitest";

import { discriminatorPairReviewsV3 } from "@/content/assessments/ko/v3-discriminator-review";
import { assessmentDefinitionV3 } from "@/content/assessments/ko/v3";
import { typeCopyDefinitionV3 } from "@/content/type-copy/ko/v3";
import {
  ASSESSMENT_VERSION_V3,
  COPY_VERSION_V3,
  SCORING_VERSION_V3,
} from "@/domain/assessment/constants";
import type {
  AssessmentDimension,
  EnneagramType,
} from "@/domain/assessment/types";

const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];
const expectedDimensions = new Set<AssessmentDimension>([
  "motivation",
  "attention",
  "defense",
  "interpersonal",
]);
const expectedDiscriminatorPairs = new Map<string, number>([
  ["1-6", 3],
  ["2-9", 3],
  ["3-8", 3],
  ["4-5", 3],
  ["6-9", 3],
  ["7-8", 3],
]);

function pairKey(leftType: EnneagramType, rightType: EnneagramType) {
  return [leftType, rightType].sort((left, right) => left - right).join("-");
}

describe("assessmentDefinitionV3", () => {
  it("exposes the version trio for the forced-choice v3 contract", () => {
    expect(assessmentDefinitionV3.version).toBe(ASSESSMENT_VERSION_V3);
    expect(assessmentDefinitionV3.scoringVersion).toBe(SCORING_VERSION_V3);
    expect(assessmentDefinitionV3.copyVersion).toBe(COPY_VERSION_V3);
    expect(assessmentDefinitionV3.responseStyle).toBe("forced-choice");
    expect(assessmentDefinitionV3.likertOptions).toEqual([]);
    expect(typeCopyDefinitionV3.copyVersion).toBe(COPY_VERSION_V3);
  });

  it("ships 54 forced-choice questions with distinct type pairings", () => {
    expect(assessmentDefinitionV3.questions).toHaveLength(54);
    expect(new Set(assessmentDefinitionV3.questions.map((question) => question.id)).size).toBe(
      assessmentDefinitionV3.questions.length,
    );

    for (const question of assessmentDefinitionV3.questions) {
      expect(question.left.prompt.length).toBeGreaterThan(0);
      expect(question.right.prompt.length).toBeGreaterThan(0);
      expect(question.left.keyedType).not.toBe(question.right.keyedType);
      expect(expectedDimensions.has(question.left.dimension)).toBe(true);
      expect(expectedDimensions.has(question.right.dimension)).toBe(true);
    }
  });

  it("balances total type exposure to 12 and keeps every type represented across all four dimensions", () => {
    const exposureCountByType = Object.fromEntries(
      enneagramTypes.map((typeId) => [typeId, 0]),
    ) as Record<EnneagramType, number>;
    const dimensionCountByType = Object.fromEntries(
      enneagramTypes.map((typeId) => [
        typeId,
        { motivation: 0, attention: 0, defense: 0, interpersonal: 0 },
      ]),
    ) as Record<EnneagramType, Record<AssessmentDimension, number>>;

    for (const question of assessmentDefinitionV3.questions) {
      exposureCountByType[question.left.keyedType] += 1;
      exposureCountByType[question.right.keyedType] += 1;
      dimensionCountByType[question.left.keyedType][question.left.dimension] += 1;
      dimensionCountByType[question.right.keyedType][question.right.dimension] += 1;
    }

    for (const typeId of enneagramTypes) {
      expect(exposureCountByType[typeId]).toBe(12);
      expect(new Set(Object.keys(dimensionCountByType[typeId]))).toEqual(expectedDimensions);

      for (const dimension of expectedDimensions) {
        expect(dimensionCountByType[typeId][dimension]).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("includes exactly six discriminator pair families with three questions each", () => {
    const discriminatorCounts = new Map<string, number>();
    const discriminatorQuestions = assessmentDefinitionV3.questions.filter(
      (question) => question.pairCategory === "discriminator",
    );

    expect(discriminatorQuestions).toHaveLength(18);

    for (const question of discriminatorQuestions) {
      const key = pairKey(question.left.keyedType, question.right.keyedType);
      discriminatorCounts.set(key, (discriminatorCounts.get(key) ?? 0) + 1);
    }

    expect(discriminatorCounts).toEqual(expectedDiscriminatorPairs);
  });

  it("documents a reference-backed review for every discriminator family", () => {
    const questionById = new Map(
      assessmentDefinitionV3.questions.map((question) => [question.id, question] as const),
    );

    expect(discriminatorPairReviewsV3).toHaveLength(expectedDiscriminatorPairs.size);

    for (const review of discriminatorPairReviewsV3) {
      expect(expectedDiscriminatorPairs.get(review.familyKey)).toBe(review.questionIds.length);
      expect(review.references.length).toBeGreaterThan(0);
      expect(review.summary.length).toBeGreaterThan(0);

      const actualDimensions = review.questionIds.map((questionId) => {
        const question = questionById.get(questionId);

        expect(question).toBeDefined();
        expect(question?.pairCategory).toBe("discriminator");

        const key = pairKey(question!.left.keyedType, question!.right.keyedType);

        expect(key).toBe(review.familyKey);
        expect(question!.left.dimension).toBe(question!.right.dimension);

        return question!.left.dimension;
      });

      expect(actualDimensions).toEqual(review.expectedDimensions);
    }
  });

  it("keeps the issue-reported 4-5 and 6-9 examples in reviewed discriminator slots", () => {
    const issuePromptPairs = [
      [
        "나는 분위기보다 내 안의 미묘한 감정 변화를 먼저 느낀다.",
        "나는 사람보다 정보와 구조를 먼저 파악하려는 편이다.",
        "4-5",
        "attention",
      ],
      [
        "나는 불확실할수록 검증된 기준과 지지가 필요하다고 느낀다.",
        "나는 강한 긴장보다 평온하고 무리 없는 상태를 더 원한다.",
        "6-9",
        "motivation",
      ],
    ] as const;

    for (const [leftPrompt, rightPrompt, familyKey, dimension] of issuePromptPairs) {
      const question = assessmentDefinitionV3.questions.find(
        (candidate) =>
          candidate.left.prompt === leftPrompt && candidate.right.prompt === rightPrompt,
      );

      expect(question).toBeDefined();
      expect(question?.pairCategory).toBe("discriminator");
      expect(pairKey(question!.left.keyedType, question!.right.keyedType)).toBe(familyKey);
      expect(question?.left.dimension).toBe(dimension);
      expect(question?.right.dimension).toBe(dimension);
      expect(
        discriminatorPairReviewsV3.some((review) =>
          review.questionIds.some((questionId) => questionId === question!.id),
        ),
      ).toBe(true);
    }
  });
});
