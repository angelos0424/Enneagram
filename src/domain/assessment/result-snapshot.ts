import type { AssessmentSubmission } from "@/domain/assessment/schema";
import { createAssessmentResultLink, type AssessmentResultLink } from "@/domain/assessment/result-link";
import type { AssessmentScoreResult } from "@/domain/assessment/scoring";
import type {
  EnneagramType,
  NearbyTypeScore,
  AssessmentResultStatus,
} from "@/domain/assessment/types";

export type AssessmentResultSnapshotDraft = AssessmentResultLink & {
  assessmentVersion: string;
  scoringVersion: string;
  copyVersion: string;
  primaryType: EnneagramType;
  wingType: EnneagramType | null;
  growthType: EnneagramType;
  stressType: EnneagramType;
  resultStatus: AssessmentResultStatus;
  confidenceScore: number;
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
  const link = createAssessmentResultLink();

  return {
    ...link,
    assessmentVersion: result.assessmentVersion,
    scoringVersion: result.scoringVersion,
    copyVersion: result.copyVersion,
    primaryType: result.primaryType,
    wingType: result.wingType,
    growthType: result.growthType,
    stressType: result.stressType,
    resultStatus: result.resultStatus,
    confidenceScore: result.confidenceScore,
    rawScores: result.rawScores,
    normalizedScores: result.normalizedScores,
    nearbyTypes: [...result.nearbyTypes],
    answers: [...answers],
    createdAt,
  };
}
