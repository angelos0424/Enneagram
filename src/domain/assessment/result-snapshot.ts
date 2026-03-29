import type { AssessmentSubmission } from "@/domain/assessment/schema";
import type { AssessmentScoreResult } from "@/domain/assessment/scoring";
import type {
  EnneagramType,
  NearbyTypeScore,
} from "@/domain/assessment/types";

export type AssessmentResultSnapshotDraft = {
  assessmentVersion: string;
  scoringVersion: string;
  copyVersion: string;
  primaryType: EnneagramType;
  wingType: EnneagramType;
  growthType: EnneagramType;
  stressType: EnneagramType;
  rawScores: AssessmentScoreResult["rawScores"];
  normalizedScores: AssessmentScoreResult["normalizedScores"];
  nearbyTypes: NearbyTypeScore[];
  answers: AssessmentSubmission["answers"];
  createdAt: Date;
};

export function buildAssessmentResultSnapshot(
  result: AssessmentScoreResult,
  answers: AssessmentSubmission["answers"],
  createdAt: Date = new Date(),
): AssessmentResultSnapshotDraft {
  return {
    assessmentVersion: result.assessmentVersion,
    scoringVersion: result.scoringVersion,
    copyVersion: result.copyVersion,
    primaryType: result.primaryType,
    wingType: result.wingType,
    growthType: result.growthType,
    stressType: result.stressType,
    rawScores: result.rawScores,
    normalizedScores: result.normalizedScores,
    nearbyTypes: [...result.nearbyTypes],
    answers: [...answers],
    createdAt,
  };
}
