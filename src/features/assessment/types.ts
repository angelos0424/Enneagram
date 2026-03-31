import type { AssessmentSubmission } from "@/domain/assessment/schema";
import type { AssessmentAnswer, AssessmentQuestion } from "@/domain/assessment/types";

export type AssessmentDraftAnswerValue =
  | Extract<AssessmentAnswer, { value: number }>["value"]
  | Extract<AssessmentAnswer, { selectedSide: string }>["selectedSide"];

export type AssessmentAnswerMap = Partial<
  Record<AssessmentAnswer["questionId"], AssessmentDraftAnswerValue>
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

export type AssessmentQuestionView = AssessmentQuestion;
