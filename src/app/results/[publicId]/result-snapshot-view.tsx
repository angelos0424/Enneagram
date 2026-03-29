import React from "react";

import { ResultShareActions } from "@/features/result-sharing/result-share-actions";
import type {
  EnneagramType,
  TypeCopyDetailCard,
  TypeCopyDisclaimer,
  TypeCopyEntry,
  TypeCopyRecommendation,
} from "@/domain/assessment/types";

type NearbyTypeView = {
  typeId: EnneagramType;
  rawScore: number;
  normalizedScore: number;
  gapFromPrimary: number;
};

export type ResultSnapshotViewModel = {
  publicId: string;
  primaryType: EnneagramType;
  wingType: EnneagramType;
  growthType: EnneagramType;
  stressType: EnneagramType;
  normalizedScores: Record<EnneagramType, number>;
  nearbyTypes: NearbyTypeView[];
  copy: TypeCopyEntry;
  wingCopy: TypeCopyEntry;
  growthCopy: TypeCopyEntry;
  stressCopy: TypeCopyEntry;
  detailCards: readonly TypeCopyDetailCard[];
  disclaimer: TypeCopyDisclaimer;
  recommendations: readonly TypeCopyRecommendation[];
};

const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];

export function ResultSnapshotView({
  snapshot,
}: {
  snapshot: ResultSnapshotViewModel;
}) {
  const summaryItems = [
    {
      label: "주 유형",
      value: `${snapshot.primaryType}`,
      detail: snapshot.copy.title,
    },
    {
      label: "날개",
      value: `${snapshot.wingType}`,
      detail: snapshot.wingCopy.title,
    },
    {
      label: "성장 방향",
      value: `${snapshot.growthType}`,
      detail: snapshot.growthCopy.title,
    },
    {
      label: "스트레스 방향",
      value: `${snapshot.stressType}`,
      detail: snapshot.stressCopy.title,
    },
  ] as const;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_34%),linear-gradient(180deg,_#fcfbf7_0%,_#f2ead9_100%)] px-4 py-6 text-stone-950">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <header className="overflow-hidden rounded-[2rem] border border-amber-950/10 bg-white shadow-[0_20px_50px_rgba(120,53,15,0.12)]">
          <div className="border-b border-amber-950/10 bg-[linear-gradient(135deg,_rgba(245,158,11,0.16),_rgba(120,53,15,0.04))] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
              공개 결과
            </p>
          </div>
          <div className="flex flex-col gap-5 px-5 py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-900/80">핵심 결과</p>
                <h1 className="text-3xl font-semibold leading-tight text-stone-950">
                  {snapshot.copy.title}
                </h1>
                <p className="text-base leading-7 text-stone-700">
                  {snapshot.copy.summary}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-amber-500/30 bg-amber-50 px-4 py-3 text-center shadow-[0_10px_25px_rgba(245,158,11,0.16)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                  TYPE
                </p>
                <p className="mt-1 text-4xl font-semibold text-amber-950">
                  {snapshot.primaryType}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-stone-950">
                    {item.value}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <section
          aria-labelledby="result-summary-heading"
          className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2
                id="result-summary-heading"
                className="text-lg font-semibold text-stone-950"
              >
                상세 결과 요약
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                저장된 스냅샷 기준으로 주 유형과 연결된 방향성을 한 번에 읽을 수 있어요.
              </p>
            </div>
          </div>
          <dl className="space-y-3">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4"
              >
                <dt className="text-sm font-semibold text-stone-500">{item.label}</dt>
                <dd className="mt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-semibold text-stone-950">
                    {item.value}
                  </span>
                  <span className="text-sm leading-6 text-stone-600">{item.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="distribution-heading"
          className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
        >
          <div className="mb-4">
            <h2 id="distribution-heading" className="text-lg font-semibold text-stone-950">
              정규화 점수 분포
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              가장 높게 나온 유형을 중심으로 전체 분포를 비교해 보세요.
            </p>
          </div>
          <ul className="space-y-3">
            {enneagramTypes.map((typeId) => {
              const score = snapshot.normalizedScores[typeId];
              const isPrimary = typeId === snapshot.primaryType;

              return (
                <li key={typeId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className={isPrimary ? "text-amber-900" : "text-stone-700"}>
                      유형 {typeId}
                    </span>
                    <span className={isPrimary ? "text-amber-900" : "text-stone-500"}>
                      {score}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full rounded-full ${
                        isPrimary ? "bg-amber-500" : "bg-stone-500/65"
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="nearby-heading"
          className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
        >
          <div className="mb-4">
            <h2 id="nearby-heading" className="text-lg font-semibold text-stone-950">
              근접 유형
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              비슷하게 높은 유형을 함께 보면 결과를 더 입체적으로 해석할 수 있어요.
            </p>
          </div>
          <ul className="space-y-3">
            {snapshot.nearbyTypes.map((type) => (
              <li
                key={type.typeId}
                className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-950">
                      유형 {type.typeId}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      점수 차이 {type.gapFromPrimary}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-stone-950">
                      {type.normalizedScore}
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      normalized
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="detail-cards-heading"
          className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
        >
          <div className="mb-4">
            <h2 id="detail-cards-heading" className="text-lg font-semibold text-stone-950">
              해석 카드
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              현재 응답 패턴에서 두드러진 해석을 카드 단위로 읽어보세요.
            </p>
          </div>
          <ul className="space-y-3">
            {snapshot.detailCards.map((card, index) => (
              <li
                key={card.title}
                className="rounded-[1.6rem] border border-stone-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#faf5eb_100%)] px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-500/15 text-sm font-semibold text-amber-900">
                    {index + 1}
                  </span>
                  <h3 className="text-base font-semibold text-stone-950">{card.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-stone-700">{card.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="disclaimer-heading"
          className="rounded-[2rem] border border-amber-900/15 bg-[linear-gradient(180deg,_rgba(245,158,11,0.08),_rgba(255,255,255,0.95))] px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
        >
          <h2 id="disclaimer-heading" className="text-lg font-semibold text-stone-950">
            {snapshot.disclaimer.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-700">
            {snapshot.disclaimer.body}
          </p>
        </section>

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
            {snapshot.recommendations.map((recommendation) => (
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
              </li>
            ))}
          </ul>
        </section>

        <ResultShareActions
          publicPath={`/results/${snapshot.publicId}`}
          title={snapshot.copy.title}
          summary={snapshot.copy.summary}
        />

        <footer className="pb-2 text-center text-xs tracking-[0.18em] text-stone-500">
          <p>{snapshot.publicId}</p>
        </footer>
      </div>
    </main>
  );
}
