import { describe, expect, it } from "vitest";

import { discriminatorPairReviewsV3 } from "@/content/assessments/ko/v3-discriminator-review";
import { assessmentDefinitionV3 } from "@/content/assessments/ko/v3";
import type { EnneagramType } from "@/domain/assessment/types";

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

describe("assessmentDefinitionV3 discriminator review", () => {
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
