import { renderToStaticMarkup } from "react-dom/server";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { typeCopyDefinition } from "@/content/type-copy/ko/v1";
import { assessmentDefinition } from "@/content/assessments/ko/v1";
import type { AssessmentResultRecord } from "@/db/schema";
import { buildTypeDominantAnswers } from "./fixtures";

const notFoundError = new Error("NEXT_NOT_FOUND");

const repositoryState: {
  findByPublicIdCalls: string[];
  record: AssessmentResultRecord | null;
} = {
  findByPublicIdCalls: [],
  record: null,
};

const scoringState = {
  scoreAssessment: vi.fn(),
};

vi.mock("@/db/repositories/assessment-result-repository", () => {
  class MockAssessmentResultRepository {
    async save(): Promise<never> {
      throw new Error("save() should not be called by the public result page");
    }

    async findById(): Promise<null> {
      return null;
    }

    async findByPublicId(publicId: string): Promise<AssessmentResultRecord | null> {
      repositoryState.findByPublicIdCalls.push(publicId);
      return repositoryState.record;
    }
  }

  return {
    DrizzleAssessmentResultRepository: MockAssessmentResultRepository,
  };
});

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw notFoundError;
  },
}));

vi.mock("@/domain/assessment/scoring", async () => {
  const actual = await vi.importActual<typeof import("@/domain/assessment/scoring")>(
    "@/domain/assessment/scoring",
  );

  return {
    ...actual,
    scoreAssessment: scoringState.scoreAssessment,
  };
});

function buildStoredRecord(publicId: string): AssessmentResultRecord {
  return {
    id: "result-row-1",
    publicId,
    adminToken: "AdminTokenForPublicResultPageTest",
    assessmentVersion: assessmentDefinition.version,
    scoringVersion: assessmentDefinition.scoringVersion,
    copyVersion: typeCopyDefinition.copyVersion,
    primaryType: "8",
    wingType: "7",
    growthType: "2",
    stressType: "5",
    rawScores: { 1: 12, 2: 24, 3: 32, 4: 28, 5: 16, 6: 20, 7: 40, 8: 48, 9: 14 },
    normalizedScores: { 1: 25, 2: 50, 3: 67, 4: 58, 5: 33, 6: 42, 7: 83, 8: 100, 9: 29 },
    nearbyTypes: [
      { typeId: 7, rawScore: 40, normalizedScore: 83, gapFromPrimary: 8 },
      { typeId: 3, rawScore: 32, normalizedScore: 67, gapFromPrimary: 16 },
      { typeId: 4, rawScore: 28, normalizedScore: 58, gapFromPrimary: 20 },
    ],
    answers: buildTypeDominantAnswers(8),
    createdAt: new Date("2026-03-29T02:00:00.000Z"),
  };
}

describe("public result page", () => {
  beforeEach(() => {
    repositoryState.findByPublicIdCalls = [];
    repositoryState.record = null;
    scoringState.scoreAssessment.mockReset();
  });

  it("loads the stored snapshot by publicId and does not re-score the result", async () => {
    repositoryState.record = buildStoredRecord("PublicResultLookupToken");

    const { default: PublicResultPage } = await import("@/app/results/[publicId]/page");
    const markup = renderToStaticMarkup(
      await PublicResultPage({
        params: Promise.resolve({ publicId: repositoryState.record.publicId }),
      }),
    );

    expect(repositoryState.findByPublicIdCalls).toEqual([
      repositoryState.record.publicId,
    ]);
    expect(scoringState.scoreAssessment).not.toHaveBeenCalled();
    expect(markup).toContain(typeCopyDefinition.entries[8].title);
  });

  it("resolves interpretation copy through the stored copyVersion catalog", async () => {
    repositoryState.record = buildStoredRecord("PublicResultVersionedCopy");

    const { resolveResultCopy } = await import("@/domain/assessment/result-copy");
    const copy = resolveResultCopy(repositoryState.record.copyVersion, 8);

    expect(copy).toEqual(typeCopyDefinition.entries[8]);
  });

  it("renders the saved detailed result fields from the snapshot payload", async () => {
    repositoryState.record = buildStoredRecord("PublicResultFullPayload");

    const { default: PublicResultPage } = await import("@/app/results/[publicId]/page");
    const markup = renderToStaticMarkup(
      await PublicResultPage({
        params: Promise.resolve({ publicId: repositoryState.record.publicId }),
      }),
    );

    expect(markup).toContain("주 유형");
    expect(markup).toContain("8");
    expect(markup).toContain("날개");
    expect(markup).toContain("7");
    expect(markup).toContain("성장 방향");
    expect(markup).toContain("2");
    expect(markup).toContain("스트레스 방향");
    expect(markup).toContain("5");
    expect(markup).toContain(typeCopyDefinition.entries[7].title);
    expect(markup).toContain(typeCopyDefinition.entries[2].title);
    expect(markup).toContain(typeCopyDefinition.entries[5].title);
    expect(markup).toContain("100");
    expect(markup).toContain(typeCopyDefinition.entries[8].summary);
    expect(markup).toContain(typeCopyDefinition.entries[8].detailCards[0].title);
    expect(markup).toContain(typeCopyDefinition.entries[8].detailCards[0].body);
    expect(markup).toContain(typeCopyDefinition.entries[8].disclaimer.title);
    expect(markup).toContain(typeCopyDefinition.entries[8].disclaimer.body);
    expect(markup).toContain(typeCopyDefinition.entries[8].recommendations[0].title);
    expect(markup).toContain(typeCopyDefinition.entries[8].recommendations[0].description);
    expect(markup).toContain("검사해보기");
    expect(markup).toContain("결과 공유하기");
  });

  it("renders the primary result hero before the supporting interpretation sections", async () => {
    repositoryState.record = buildStoredRecord("PublicResultHeroHierarchy");

    const { default: PublicResultPage } = await import("@/app/results/[publicId]/page");
    const markup = renderToStaticMarkup(
      await PublicResultPage({
        params: Promise.resolve({ publicId: repositoryState.record.publicId }),
      }),
    );

    expect(markup.indexOf("핵심 결과")).toBeGreaterThanOrEqual(0);
    expect(markup.indexOf(typeCopyDefinition.entries[8].title)).toBeLessThan(
      markup.indexOf("상세 결과 요약"),
    );
    expect(markup.indexOf("상세 결과 요약")).toBeLessThan(
      markup.indexOf("정규화 점수 분포"),
    );
    expect(markup.indexOf("정규화 점수 분포")).toBeLessThan(
      markup.indexOf(typeCopyDefinition.entries[8].disclaimer.title),
    );
  });

  it("uses the route not-found behavior when the public id does not exist", async () => {
    const { default: PublicResultPage } = await import("@/app/results/[publicId]/page");

    await expect(
      PublicResultPage({
        params: Promise.resolve({ publicId: "MissingPublicResultId" }),
      }),
    ).rejects.toBe(notFoundError);
    expect(repositoryState.findByPublicIdCalls).toEqual(["MissingPublicResultId"]);
  });

  it("declares noindex metadata defaults for public result pages", async () => {
    const { buildSnapshotMetadata } = await import(
      "@/app/results/[publicId]/snapshot-metadata"
    );
    const { generateMetadata } = await import("@/app/results/[publicId]/page");

    expect(buildSnapshotMetadata("PrivacyFirstPublicResult").robots).toEqual({
      index: false,
      follow: false,
    });
    await expect(
      generateMetadata({
        params: Promise.resolve({ publicId: "PrivacyFirstPublicResult" }),
      }),
    ).resolves.toMatchObject({
      robots: {
        index: false,
        follow: false,
      },
    });
  });

  it("applies strict referrer protection only to public snapshot routes", async () => {
    const nextConfig = (await import("../../next.config")).default;

    expect(nextConfig.headers).toBeTypeOf("function");
    const headers = await nextConfig.headers?.();
    const publicResultRule = headers?.find(
      (entry) => entry.source === "/results/:publicId*",
    );

    expect(publicResultRule).toBeDefined();
    expect(publicResultRule?.headers).toEqual(
      expect.arrayContaining([
        {
          key: "Referrer-Policy",
          value: "no-referrer",
        },
      ]),
    );
    expect(headers?.some((entry) => entry.source === "/")).toBe(false);
  });
});
