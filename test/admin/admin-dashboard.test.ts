import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AdminStatsDashboardData } from "@/domain/admin-stats";

const dashboardViewModelState: {
  data: AdminStatsDashboardData;
} = {
  data: {
    dailyActivity: [],
    primaryTypeDistribution: {
      buckets: [],
      totalCount: 0,
      suppressedBucketCount: 0,
      suppressionThreshold: 5,
    },
    wingDistribution: {
      buckets: [],
      totalCount: 0,
      suppressedBucketCount: 0,
      suppressionThreshold: 5,
    },
  },
};

vi.mock("@/domain/admin-stats", async () => {
  const actual = await vi.importActual<typeof import("@/domain/admin-stats")>(
    "@/domain/admin-stats",
  );

  return {
    ...actual,
    getAdminDashboardViewModel: vi.fn(async () => dashboardViewModelState.data),
  };
});

describe("admin dashboard page", () => {
  beforeEach(() => {
    dashboardViewModelState.data = {
      dailyActivity: [
        {
          day: "2026-03-29",
          label: "2026.3.29",
          starts: { kind: "visible", count: 6 },
          completions: { kind: "visible", count: 5 },
          restartClicks: { kind: "suppressed", reason: "small_cell" },
        },
      ],
      primaryTypeDistribution: {
        buckets: [
          {
            key: "8",
            label: "주도권을 잡는 도전가",
            count: 6,
            isSuppressed: false,
          },
          {
            key: "3",
            label: "성과를 만드는 성취가",
            count: null,
            isSuppressed: true,
          },
        ],
        totalCount: null,
        suppressedBucketCount: 1,
        suppressionThreshold: 5,
      },
      wingDistribution: {
        buckets: [
          {
            key: "7",
            label: "7번 날개",
            count: 6,
            isSuppressed: false,
          },
          {
            key: "4",
            label: "4번 날개",
            count: null,
            isSuppressed: true,
          },
        ],
        totalCount: null,
        suppressedBucketCount: 1,
        suppressionThreshold: 5,
      },
    };
  });

  it("renders the protected dashboard sections with privacy-safe aggregate values", async () => {
    const { default: AdminDashboardPage } = await import(
      "@/app/admin/(protected)/page"
    );
    const markup = renderToStaticMarkup(await AdminDashboardPage());

    expect(markup).toContain("관리자 운영 통계");
    expect(markup).toContain("일별 검사 흐름");
    expect(markup).toContain("주 유형 분포");
    expect(markup).toContain("날개 분포");
    expect(markup).toContain("2026.3.29");
    expect(markup).toContain("6건");
    expect(markup).toContain("5건");
  });

  it("communicates suppression clearly when low-volume cells are hidden", async () => {
    const { default: AdminDashboardPage } = await import(
      "@/app/admin/(protected)/page"
    );
    const markup = renderToStaticMarkup(await AdminDashboardPage());

    expect(markup).toContain("소표본 보호 적용 중");
    expect(markup).toContain("5건 미만 숨김");
    expect(markup).toContain("정확한 합계는 숨김 처리됨");
  });
});
