import { assessmentDefinition } from "@/content/assessments/ko/v1";

import type {
  AssessmentAnswer,
  AssessmentAnswerMap,
  AssessmentDraft,
  AssessmentProgress,
} from "./types";

const orderedQuestions = assessmentDefinition.questions;

export type AssessmentFlowSnapshot = AssessmentProgress & {
  assessmentVersion: AssessmentDraft["assessmentVersion"];
  answers: AssessmentAnswerMap;
  currentIndex: number;
  currentQuestion: (typeof orderedQuestions)[number] | null;
  questions: typeof orderedQuestions;
};

export function createEmptyAnswerMap(): AssessmentAnswerMap {
  return {};
}

export function buildAssessmentDraft(
  assessmentVersion: AssessmentDraft["assessmentVersion"] = assessmentDefinition.version,
): AssessmentDraft {
  return {
    assessmentVersion,
    answers: createEmptyAnswerMap(),
  };
}

export function getOrderedQuestions() {
  return orderedQuestions;
}

export function toSubmissionAnswers(answers: AssessmentAnswerMap): AssessmentAnswer[] {
  return orderedQuestions.flatMap((question) => {
    const value = answers[question.id];

    return value === undefined ? [] : [{ questionId: question.id, value }];
  });
}

export function getAssessmentFlowSnapshot(
  draft: AssessmentDraft,
): AssessmentFlowSnapshot {
  const submissionAnswers = toSubmissionAnswers(draft.answers);
  const totalQuestions = orderedQuestions.length;
  const answeredCount = submissionAnswers.length;
  const firstUnansweredIndex = orderedQuestions.findIndex(
    (question) => draft.answers[question.id] === undefined,
  );
  const currentIndex =
    firstUnansweredIndex === -1 ? totalQuestions - 1 : firstUnansweredIndex;
  const progressPercent =
    totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);
  const isComplete = totalQuestions > 0 && answeredCount === totalQuestions;

  return {
    assessmentVersion: draft.assessmentVersion,
    answers: draft.answers,
    answeredCount,
    totalQuestions,
    progressLabel: `${answeredCount} / ${totalQuestions}`,
    progressPercent,
    isComplete,
    canSubmit: isComplete,
    currentIndex,
    currentQuestion: orderedQuestions[currentIndex] ?? null,
    questions: orderedQuestions,
  };
}
