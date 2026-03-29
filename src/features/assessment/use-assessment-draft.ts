"use client";

import { useEffect, useRef, useState } from "react";

import { assessmentDefinition } from "@/content/assessments/ko/v1";

import {
  buildAssessmentDraft,
  buildAssessmentDraftSessionSnapshot,
  resolveAssessmentDraftCurrentIndex,
} from "./assessment-flow";
import { submitAssessment, type SubmitAssessmentResponse } from "./submit-assessment";
import type {
  AssessmentAnswerValue,
  AssessmentDraft,
  AssessmentDraftSessionSnapshot,
} from "./types";

type AssessmentSessionResponse = {
  session: AssessmentDraftSessionSnapshot;
};

export function useAssessmentDraft() {
  const [draft, setDraft] = useState<AssessmentDraft>(() => buildAssessmentDraft());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);

  const latestSaveRequestRef = useRef(0);

  useEffect(() => {
    let isCancelled = false;

    async function bootstrapDraft() {
      try {
        const response = await fetch("/api/assessment-session", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            assessmentVersion: assessmentDefinition.version,
          }),
        });

        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const payload = (await response.json()) as AssessmentSessionResponse;

        if (isCancelled) {
          return;
        }

        applySessionSnapshot(payload.session);
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "검사 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsHydrating(false);
        }
      }
    }

    void bootstrapDraft();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function persistDraft(nextDraft: AssessmentDraft, nextIndex: number) {
    const requestId = latestSaveRequestRef.current + 1;
    latestSaveRequestRef.current = requestId;

    const currentQuestionId = assessmentDefinition.questions[nextIndex]?.id ?? null;
    const nextSession = buildAssessmentDraftSessionSnapshot(nextDraft, currentQuestionId);

    setDraft(nextDraft);
    setCurrentIndex(nextIndex);
    setIsSaving(true);
    setErrorMessage(null);
    setSubmitErrorMessage(null);

    try {
      const response = await fetch("/api/assessment-session/draft", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(nextSession),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const payload = (await response.json()) as AssessmentSessionResponse;

      if (requestId !== latestSaveRequestRef.current) {
        return;
      }

      applySessionSnapshot(payload.session);
      setErrorMessage(null);
    } catch (error) {
      if (requestId === latestSaveRequestRef.current) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "답변을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      if (requestId === latestSaveRequestRef.current) {
        setIsSaving(false);
      }
    }
  }

  async function submitCurrentDraft(): Promise<SubmitAssessmentResponse | null> {
    setIsSubmitting(true);
    setSubmitErrorMessage(null);

    try {
      const payload = await submitAssessment(draft);

      return payload;
    } catch (error) {
      setSubmitErrorMessage(
        error instanceof Error
          ? error.message
          : "결과를 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
      );

      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectAnswer(value: AssessmentAnswerValue) {
    const question = assessmentDefinition.questions[currentIndex];

    if (!question) {
      return;
    }

    const nextDraft: AssessmentDraft = {
      assessmentVersion: draft.assessmentVersion,
      answers: {
        ...draft.answers,
        [question.id]: value,
      },
    };
    const nextIndex = Math.min(currentIndex + 1, assessmentDefinition.questions.length - 1);

    void persistDraft(nextDraft, nextIndex);
  }

  function moveToPreviousQuestion() {
    if (currentIndex === 0) {
      return;
    }

    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function moveToNextQuestion() {
    const question = assessmentDefinition.questions[currentIndex];

    if (!question || draft.answers[question.id] === undefined) {
      return;
    }

    setCurrentIndex((index) => Math.min(index + 1, assessmentDefinition.questions.length - 1));
  }

  function applySessionSnapshot(session: AssessmentDraftSessionSnapshot) {
    const nextDraft: AssessmentDraft = {
      assessmentVersion: session.assessmentVersion,
      answers: session.answers,
    };

    setDraft(nextDraft);
    setCurrentIndex(
      resolveAssessmentDraftCurrentIndex(
        session.answers,
        session.progress.currentQuestionId,
      ),
    );
  }

  return {
    currentIndex,
    draft,
    isHydrating,
    isSaving,
    isSubmitting,
    errorMessage,
    submitErrorMessage,
    moveToNextQuestion,
    moveToPreviousQuestion,
    selectAnswer,
    submitCurrentDraft,
  };
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: {
        message?: string;
      };
    };

    return payload.error?.message ?? "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
  } catch {
    return "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
  }
}
