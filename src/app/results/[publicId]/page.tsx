import React, { type JSX } from "react";
import { notFound } from "next/navigation";

import { DrizzleAssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import { ASSESSMENT_VERSION_V2 } from "@/domain/assessment/constants";
import { resolveResultCopy } from "@/domain/assessment/result-copy";
import type {
  AssessmentResultStatus,
  EnneagramType,
} from "@/domain/assessment/types";

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

  const wingType =
    record.wingType === null ? null : (Number(record.wingType) as EnneagramType);
  const isV2 = record.assessmentVersion === ASSESSMENT_VERSION_V2;

  const snapshot: ResultSnapshotViewModel = {
    publicId: record.publicId,
    assessmentVersion: record.assessmentVersion,
    resultStatus: record.resultStatus as AssessmentResultStatus,
    confidenceScore: record.confidenceScore,
    isV2,
    primaryType: Number(record.primaryType) as EnneagramType,
    wingType,
    growthType: Number(record.growthType) as EnneagramType,
    stressType: Number(record.stressType) as EnneagramType,
    normalizedScores: record.normalizedScores,
    nearbyTypes: record.nearbyTypes,
    copy: resolveResultCopy(
      record.copyVersion,
      Number(record.primaryType) as EnneagramType,
    ),
    wingCopy:
      wingType === null
        ? null
        : resolveResultCopy(record.copyVersion, wingType),
    growthCopy: resolveResultCopy(
      record.copyVersion,
      Number(record.growthType) as EnneagramType,
    ),
    stressCopy: resolveResultCopy(
      record.copyVersion,
      Number(record.stressType) as EnneagramType,
    ),
    detailCards: resolveResultCopy(
      record.copyVersion,
      Number(record.primaryType) as EnneagramType,
    ).detailCards,
    disclaimer: resolveResultCopy(
      record.copyVersion,
      Number(record.primaryType) as EnneagramType,
    ).disclaimer,
    recommendations: resolveResultCopy(
      record.copyVersion,
      Number(record.primaryType) as EnneagramType,
    ).recommendations,
  };

  return <ResultSnapshotView snapshot={snapshot} />;
}
