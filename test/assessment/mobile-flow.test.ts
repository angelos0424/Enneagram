import { describe, expect, it } from "vitest";

import { assessmentDefinition } from "@/content/assessments/ko/v1";
import {
  buildAssessmentDraft,
  createEmptyAnswerMap,
  getAssessmentFlowSnapshot,
  toSubmissionAnswers,
} from "@/features/assessment/assessment-flow";

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
    answers[assessmentDefinition.questions[0]!.id] = 4;
    answers[assessmentDefinition.questions[3]!.id] = 2;

    const snapshot = getAssessmentFlowSnapshot({
      assessmentVersion: assessmentDefinition.version,
      answers,
    });

    expect(snapshot.answeredCount).toBe(2);
    expect(snapshot.progressLabel).toBe(`2 / ${assessmentDefinition.questions.length}`);
    expect(snapshot.currentQuestion?.id).toBe(assessmentDefinition.questions[1]?.id);
    expect(toSubmissionAnswers(snapshot.answers)).toEqual([
      { questionId: assessmentDefinition.questions[0]!.id, value: 4 },
      { questionId: assessmentDefinition.questions[3]!.id, value: 2 },
    ]);
  });

  it("keeps submit disabled until every required question has an answer", () => {
    const partialAnswers = createEmptyAnswerMap();

    for (const question of assessmentDefinition.questions.slice(0, -1)) {
      partialAnswers[question.id] = 5;
    }

    const partialSnapshot = getAssessmentFlowSnapshot({
      assessmentVersion: assessmentDefinition.version,
      answers: partialAnswers,
    });

    expect(partialSnapshot.isComplete).toBe(false);
    expect(partialSnapshot.canSubmit).toBe(false);
    expect(partialSnapshot.currentQuestion?.id).toBe(
      assessmentDefinition.questions.at(-1)?.id,
    );

    partialAnswers[assessmentDefinition.questions.at(-1)!.id] = 3;

    const completeSnapshot = getAssessmentFlowSnapshot({
      assessmentVersion: assessmentDefinition.version,
      answers: partialAnswers,
    });

    expect(completeSnapshot.answeredCount).toBe(assessmentDefinition.questions.length);
    expect(completeSnapshot.isComplete).toBe(true);
    expect(completeSnapshot.canSubmit).toBe(true);
    expect(completeSnapshot.currentQuestion?.id).toBe(
      assessmentDefinition.questions.at(-1)?.id,
    );
  });
});
