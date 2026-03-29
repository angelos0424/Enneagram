import { describe, expect, it } from "vitest";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import { typeCopyDefinition, typeCopyEntries } from "@/content/type-copy/ko/v1";
import {
  ASSESSMENT_VERSION,
  COPY_VERSION,
  NEARBY_TYPE_LIMIT,
  PHASE_1_PERSISTENCE_SCOPE,
  SCORING_VERSION,
} from "@/domain/assessment/constants";

describe("assessmentDefinition", () => {
  it("keeps a single authoritative assessment version in sync with constants", () => {
    expect(new Set([assessmentDefinition.version])).toEqual(
      new Set([ASSESSMENT_VERSION]),
    );
    expect(assessmentDefinition.version).toBe(ASSESSMENT_VERSION);
    expect(assessmentDefinition.scoringVersion).toBe(SCORING_VERSION);
    expect(assessmentDefinition.copyVersion).toBe(COPY_VERSION);
    expect(typeCopyDefinition.copyVersion).toBe(COPY_VERSION);
  });

  it("exposes the agreed five Korean likert labels", () => {
    expect(assessmentDefinition.likertOptions.map((option) => option.label)).toEqual([
      "전혀 나와 맞지 않는다",
      "별로 맞지 않는다",
      "반반이다",
      "꽤 맞는다",
      "매우 잘 맞는다",
    ]);
  });

  it("exports 18 ordered questions with deterministic weight maps", () => {
    expect(assessmentDefinition.questions).toHaveLength(18);
    expect(assessmentDefinition.questions.map((question) => question.id)).toEqual([
      "q_001",
      "q_002",
      "q_003",
      "q_004",
      "q_005",
      "q_006",
      "q_007",
      "q_008",
      "q_009",
      "q_010",
      "q_011",
      "q_012",
      "q_013",
      "q_014",
      "q_015",
      "q_016",
      "q_017",
      "q_018",
    ]);

    for (const question of assessmentDefinition.questions) {
      expect(Object.keys(question.typeWeights)).toHaveLength(9);

      for (const weights of Object.values(question.typeWeights)) {
        expect(weights).toHaveLength(5);
      }
    }
  });

  it("keeps downstream policy constants explicit for later plans", () => {
    expect(NEARBY_TYPE_LIMIT).toBe(3);
    expect(PHASE_1_PERSISTENCE_SCOPE).toBe(
      "schema-and-repository-contract-only",
    );
  });

  it("ships a real copy catalog for all nine types", () => {
    expect(Object.keys(typeCopyEntries)).toHaveLength(9);
    expect(Object.values(typeCopyEntries).every((entry) => entry.disclaimerTone === "interpretive")).toBe(true);
  });
});
