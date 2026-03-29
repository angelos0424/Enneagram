import React from "react";

import type { TypeCopyRecommendation } from "@/domain/assessment/types";

export function ResultRecommendations({
  recommendations,
}: {
  recommendations: readonly TypeCopyRecommendation[];
}) {
  return (
    <section
      aria-labelledby="recommendation-heading"
      className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
    >
      <div className="mb-4">
        <h2
          id="recommendation-heading"
          className="text-lg font-semibold text-stone-950"
        >
          다음 행동 제안
        </h2>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          지금 결과를 읽은 뒤 이어서 살펴보면 좋은 흐름을 정리했어요.
        </p>
      </div>
      <ul className="space-y-3">
        {recommendations.map((recommendation) => (
          <li
            key={recommendation.title}
            className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4"
          >
            <p className="text-base font-semibold text-stone-950">
              {recommendation.title}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              {recommendation.description}
            </p>
            <a
              href={recommendation.href}
              className="mt-3 inline-flex text-sm font-semibold text-amber-800 transition hover:text-amber-700"
            >
              이동하기
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
