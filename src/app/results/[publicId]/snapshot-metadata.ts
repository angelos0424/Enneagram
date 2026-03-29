import type { Metadata } from "next";

export function buildSnapshotMetadata(publicId: string): Metadata {
  return {
    title: "에니어그램 결과 스냅샷",
    description: `공개 결과 스냅샷 ${publicId}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}
