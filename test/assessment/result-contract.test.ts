import { getTableColumns } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import { assessmentResults, type AssessmentResultRecord } from "@/db/schema";
import type { AssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import {
  buildAssessmentResultSnapshot,
  type AssessmentResultSnapshotDraft,
} from "@/domain/assessment/result-snapshot";
import { scoreAssessment } from "@/domain/assessment/scoring";
import { buildTypeDominantAnswers } from "./fixtures";

class SpyAssessmentResultRepository implements AssessmentResultRepository {
  savedSnapshots: AssessmentResultSnapshotDraft[] = [];

  async save(snapshot: AssessmentResultSnapshotDraft): Promise<AssessmentResultRecord> {
    this.savedSnapshots.push(snapshot);

    return {
      id: "snapshot-1",
      publicId: snapshot.publicId,
      adminToken: snapshot.adminToken,
      assessmentVersion: snapshot.assessmentVersion,
      scoringVersion: snapshot.scoringVersion,
      copyVersion: snapshot.copyVersion,
      primaryType: String(snapshot.primaryType),
      wingType: String(snapshot.wingType),
      growthType: String(snapshot.growthType),
      stressType: String(snapshot.stressType),
      rawScores: snapshot.rawScores,
      normalizedScores: snapshot.normalizedScores,
      nearbyTypes: snapshot.nearbyTypes,
      answers: snapshot.answers,
      createdAt: snapshot.createdAt,
    };
  }

  async findById(id: string): Promise<AssessmentResultRecord | null> {
    return this.savedSnapshots[0]
      ? {
          id,
          publicId: this.savedSnapshots[0].publicId,
          adminToken: this.savedSnapshots[0].adminToken,
          assessmentVersion: this.savedSnapshots[0].assessmentVersion,
          scoringVersion: this.savedSnapshots[0].scoringVersion,
          copyVersion: this.savedSnapshots[0].copyVersion,
          primaryType: String(this.savedSnapshots[0].primaryType),
          wingType: String(this.savedSnapshots[0].wingType),
          growthType: String(this.savedSnapshots[0].growthType),
          stressType: String(this.savedSnapshots[0].stressType),
          rawScores: this.savedSnapshots[0].rawScores,
          normalizedScores: this.savedSnapshots[0].normalizedScores,
          nearbyTypes: this.savedSnapshots[0].nearbyTypes,
          answers: this.savedSnapshots[0].answers,
          createdAt: this.savedSnapshots[0].createdAt,
        }
      : null;
  }

  async findByPublicId(publicId: string): Promise<AssessmentResultRecord | null> {
    return this.savedSnapshots[0]
      ? {
          id: "snapshot-1",
          publicId,
          adminToken: this.savedSnapshots[0].adminToken,
          assessmentVersion: this.savedSnapshots[0].assessmentVersion,
          scoringVersion: this.savedSnapshots[0].scoringVersion,
          copyVersion: this.savedSnapshots[0].copyVersion,
          primaryType: String(this.savedSnapshots[0].primaryType),
          wingType: String(this.savedSnapshots[0].wingType),
          growthType: String(this.savedSnapshots[0].growthType),
          stressType: String(this.savedSnapshots[0].stressType),
          rawScores: this.savedSnapshots[0].rawScores,
          normalizedScores: this.savedSnapshots[0].normalizedScores,
          nearbyTypes: this.savedSnapshots[0].nearbyTypes,
          answers: this.savedSnapshots[0].answers,
          createdAt: this.savedSnapshots[0].createdAt,
        }
      : null;
  }
}

describe("assessment result persistence contract", () => {
  it("buildAssessmentResultSnapshot preserves version fields and score payload while attaching opaque share metadata", () => {
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
    expect(snapshot.rawScores).toEqual(scoredResult.rawScores);
    expect(snapshot.normalizedScores).toEqual(scoredResult.normalizedScores);
    expect(snapshot.nearbyTypes).toEqual(scoredResult.nearbyTypes);
    expect(snapshot.answers).toEqual(answers);
    expect(snapshot.createdAt).toEqual(createdAt);
    expect(snapshot.publicId).toMatch(/^[A-Za-z]+$/);
    expect(snapshot.adminToken).toMatch(/^[A-Za-z]+$/);
  });

  it("repository save(snapshot) preserves the version trio unchanged", async () => {
    const repository = new SpyAssessmentResultRepository();
    const answers = buildTypeDominantAnswers(5);
    const snapshot = buildAssessmentResultSnapshot(
      scoreAssessment({
        assessmentVersion: assessmentDefinition.version,
        answers,
      }),
      answers,
      new Date("2026-03-29T01:00:00.000Z"),
    );

    const savedRecord = await repository.save(snapshot);

    expect(repository.savedSnapshots).toHaveLength(1);
    expect(repository.savedSnapshots[0].assessmentVersion).toBe(snapshot.assessmentVersion);
    expect(repository.savedSnapshots[0].scoringVersion).toBe(snapshot.scoringVersion);
    expect(repository.savedSnapshots[0].copyVersion).toBe(snapshot.copyVersion);
    expect(savedRecord.assessmentVersion).toBe(snapshot.assessmentVersion);
    expect(savedRecord.scoringVersion).toBe(snapshot.scoringVersion);
    expect(savedRecord.copyVersion).toBe(snapshot.copyVersion);
  });

  it("assessmentResults exposes the same version field names used by the snapshot builder", () => {
    const columns = getTableColumns(assessmentResults);

    expect(assessmentResults).toBeDefined();
    expect(Object.keys(columns)).toEqual(
      expect.arrayContaining([
        "assessmentVersion",
        "scoringVersion",
        "copyVersion",
        "publicId",
        "adminToken",
        "rawScores",
        "normalizedScores",
        "nearbyTypes",
      ]),
    );
  });
});
