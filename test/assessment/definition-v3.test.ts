import { describe, expect, it } from "vitest";

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
});
