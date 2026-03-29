import type { AssessmentSubmission } from "@/domain/assessment/schema";

export type AssessmentAnswerValue = AssessmentSubmission["answers"][number]["value"];
export type AssessmentAnswer = AssessmentSubmission["answers"][number];

export type AssessmentAnswerMap = Partial<
  Record<AssessmentAnswer["questionId"], AssessmentAnswerValue>
>;

export type AssessmentDraft = {
  assessmentVersion: AssessmentSubmission["assessmentVersion"];
  answers: AssessmentAnswerMap;
};

export type AssessmentDraftProgress = {
  answeredCount: number;
  totalQuestions: number;
  currentQuestionId: AssessmentAnswer["questionId"] | null;
  isComplete: boolean;
};

export type AssessmentDraftSessionSnapshot = {
  assessmentVersion: AssessmentSubmission["assessmentVersion"];
  answers: AssessmentAnswerMap;
  progress: AssessmentDraftProgress;
};

export type AssessmentProgress = {
  answeredCount: number;
  totalQuestions: number;
  progressLabel: string;
  progressPercent: number;
  isComplete: boolean;
  canSubmit: boolean;
};
