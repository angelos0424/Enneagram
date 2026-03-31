"use client";

import React, { useMemo, useState } from "react";

import { PublicResultRestartCta } from "./public-result-restart-cta";
import { ResultRecommendations } from "./result-recommendations";
import { ResultShareActions } from "@/features/result-sharing/result-share-actions";
import type {
  AssessmentResultStatus,
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

type TypeModalCopy = {
  title: string;
  summary: string;
};

type CenterSummaryView = {
  label: "장형" | "가슴형" | "머리형";
  typeId: EnneagramType;
  detail: string;
  modalCopy: TypeModalCopy;
};

type TypeScoreSummaryView = {
  typeId: EnneagramType;
  score: number;
  title: string;
  summary: string;
};

export type ResultSnapshotViewModel = {
  publicId: string;
  assessmentVersion: string;
  resultStatus: AssessmentResultStatus;
  confidenceScore: number;
  isModern: boolean;
  isV3: boolean;
  primaryType: EnneagramType;
  wingType: EnneagramType | null;
  growthType: EnneagramType;
  stressType: EnneagramType;
  normalizedScores: Record<EnneagramType, number>;
  nearbyTypes: NearbyTypeView[];
  centers: readonly CenterSummaryView[];
  topTypes: readonly TypeScoreSummaryView[];
  rationaleSummary: readonly string[];
  copy: TypeCopyEntry;
  wingCopy: TypeCopyEntry | null;
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
  const [selectedType, setSelectedType] = useState<CenterSummaryView | null>(null);

  const nearbySummary =
    snapshot.nearbyTypes.length > 0
      ? snapshot.nearbyTypes
          .slice(0, 2)
          .map((type) => type.typeId)
          .join(", ")
      : "-";
  const legacySummaryItems = [
    {
      label: "주 유형",
      value: `${snapshot.primaryType}`,
      detail: snapshot.copy.title,
    },
    {
      label: "날개",
      value: snapshot.wingType === null ? "-" : `${snapshot.wingType}`,
      detail: snapshot.wingCopy?.title ?? "저장된 날개 정보 없음",
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
  const clarityValue =
    snapshot.resultStatus === "clear"
      ? `${snapshot.confidenceScore}`
      : snapshot.resultStatus === "mixed"
        ? "혼합형"
        : "재응답 권장";
  const clarityDetail =
    snapshot.resultStatus === "clear"
      ? `상위 2개 유형 차이 ${snapshot.confidenceScore}`
      : snapshot.resultStatus === "mixed"
        ? "상위 유형 간 차이가 크지 않아 함께 해석하는 편이 적절해요."
        : "응답이 너무 고르게 분포되어 유형 확정보다 다시 비교하는 편이 좋아요.";
  const v2SummaryItems = [
    {
      label: snapshot.isModern ? "유형 후보" : "주 유형",
      value: `${snapshot.primaryType}`,
      detail: snapshot.copy.title,
    },
    {
      label: "근접 유형",
      value: nearbySummary,
      detail: "가까운 다른 후보도 함께 보면 결과를 더 입체적으로 읽을 수 있어요.",
    },
    {
      label: "결과 선명도",
      value: clarityValue,
      detail: clarityDetail,
    },
    {
      label: "날개 후보",
      value: snapshot.wingType === null ? "없음" : `${snapshot.wingType}`,
      detail:
        snapshot.wingType === null
          ? snapshot.isV3
            ? "날개는 이번 버전에서 확정하지 않음"
            : "날개는 뚜렷하지 않음"
          : snapshot.wingCopy?.title ?? "날개 후보",
    },
  ] as const;
  const summaryItems = snapshot.isModern ? v2SummaryItems : legacySummaryItems;
  const distributionHeading = snapshot.isModern ? "상대 강도 지표" : "정규화 점수 분포";
  const distributionDescription = snapshot.isModern
    ? "각 유형이 독립적으로 0-100으로 정리된 지표예요. 합계가 100을 만들도록 강제하지 않습니다."
    : "가장 높게 나온 유형을 중심으로 전체 분포를 비교해 보세요.";
  const heroLabel = snapshot.isModern ? "가장 가까운 유형 후보" : "핵심 결과";
  const heroTone = snapshot.isModern
    ? snapshot.resultStatus === "clear"
      ? "이번 응답에서 가장 가까운 후보를 먼저 보여드려요."
      : snapshot.resultStatus === "mixed"
        ? "한 가지로 단정하기보다 근접 유형을 함께 읽는 편이 적절해요."
        : "응답이 고르게 분포되어 이번 결과는 재응답과 비교가 특히 중요해요."
    : snapshot.copy.summary;
  const theoryItems = [
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
  const supportSectionTitle = snapshot.isModern ? "결과 안내" : "상세 결과 요약";
  const supportSectionDescription = snapshot.isModern
    ? snapshot.resultStatus === "clear"
      ? "이번 응답은 유형 간 차이가 비교적 선명한 편이에요."
      : snapshot.resultStatus === "mixed"
        ? "상위 유형 간 차이가 크지 않아 한 가지로 단정하기보다 함께 해석하는 편이 적절해요."
        : "응답이 고르게 분포되어 이번 결과는 재응답이나 근접 유형 비교가 특히 중요해요."
    : "저장된 스냅샷 기준으로 주 유형과 연결된 방향성을 한 번에 읽을 수 있어요.";
  const supportItems = snapshot.isModern ? theoryItems : legacySummaryItems;

  const centerItems = snapshot.centers;
  const selectedTypeLabel = useMemo(
    () => (selectedType ? `유형 ${selectedType.typeId}` : null),
    [selectedType],
  );

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_transparent_34%),linear-gradient(180deg,_#fcfbf7_0%,_#f2ead9_100%)] px-4 py-6 text-stone-950">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          <header className="overflow-hidden rounded-[2rem] border border-amber-950/10 bg-white shadow-[0_20px_50px_rgba(120,53,15,0.12)]">
            <div className="border-b border-amber-950/10 bg-[linear-gradient(135deg,_rgba(245,158,11,0.16),_rgba(120,53,15,0.04))] px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">
                  공개 결과
                </p>
                <PublicResultRestartCta href="/" />
              </div>
            </div>
            <div className="flex flex-col gap-5 px-5 py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-amber-900/80">{heroLabel}</p>
                  <h1 className="text-3xl font-semibold leading-tight text-stone-950">
                    {snapshot.copy.title}
                  </h1>
                  <p className="text-base leading-7 text-stone-700">
                    {heroTone}
                  </p>
                </div>
                <div className="rounded-[1.6rem] border border-amber-500/30 bg-amber-50 px-4 py-3 text-center shadow-[0_10px_25px_rgba(245,158,11,0.16)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                    {snapshot.isModern ? "CANDIDATE" : "TYPE"}
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
                  {supportSectionTitle}
                </h2>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  {supportSectionDescription}
                </p>
              </div>
            </div>
            <dl className="space-y-3">
              {supportItems.map((item) => (
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
            {snapshot.isModern ? (
              <p className="mt-4 text-xs leading-6 text-stone-500">
                성장 방향과 스트레스 방향은 현재 응답에서 별도로 측정한 점수가 아니라,
                주유형 해석을 돕는 이론적 연결선입니다.
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="rationale-heading"
            className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
          >
            <div className="mb-4">
              <h2 id="rationale-heading" className="text-lg font-semibold text-stone-950">
                왜 이 유형이 나왔는지
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                상위 점수와 주유형 해석을 기준으로 이번 결과를 짧게 요약했어요.
              </p>
            </div>
            <ul className="space-y-3">
              {snapshot.rationaleSummary.map((item) => (
                <li
                  key={item}
                  className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="top-types-heading"
            className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
          >
            <div className="mb-4">
              <h2 id="top-types-heading" className="text-lg font-semibold text-stone-950">
                상위 3개 유형 점수
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                가장 높게 나온 3개 유형을 함께 보면 혼합 경향도 더 쉽게 읽을 수 있어요.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {snapshot.topTypes.map((item, index) => (
                <div
                  key={item.typeId}
                  className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                        {index + 1}위 유형 {item.typeId}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-stone-950">
                        {item.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-semibold text-stone-950">{item.score}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">score</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.summary}</p>
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="center-heading"
            className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
          >
            <div className="mb-4">
              <h2 id="center-heading" className="text-lg font-semibold text-stone-950">
                센터별 강세
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                장형, 가슴형, 머리형 안에서 가장 높게 나온 유형을 함께 보면 반응 패턴을 더 빠르게 읽을 수 있어요.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {centerItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedType(item)}
                  className="rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4 text-left transition hover:border-amber-300 hover:bg-amber-50/70"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {item.label}
                  </p>
                  <div className="mt-2 flex items-baseline gap-3">
                    <p className="text-2xl font-semibold text-stone-950">{item.typeId}</p>
                    <p className="text-sm leading-6 text-stone-600">{item.detail}</p>
                  </div>
                  <p className="mt-3 text-xs font-medium text-amber-800">
                    유형을 터치해서 설명 보기
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="distribution-heading"
            className="rounded-[2rem] border border-stone-950/10 bg-white px-5 py-5 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
          >
            <div className="mb-4">
              <h2 id="distribution-heading" className="text-lg font-semibold text-stone-950">
                {distributionHeading}
              </h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                {distributionDescription}
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
            <div className="mt-4 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-4">
              <p className="text-sm font-semibold text-amber-950">주의 문구</p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                간이 검사이며 자기이해 참고용입니다.
              </p>
            </div>
          </section>

          <ResultRecommendations recommendations={snapshot.recommendations} />

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

      {selectedType ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/55 px-4 py-6 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="center-type-modal-title"
          onClick={() => setSelectedType(null)}
        >
          <div
            className="w-full max-w-md rounded-[2rem] border border-amber-950/10 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                  {selectedType.label}
                </p>
                <h3
                  id="center-type-modal-title"
                  className="mt-2 text-2xl font-semibold text-stone-950"
                >
                  {selectedTypeLabel} · {selectedType.modalCopy.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedType(null)}
                className="rounded-full border border-stone-200 px-3 py-1 text-sm font-medium text-stone-600 hover:bg-stone-100"
              >
                닫기
              </button>
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-stone-200 bg-stone-50 px-4 py-4">
              <p className="text-sm leading-7 text-stone-700">
                {selectedType.modalCopy.summary}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
