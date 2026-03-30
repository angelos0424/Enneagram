import { renderToStaticMarkup } from "react-dom/server";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { Metadata } from "next";

import { typeCopyDefinition } from "@/content/type-copy/ko/v1";
import { assessmentDefinition } from "@/content/assessments/ko/v1";
import { assessmentDefinitionV2 } from "@/content/assessments/ko/v2";
import { typeCopyDefinitionV2 } from "@/content/type-copy/ko/v2";
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

const originalEnv = process.env;

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
    resultStatus: "clear",
    confidenceScore: 17,
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

function buildStoredRecordV2(publicId: string): AssessmentResultRecord {
  return {
    id: "result-row-v2",
    publicId,
    adminToken: "AdminTokenForPublicResultPageV2",
    assessmentVersion: assessmentDefinitionV2.version,
    scoringVersion: assessmentDefinitionV2.scoringVersion,
    copyVersion: typeCopyDefinitionV2.copyVersion,
    primaryType: "6",
    wingType: null,
    growthType: "9",
    stressType: "3",
    resultStatus: "mixed",
    confidenceScore: 0,
    rawScores: { 1: 0, 2: 1, 3: 4, 4: 0, 5: 1, 6: 5, 7: 0, 8: -1, 9: 4 },
    normalizedScores: {
      1: 50,
      2: 56.3,
      3: 75,
      4: 50,
      5: 56.3,
      6: 81.3,
      7: 50,
      8: 43.8,
      9: 75,
    },
    nearbyTypes: [
      { typeId: 3, rawScore: 4, normalizedScore: 75, gapFromPrimary: 1 },
      { typeId: 9, rawScore: 4, normalizedScore: 75, gapFromPrimary: 1 },
      { typeId: 2, rawScore: 1, normalizedScore: 56.3, gapFromPrimary: 4 },
    ],
    answers: assessmentDefinitionV2.questions.map((question) => ({
      questionId: question.id,
      value: 3,
    })),
    createdAt: new Date("2026-03-30T02:00:00.000Z"),
  };
}

describe("public result page", () => {
  beforeEach(() => {
    repositoryState.findByPublicIdCalls = [];
    repositoryState.record = null;
    scoringState.scoreAssessment.mockReset();
    process.env = {
      ...originalEnv,
      APP_ORIGIN: "https://enneagram.example.com",
    };
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
    expect(markup).toContain("장형");
    expect(markup).toContain("가슴형");
    expect(markup).toContain("머리형");
    expect(markup).toContain(typeCopyDefinition.entries[3].title);
    expect(markup).toContain(typeCopyDefinition.entries[7].title);
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

  it("renders v2 results with candidate tone, clarity guidance, and optional wing messaging", async () => {
    repositoryState.record = buildStoredRecordV2("PublicResultV2Candidate");

    const { default: PublicResultPage } = await import("@/app/results/[publicId]/page");
    const markup = renderToStaticMarkup(
      await PublicResultPage({
        params: Promise.resolve({ publicId: repositoryState.record.publicId }),
      }),
    );

    expect(markup).toContain("가장 가까운 유형 후보");
    expect(markup).toContain("결과 선명도");
    expect(markup).toContain("혼합형");
    expect(markup).toContain("날개는 뚜렷하지 않음");
    expect(markup).toContain("상대 강도 지표");
    expect(markup).toContain("이론적 연결선");
    expect(markup).toContain("CANDIDATE");
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
    repositoryState.record = buildStoredRecord("PrivacyFirstPublicResult");
    const { buildSnapshotMetadata } = await import(
      "@/app/results/[publicId]/snapshot-metadata"
    );
    const { generateMetadata } = await import("@/app/results/[publicId]/page");

    const metadata = (await buildSnapshotMetadata(
      "PrivacyFirstPublicResult",
    )) as Metadata;

    expect(metadata.robots).toEqual({
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

  it("builds absolute metadata from the immutable stored snapshot", async () => {
    repositoryState.record = buildStoredRecord("PreviewReadySnapshot");

    const { buildSnapshotMetadata } = await import(
      "@/app/results/[publicId]/snapshot-metadata"
    );

    const metadata = (await buildSnapshotMetadata(
      repositoryState.record.publicId,
    )) as Metadata;
    const expectedTitle = `${typeCopyDefinition.entries[8].title} 결과`;
    const expectedDescription = typeCopyDefinition.entries[8].summary;
    const expectedUrl = new URL(
      `/results/${repositoryState.record.publicId}`,
      "https://enneagram.example.com",
    ).toString();
    const expectedImage = new URL(
      `/results/${repositoryState.record.publicId}/opengraph-image`,
      "https://enneagram.example.com",
    ).toString();

    expect(metadata.metadataBase?.toString()).toBe("https://enneagram.example.com/");
    expect(metadata.title).toBe(expectedTitle);
    expect(metadata.description).toBe(expectedDescription);
    expect(metadata.openGraph).toMatchObject({
      title: expectedTitle,
      description: expectedDescription,
      type: "website",
      locale: "ko_KR",
      url: expectedUrl,
      images: [
        {
          url: expectedImage,
          alt: expectedTitle,
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: expectedTitle,
      description: expectedDescription,
      images: [expectedImage],
    });
  });

  it("keeps preview metadata and OG URLs free of raw answers and admin-only tokens", async () => {
    repositoryState.record = buildStoredRecord("PrivacyLeakRegression");

    const { buildSnapshotMetadata } = await import(
      "@/app/results/[publicId]/snapshot-metadata"
    );

    const metadata = (await buildSnapshotMetadata(
      repositoryState.record.publicId,
    )) as Metadata;
    const serializedMetadata = JSON.stringify(metadata);

    expect(serializedMetadata).toContain(
      `/results/${repositoryState.record.publicId}/opengraph-image`,
    );
    expect(serializedMetadata).not.toContain(repositoryState.record.adminToken);
    expect(serializedMetadata).not.toContain(JSON.stringify(repositoryState.record.answers));
    expect(serializedMetadata).not.toContain("AdminTokenForPublicResultPageTest");
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
