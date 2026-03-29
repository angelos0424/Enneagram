import React, { type JSX } from "react";
import { notFound } from "next/navigation";

import { DrizzleAssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import { resolveResultCopy } from "@/domain/assessment/result-copy";
import type { EnneagramType } from "@/domain/assessment/types";

import {
  ResultSnapshotView,
  type ResultSnapshotViewModel,
} from "./result-snapshot-view";
import { buildSnapshotMetadata } from "./snapshot-metadata";

type PublicResultPageProps = {
  params: Promise<{ publicId: string }>;
};

export async function generateMetadata({
  params,
}: PublicResultPageProps) {
  const { publicId } = await params;

  return buildSnapshotMetadata(publicId);
}

export default async function PublicResultPage({
  params,
}: PublicResultPageProps): Promise<JSX.Element> {
  const { publicId } = await params;
  const repository = new DrizzleAssessmentResultRepository();
  const record = await repository.findByPublicId(publicId);

  if (!record) {
    notFound();
  }

  const snapshot: ResultSnapshotViewModel = {
    publicId: record.publicId,
    primaryType: Number(record.primaryType) as EnneagramType,
    wingType: Number(record.wingType) as EnneagramType,
    growthType: Number(record.growthType) as EnneagramType,
    stressType: Number(record.stressType) as EnneagramType,
    normalizedScores: record.normalizedScores,
    nearbyTypes: record.nearbyTypes,
    copy: resolveResultCopy(
      record.copyVersion,
      Number(record.primaryType) as EnneagramType,
    ),
  };

  return <ResultSnapshotView snapshot={snapshot} />;
}
