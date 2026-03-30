import type { Metadata } from "next";

import { DrizzleAssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import { resolveResultCopy } from "@/domain/assessment/result-copy";
import type { EnneagramType } from "@/domain/assessment/types";

function resolveMetadataBase(): URL {
  return new URL(process.env.APP_ORIGIN ?? "http://localhost:3000");
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
  const metadataBase = resolveMetadataBase();
  const title = `${copy.title} 결과`;
  const description = copy.summary;
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
