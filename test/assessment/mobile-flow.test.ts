import { describe, expect, it } from "vitest";

import { assessmentDefinition } from "@/content/assessments";
import type { ForcedChoiceAssessmentQuestion } from "@/domain/assessment/types";
import {
  buildAssessmentDraft,
  buildAssessmentDraftSessionSnapshot,
  createEmptyAnswerMap,
  getAssessmentFlowSnapshot,
  toSubmissionAnswers,
} from "@/features/assessment/assessment-flow";

const questions = assessmentDefinition.questions as readonly ForcedChoiceAssessmentQuestion[];

describe("mobile assessment flow contract", () => {
  it("starts anonymously with the first canonical question and no recorded progress", () => {
    const snapshot = getAssessmentFlowSnapshot(
      buildAssessmentDraft(assessmentDefinition.version),
    );

    expect(snapshot.totalQuestions).toBe(assessmentDefinition.questions.length);
    expect(snapshot.answeredCount).toBe(0);
    expect(snapshot.progressPercent).toBe(0);
    expect(snapshot.isComplete).toBe(false);
    expect(snapshot.canSubmit).toBe(false);
    expect(snapshot.currentQuestion?.id).toBe(assessmentDefinition.questions[0]?.id);
  });

  it("derives answered-count progress from question ids without a duplicate question list", () => {
    const answers = createEmptyAnswerMap();
    answers[questions[0]!.id] = "left";
    answers[questions[3]!.id] = "right";

    const snapshot = getAssessmentFlowSnapshot({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    expect(snapshot.answeredCount).toBe(2);
    expect(snapshot.progressLabel).toBe(`2 / ${questions.length}`);
    expect(snapshot.currentQuestion?.id).toBe(questions[1]?.id);
    expect(toSubmissionAnswers(snapshot.answers)).toEqual([
      { questionId: questions[0]!.id, selectedSide: "left" },
      { questionId: questions[3]!.id, selectedSide: "right" },
    ]);
  });

  it("keeps submit disabled until every required question has an answer", () => {
    const partialAnswers = createEmptyAnswerMap();

    for (const question of questions.slice(0, -1)) {
      partialAnswers[question.id] = "left";
    }

    const partialSnapshot = getAssessmentFlowSnapshot({
      assessmentVersion: assessmentDefinition.version,
      answers: partialAnswers,
    });

    expect(partialSnapshot.isComplete).toBe(false);
    expect(partialSnapshot.canSubmit).toBe(false);
    expect(partialSnapshot.currentQuestion?.id).toBe(questions.at(-1)?.id);

    partialAnswers[questions.at(-1)!.id] = "right";

    const completeSnapshot = getAssessmentFlowSnapshot({
      assessmentVersion: assessmentDefinition.version,
      answers: partialAnswers,
    });

    expect(completeSnapshot.answeredCount).toBe(questions.length);
    expect(completeSnapshot.isComplete).toBe(true);
    expect(completeSnapshot.canSubmit).toBe(true);
    expect(completeSnapshot.currentQuestion?.id).toBe(questions.at(-1)?.id);
  });

  it("derives the canonical resume target from the first unanswered question", () => {
    const answers = createEmptyAnswerMap();
    answers[questions[0]!.id] = "left";
    answers[questions[1]!.id] = "right";
    answers[questions[3]!.id] = "left";

    const session = buildAssessmentDraftSessionSnapshot({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });
    const resumedSnapshot = getAssessmentFlowSnapshot({
      assessmentVersion: session.assessmentVersion,
      answers: session.answers,
    });

    expect(session.progress.answeredCount).toBe(3);
    expect(session.progress.currentQuestionId).toBe(questions[2]!.id);
    expect(resumedSnapshot.currentQuestion?.id).toBe(questions[2]!.id);
  });

  it("preserves an explicitly saved current question after selecting an answer", () => {
    const answers = createEmptyAnswerMap();
    answers[questions[0]!.id] = "left";

    const session = buildAssessmentDraftSessionSnapshot(
      {
        assessmentVersion: assessmentDefinition.version,
        answers,
      },
      questions[0]!.id,
    );

    expect(session.progress.currentQuestionId).toBe(questions[0]!.id);
  });

  it("resumes on the final question when a hydrated server draft is complete", () => {
    const answers = createEmptyAnswerMap();

    for (const question of questions) {
      answers[question.id] = "left";
    }

    const session = buildAssessmentDraftSessionSnapshot({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });
    const resumedSnapshot = getAssessmentFlowSnapshot({
      assessmentVersion: session.assessmentVersion,
      answers: session.answers,
    });

    expect(session.progress.isComplete).toBe(true);
    expect(session.progress.currentQuestionId).toBe(questions.at(-1)?.id);
    expect(resumedSnapshot.currentQuestion?.id).toBe(questions.at(-1)?.id);
  });
});
