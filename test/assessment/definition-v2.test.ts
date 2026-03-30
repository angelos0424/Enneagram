import { describe, expect, it } from "vitest";

import { assessmentDefinitionV2 } from "@/content/assessments/ko/v2";
import { typeCopyDefinitionV2 } from "@/content/type-copy/ko/v2";
import {
  ASSESSMENT_VERSION_V2,
  COPY_VERSION_V2,
  SCORING_VERSION_V2,
} from "@/domain/assessment/constants";
import type { AssessmentDimension, EnneagramType } from "@/domain/assessment/types";

const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];
const expectedDimensions = new Set<AssessmentDimension>([
  "motivation",
  "attention",
  "defense",
  "interpersonal",
]);

describe("assessmentDefinitionV2", () => {
  it("exposes the version trio for the v2 assessment contract", () => {
    expect(assessmentDefinitionV2.version).toBe(ASSESSMENT_VERSION_V2);
    expect(assessmentDefinitionV2.scoringVersion).toBe(SCORING_VERSION_V2);
    expect(assessmentDefinitionV2.copyVersion).toBe(COPY_VERSION_V2);
    expect(typeCopyDefinitionV2.copyVersion).toBe(COPY_VERSION_V2);
  });

  it("ships 36 keyed questions with explicit dimensions and reverse support", () => {
    expect(assessmentDefinitionV2.questions).toHaveLength(36);
    expect(new Set(assessmentDefinitionV2.questions.map((question) => question.id)).size).toBe(
      assessmentDefinitionV2.questions.length,
    );

    for (const question of assessmentDefinitionV2.questions) {
      expect(question.prompt.length).toBeGreaterThan(0);
      expect(enneagramTypes).toContain(question.keyedType);
      expect(typeof question.reverse).toBe("boolean");
      expect(expectedDimensions.has(question.dimension)).toBe(true);
    }
  });

  it("covers all four dimensions exactly once per type and includes reverse items for every type", () => {
    for (const typeId of enneagramTypes) {
      const questionsForType = assessmentDefinitionV2.questions.filter(
        (question) => question.keyedType === typeId,
      );

      expect(questionsForType).toHaveLength(4);
      expect(new Set(questionsForType.map((question) => question.dimension))).toEqual(
        expectedDimensions,
      );
      expect(questionsForType.some((question) => question.reverse)).toBe(true);
    }
  });
});
