"use client";

import React, { useState } from "react";

type PublicResultRestartCtaProps = {
  href: string;
};

export function PublicResultRestartCta({
  href,
}: PublicResultRestartCtaProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRestart() {
    setIsResetting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin-stats/restart", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("restart-failed");
      }

      window.location.assign(href);
    } catch {
      setErrorMessage(
        "새 검사를 시작하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
      setIsResetting(false);
    }
  }

  return (
    <div id="restart-cta" className="space-y-2">
      <button
        type="button"
        onClick={() => {
          void handleRestart();
        }}
        disabled={isResetting}
        className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
      >
        {isResetting ? "새 검사 준비 중..." : "검사해보기"}
      </button>
      {errorMessage ? (
        <p className="text-sm leading-6 text-rose-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
