"use client";

import type { ForcedChoiceAssessmentQuestion } from "@/domain/assessment/types";

import { getAssessmentFlowSnapshot, getOrderedQuestions } from "./assessment-flow";
import { getSubmitAssessmentRedirectHref } from "./submit-assessment";
import { useAssessmentDraft } from "./use-assessment-draft";

const orderedQuestions = getOrderedQuestions();

export function AssessmentExperience() {
  const {
    currentIndex,
    draft,
    errorMessage,
    isHydrating,
    isSaving,
    isSubmitting,
    moveToNextQuestion,
    moveToPreviousQuestion,
    selectForcedChoiceAnswer,
    submitCurrentDraft,
    submitErrorMessage,
  } = useAssessmentDraft();
  const snapshot = getAssessmentFlowSnapshot(draft);

  const activeIndex = Math.min(currentIndex, orderedQuestions.length - 1);
  const question = (orderedQuestions[activeIndex] ?? null) as ForcedChoiceAssessmentQuestion | null;
  const selectedValue = question ? draft.answers[question.id] : undefined;
  const selectedChoiceLabel =
    selectedValue === "left"
      ? "왼쪽 진술 선택"
      : selectedValue === "right"
        ? "오른쪽 진술 선택"
        : "미응답";
  const statusMessage = isHydrating
    ? "이전 응답을 불러오는 중..."
    : isSaving
      ? "응답을 서버에 저장하는 중..."
      : isSubmitting
        ? "결과를 만드는 중..."
      : "응답이 서버에 임시 저장되고 있어요.";

  async function handleSubmit() {
    const payload = await submitCurrentDraft();

    if (!payload) {
      return;
    }

    window.location.assign(getSubmitAssessmentRedirectHref(payload));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_42%),linear-gradient(180deg,_#fcfbf7_0%,_#f4efe2_100%)] px-4 py-6 text-stone-950">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col gap-5">
        <section className="rounded-[2rem] border border-stone-950/10 bg-stone-950 px-5 py-4 text-stone-50 shadow-[0_24px_60px_rgba(28,25,23,0.26)]">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-amber-300/90">
                Progress
              </p>
              <p className="mt-1 text-lg font-medium">
                {snapshot.progressLabel}
                <span className="ml-2 text-sm text-stone-300">
                  {snapshot.progressPercent}%
                </span>
              </p>
            </div>
            <p className="text-sm text-stone-300">
              문항 {activeIndex + 1} / {snapshot.totalQuestions}
            </p>
          </div>
          <progress
            className="mt-4 h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-amber-400 [&::-webkit-progress-bar]:bg-stone-800/70 [&::-webkit-progress-value]:bg-amber-400"
            max={snapshot.totalQuestions}
            value={snapshot.answeredCount}
          >
            {snapshot.progressLabel}
          </progress>
          <p
            className="mt-3 text-xs text-stone-300"
            role="status"
            aria-live="polite"
          >
            {statusMessage}
          </p>
          {errorMessage ? (
            <p className="mt-2 text-xs text-rose-300" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {submitErrorMessage ? (
            <p className="mt-2 text-xs text-rose-300" role="alert">
              {submitErrorMessage}
            </p>
          ) : null}
        </section>

        <section className="flex flex-1 flex-col rounded-[2rem] border border-stone-950/10 bg-white p-5 shadow-[0_18px_50px_rgba(120,53,15,0.1)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber-700">
                질문 {String(activeIndex + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] text-stone-950">
                둘 중 지금 더 가까운 설명을 골라 주세요.
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                간이 검사이며 자기이해 참고용입니다. 더 맞는 한 문장을 고르면 됩니다.
              </p>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {selectedChoiceLabel}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {question
              ? ([
                  { side: "left", prompt: question.left.prompt, label: "왼쪽 진술" },
                  { side: "right", prompt: question.right.prompt, label: "오른쪽 진술" },
                ] as const).map((option) => {
                  const isSelected = selectedValue === option.side;

                  return (
                    <button
                      key={option.side}
                      type="button"
                      onClick={() => selectForcedChoiceAnswer(option.side)}
                      disabled={isHydrating || isSaving || isSubmitting}
                      className={`w-full rounded-[1.6rem] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-stone-950 shadow-[0_10px_30px_rgba(245,158,11,0.18)]"
                          : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-white"
                      } disabled:cursor-wait disabled:opacity-60`}
                      aria-pressed={isSelected}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        {option.label}
                      </p>
                      <p className="mt-3 text-base leading-7">{option.prompt}</p>
                    </button>
                  );
                })
              : null}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={moveToPreviousQuestion}
              disabled={activeIndex === 0 || isHydrating || isSaving || isSubmitting}
              className="rounded-full border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
            >
              이전 문항
            </button>
            <button
              type="button"
              onClick={moveToNextQuestion}
              disabled={
                activeIndex === orderedQuestions.length - 1 ||
                selectedValue === undefined ||
                isHydrating ||
                isSaving ||
                isSubmitting
              }
              className="rounded-full bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              다음 문항
            </button>
          </div>

          <div className="mt-auto pt-6">
            <div className="rounded-[1.6rem] bg-stone-100 p-4 text-sm leading-6 text-stone-700">
              {snapshot.canSubmit
                ? "모든 문항에 답했어요. 지금 바로 결과를 만들 수 있어요."
                : "모든 문항에 답해야 결과 만들기 버튼이 활성화됩니다."}
            </div>
            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={!snapshot.canSubmit || isHydrating || isSaving || isSubmitting}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-amber-500 px-5 py-4 text-base font-semibold text-stone-950 shadow-[0_16px_40px_rgba(245,158,11,0.28)] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
            >
              {isSubmitting ? "결과 만드는 중..." : "결과 만들기"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
