"use client";

import React, { useState } from "react";

type ResultShareActionsProps = {
  publicPath: string;
  title: string;
  summary: string;
};

const shareErrorMessage =
  "공유 기능을 완료하지 못했어요. 다시 시도하거나 링크를 직접 복사해 주세요.";

export function ResultShareActions({
  publicPath,
  title,
  summary,
}: ResultShareActionsProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  async function handleShare() {
    const shareUrl = new URL(publicPath, window.location.origin).toString();

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title,
          text: summary,
          url: shareUrl,
        });
        setFeedbackMessage("공유 시트를 열었어요.");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setFeedbackMessage("링크를 복사했어요.");
        return;
      }

      setFeedbackMessage(shareErrorMessage);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setFeedbackMessage("공유가 취소되었어요.");
        return;
      }

      setFeedbackMessage(shareErrorMessage);
    }
  }

  return (
    <div className="rounded-[1.6rem] border border-stone-200 bg-stone-50 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-950">결과 공유</p>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            현재 결과 링크를 바로 공유하거나 복사할 수 있어요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void handleShare();
          }}
          className="rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          결과 공유하기
        </button>
      </div>
      {feedbackMessage ? (
        <p className="mt-3 text-sm leading-6 text-stone-700" role="status">
          {feedbackMessage}
        </p>
      ) : null}
    </div>
  );
}
