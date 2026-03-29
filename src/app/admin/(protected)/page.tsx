import React from "react";

import { getAdminDashboardViewModel } from "@/domain/admin-stats";

function renderCountLabel(
  cell:
    | { kind: "visible"; count: number }
    | { kind: "suppressed"; reason: "small_cell" },
) {
  if (cell.kind === "visible") {
    return `${cell.count}건`;
  }

  return "5건 미만 숨김";
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardViewModel();
  const hasSuppressedDailyCells = stats.dailyActivity.some(
    (entry) =>
      entry.starts.kind === "suppressed" ||
      entry.completions.kind === "suppressed" ||
      entry.restartClicks.kind === "suppressed",
  );
  const hasSuppressedDistribution =
    stats.primaryTypeDistribution.suppressedBucketCount > 0 ||
    stats.wingDistribution.suppressedBucketCount > 0;
  const hasSuppressedData = hasSuppressedDailyCells || hasSuppressedDistribution;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-stone-950 px-6 py-7 text-white shadow-[0_24px_80px_rgba(28,25,23,0.22)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-300">
          Aggregate Stats
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          관리자 운영 통계
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
          검사 시작, 완료, 공유 결과 유입 후 재시작, 그리고 결과 분포를
          개인정보 노출 없이 집계합니다.
        </p>
      </section>

      {hasSuppressedData ? (
        <section className="rounded-[1.75rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
          <h3 className="font-semibold">소표본 보호 적용 중</h3>
          <p className="mt-1">
            일부 지표는 5건 미만이라 숨김 처리했습니다. 숨겨진 구간이 있는
            분포는 정확한 합계도 함께 숨깁니다.
          </p>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_80px_rgba(28,25,23,0.06)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-stone-950">
              일별 검사 흐름
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              시작 수, 완료 수, 그리고 공유 결과 페이지에서 새 검사를 시작한
              클릭 수를 날짜별로 보여줍니다.
            </p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {stats.dailyActivity.length > 0 ? (
            stats.dailyActivity.map((entry) => (
              <article
                key={entry.day}
                className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-base font-semibold text-stone-950">
                    {entry.label}
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-sm text-stone-700">
                    <div>
                      <p className="font-medium text-stone-500">시작</p>
                      <p>{renderCountLabel(entry.starts)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-stone-500">완료</p>
                      <p>{renderCountLabel(entry.completions)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-stone-500">재시작 클릭</p>
                      <p>{renderCountLabel(entry.restartClicks)}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-[1.5rem] border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-600">
              아직 집계된 활동이 없습니다.
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_80px_rgba(28,25,23,0.06)]">
          <h3 className="text-xl font-semibold text-stone-950">주 유형 분포</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            완료된 검사 결과 기준 주 유형 분포입니다.
          </p>
          <p className="mt-4 text-sm font-medium text-stone-700">
            {stats.primaryTypeDistribution.totalCount === null
              ? "정확한 합계는 숨김 처리됨"
              : `합계 ${stats.primaryTypeDistribution.totalCount}건`}
          </p>
          <div className="mt-4 space-y-3">
            {stats.primaryTypeDistribution.buckets.map((bucket) => (
              <article
                key={bucket.key}
                className="flex items-center justify-between rounded-[1.25rem] bg-stone-50 px-4 py-3 text-sm"
              >
                <span className="font-medium text-stone-950">{bucket.label}</span>
                <span className="text-stone-600">
                  {bucket.isSuppressed ? "5건 미만 숨김" : `${bucket.count}건`}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_80px_rgba(28,25,23,0.06)]">
          <h3 className="text-xl font-semibold text-stone-950">날개 분포</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            완료된 검사 결과 기준 날개 분포입니다.
          </p>
          <p className="mt-4 text-sm font-medium text-stone-700">
            {stats.wingDistribution.totalCount === null
              ? "정확한 합계는 숨김 처리됨"
              : `합계 ${stats.wingDistribution.totalCount}건`}
          </p>
          <div className="mt-4 space-y-3">
            {stats.wingDistribution.buckets.map((bucket) => (
              <article
                key={bucket.key}
                className="flex items-center justify-between rounded-[1.25rem] bg-stone-50 px-4 py-3 text-sm"
              >
                <span className="font-medium text-stone-950">{bucket.label}</span>
                <span className="text-stone-600">
                  {bucket.isSuppressed ? "5건 미만 숨김" : `${bucket.count}건`}
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
