import { describe, expect, it } from "vitest";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import {
  buildAssessmentResultSnapshot,
} from "@/domain/assessment/result-snapshot";
import { scoreAssessment } from "@/domain/assessment/scoring";

import { buildTypeDominantAnswers } from "./fixtures";

function expectOpaqueToken(token: string, minimumLength: number) {
  expect(token).toMatch(/^[A-Za-z]+$/);
  expect(token.length).toBeGreaterThanOrEqual(minimumLength);
}

describe("assessment result persistence", () => {
  it("includes the Phase 1 version trio with a generated opaque publicId", () => {
    const answers = buildTypeDominantAnswers(8);
    const scoredResult = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });
    const createdAt = new Date("2026-03-29T00:00:00.000Z");

    const snapshot = buildAssessmentResultSnapshot(scoredResult, answers, createdAt);

    expect(snapshot.assessmentVersion).toBe(scoredResult.assessmentVersion);
    expect(snapshot.scoringVersion).toBe(scoredResult.scoringVersion);
    expect(snapshot.copyVersion).toBe(scoredResult.copyVersion);
    expect(snapshot.createdAt).toEqual(createdAt);
    expectOpaqueToken(snapshot.publicId, 20);
  });

  it("carries an admin-only management token without leaking readable share data", () => {
    const answers = buildTypeDominantAnswers(5);
    const scoredResult = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    const snapshot = buildAssessmentResultSnapshot(scoredResult, answers);

    expectOpaqueToken(snapshot.publicId, 20);
    expectOpaqueToken(snapshot.adminToken, 32);
    expect(snapshot.adminToken).not.toBe(snapshot.publicId);
    expect(snapshot.publicId.toLowerCase()).not.toContain("type");
    expect(snapshot.adminToken.toLowerCase()).not.toContain("type");
  });

  it("keeps the immutable scored payload fields intact when link tokens are attached", () => {
    const answers = buildTypeDominantAnswers(2);
    const scoredResult = scoreAssessment({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    const snapshot = buildAssessmentResultSnapshot(scoredResult, answers);

    expect(snapshot.primaryType).toBe(scoredResult.primaryType);
    expect(snapshot.wingType).toBe(scoredResult.wingType);
    expect(snapshot.growthType).toBe(scoredResult.growthType);
    expect(snapshot.stressType).toBe(scoredResult.stressType);
    expect(snapshot.rawScores).toEqual(scoredResult.rawScores);
    expect(snapshot.normalizedScores).toEqual(scoredResult.normalizedScores);
    expect(snapshot.nearbyTypes).toEqual(scoredResult.nearbyTypes);
    expect(snapshot.answers).toEqual(answers);
  });
});
