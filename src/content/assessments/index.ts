import { assessmentDefinition as assessmentDefinitionV1 } from "@/content/assessments/ko/v1";
import { assessmentDefinitionV2 } from "@/content/assessments/ko/v2";
import { assessmentDefinitionV3 } from "@/content/assessments/ko/v3";
import type { AssessmentDefinition } from "@/domain/assessment/types";

export const assessmentDefinitionsByVersion: Record<string, AssessmentDefinition> = {
  [assessmentDefinitionV1.version]: assessmentDefinitionV1,
  [assessmentDefinitionV2.version]: assessmentDefinitionV2,
  [assessmentDefinitionV3.version]: assessmentDefinitionV3,
};

export const assessmentDefinition = assessmentDefinitionV3;
export const likertOptions = assessmentDefinition.likertOptions;

export function resolveAssessmentDefinition(
  version: string,
): AssessmentDefinition | null {
  return assessmentDefinitionsByVersion[version] ?? null;
}
