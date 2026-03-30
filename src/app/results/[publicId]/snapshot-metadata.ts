import type { Metadata } from "next";

import { DrizzleAssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import { ASSESSMENT_VERSION_V2 } from "@/domain/assessment/constants";
import { resolveResultCopy } from "@/domain/assessment/result-copy";
import type { AssessmentResultStatus, EnneagramType } from "@/domain/assessment/types";

function resolveMetadataBase(): URL {
  return new URL(process.env.APP_ORIGIN ?? "http://localhost:3000");
}

function buildV2MetadataDescription(
  primaryType: EnneagramType,
  resultStatus: AssessmentResultStatus,
): string {
  if (resultStatus === "mixed") {
    return `${primaryType}번을 포함한 근접 유형을 함께 읽는 성향 프로필 결과예요.`;
  }

  if (resultStatus === "insufficient_variance") {
    return "응답이 고르게 분포되어 재응답과 근접 유형 비교가 권장되는 성향 프로필 결과예요.";
  }

  return `${primaryType}번이 가장 가까운 유형 후보로 나타난 성향 프로필 결과예요.`;
}

export async function buildSnapshotMetadata(publicId: string): Promise<Metadata> {
  const repository = new DrizzleAssessmentResultRepository();
  const record = await repository.findByPublicId(publicId);

  if (!record) {
    return {
      title: "에니어그램 결과 스냅샷",
      description: `공개 결과 스냅샷 ${publicId}`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const copy = resolveResultCopy(
    record.copyVersion,
    Number(record.primaryType) as EnneagramType,
  );
  const primaryType = Number(record.primaryType) as EnneagramType;
  const isV2 = record.assessmentVersion === ASSESSMENT_VERSION_V2;
  const metadataBase = resolveMetadataBase();
  const title = isV2 ? `${copy.title} 유형 후보 결과` : `${copy.title} 결과`;
  const description = isV2
    ? buildV2MetadataDescription(
        primaryType,
        record.resultStatus as AssessmentResultStatus,
      )
    : copy.summary;
  const resultPath = `/results/${publicId}`;
  const imagePath = `${resultPath}/opengraph-image`;
  const resultUrl = new URL(resultPath, metadataBase).toString();
  const imageUrl = new URL(imagePath, metadataBase).toString();

  return {
    metadataBase,
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ko_KR",
      url: resultUrl,
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
