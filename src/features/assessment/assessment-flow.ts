import { assessmentDefinition } from "@/content/assessments";
import type {
  AssessmentAnswer,
  ForcedChoiceAssessmentQuestion,
  ForcedChoiceSide,
} from "@/domain/assessment/types";

import type {
  AssessmentAnswerMap,
  AssessmentDraft,
  AssessmentDraftProgress,
  AssessmentDraftSessionSnapshot,
  AssessmentProgress,
} from "./types";

const orderedQuestions = assessmentDefinition.questions as readonly ForcedChoiceAssessmentQuestion[];

function isForcedChoiceSide(value: unknown): value is ForcedChoiceSide {
  return value === "left" || value === "right";
}

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

export function resolveAssessmentDraftCurrentIndex(
  answers: AssessmentAnswerMap,
  currentQuestionId: string | null,
): number {
  const currentQuestionIndex =
    currentQuestionId === null
      ? -1
      : orderedQuestions.findIndex((question) => question.id === currentQuestionId);

  if (currentQuestionIndex >= 0) {
    return currentQuestionIndex;
  }

  const fallbackDraft: AssessmentDraft = {
    assessmentVersion: assessmentDefinition.version,
    answers,
  };

  return getAssessmentFlowSnapshot(fallbackDraft).currentIndex;
}

export function toSubmissionAnswers(answers: AssessmentAnswerMap): AssessmentAnswer[] {
  return orderedQuestions.flatMap((question) => {
    const value = answers[question.id];

    if (!isForcedChoiceSide(value)) {
      return [];
    }

    return [{ questionId: question.id, selectedSide: value }];
  });
}

export function buildAssessmentDraftProgress(
  draft: AssessmentDraft,
  currentQuestionId: string | null = null,
): AssessmentDraftProgress {
  const snapshot = getAssessmentFlowSnapshot(draft);
  const currentIndex = resolveAssessmentDraftCurrentIndex(
    draft.answers,
    currentQuestionId,
  );

  return {
    answeredCount: snapshot.answeredCount,
    totalQuestions: snapshot.totalQuestions,
    currentQuestionId: orderedQuestions[currentIndex]?.id ?? null,
    isComplete: snapshot.isComplete,
  };
}

export function buildAssessmentDraftSessionSnapshot(
  draft: AssessmentDraft,
  currentQuestionId: string | null = null,
): AssessmentDraftSessionSnapshot {
  return {
    assessmentVersion: draft.assessmentVersion,
    answers: draft.answers,
    progress: buildAssessmentDraftProgress(draft, currentQuestionId),
  };
}

export function getAssessmentFlowSnapshot(
  draft: AssessmentDraft,
): AssessmentFlowSnapshot {
  const submissionAnswers = toSubmissionAnswers(draft.answers);
  const totalQuestions = Number(orderedQuestions.length);
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
