import React, { type JSX } from "react";
import { notFound } from "next/navigation";

import { resolveAssessmentDefinition } from "@/content/assessments";
import type { AssessmentResultRecord } from "@/db/schema";
import { DrizzleAssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import {
  ASSESSMENT_VERSION_V1,
  ASSESSMENT_VERSION_V3,
} from "@/domain/assessment/constants";
import { resolveResultCopy } from "@/domain/assessment/result-copy";
import type {
  AssessmentQuestion,
  ForcedChoiceAssessmentQuestion,
  LikertAssessmentAnswer,
  AssessmentResultStatus,
  EnneagramType,
  ForcedChoiceAssessmentAnswer,
  KeyedAssessmentQuestion,
  WeightedAssessmentQuestion,
} from "@/domain/assessment/types";

import {
  ResultSnapshotView,
  type ResultSnapshotViewModel,
} from "./result-snapshot-view";
import { buildSnapshotMetadata } from "./snapshot-metadata";

type PublicResultPageProps = {
  params: Promise<{ publicId: string }>;
};

const centers = [
  { label: "장형", typeIds: [8, 9, 1] as const },
  { label: "가슴형", typeIds: [2, 3, 4] as const },
  { label: "머리형", typeIds: [5, 6, 7] as const },
] as const;
const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];

function isWeightedQuestion(
  question: AssessmentQuestion,
): question is WeightedAssessmentQuestion {
  return "typeWeights" in question;
}

function isKeyedQuestion(
  question: AssessmentQuestion,
): question is KeyedAssessmentQuestion {
  return "keyedType" in question && "reverse" in question;
}

function isForcedChoiceQuestion(
  question: AssessmentQuestion,
): question is ForcedChoiceAssessmentQuestion {
  return "left" in question && "right" in question;
}

function isLikertAnswer(
  answer: AssessmentResultRecord["answers"][number],
): answer is LikertAssessmentAnswer {
  return "value" in answer;
}

function isForcedChoiceAnswer(
  answer: AssessmentResultRecord["answers"][number],
): answer is ForcedChoiceAssessmentAnswer {
  return "selectedSide" in answer;
}

function buildLikertQuestionEvidenceSummary(
  assessmentVersion: string,
  answers: AssessmentResultRecord["answers"],
  primaryType: EnneagramType,
) {
  const definition = resolveAssessmentDefinition(assessmentVersion);

  if (!definition) {
    return [];
  }

  const answerValueByQuestionId = new Map(
    answers
      .filter(isLikertAnswer)
      .map((answer) => [answer.questionId, answer.value] as const),
  );
  const likertLabelByValue = new Map(
    definition.likertOptions.map((option) => [option.value, option.label] as const),
  );

  return definition.questions
    .map((question) => {
      if (isForcedChoiceQuestion(question)) {
        return null;
      }

      const answerValue = answerValueByQuestionId.get(question.id);

      if (answerValue === undefined) {
        return null;
      }

      if (isWeightedQuestion(question)) {
        const answerIndex = answerValue - 1;
        const primaryWeight = question.typeWeights[primaryType][answerIndex];
        const dominantWeight = Math.max(
          ...enneagramTypes.map((typeId) => question.typeWeights[typeId][answerIndex]),
        );

        if (primaryWeight <= 0 || primaryWeight !== dominantWeight) {
          return null;
        }

        return {
          question,
          answerValue,
          contribution: primaryWeight,
          answerLabel: likertLabelByValue.get(answerValue) ?? `${answerValue}점`,
        };
      }

      if (!isKeyedQuestion(question) || question.keyedType !== primaryType) {
        return null;
      }

      const centeredContribution = question.reverse ? 3 - answerValue : answerValue - 3;

      if (centeredContribution <= 0) {
        return null;
      }

      return {
        question,
        answerValue,
        contribution: centeredContribution,
        answerLabel: likertLabelByValue.get(answerValue) ?? `${answerValue}점`,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort(
      (left, right) =>
        right.contribution - left.contribution ||
        right.answerValue - left.answerValue ||
        left.question.id.localeCompare(right.question.id),
    )
    .slice(0, 2)
    .map(
      (item) =>
        `“${item.question.prompt}” 문항에 “${item.answerLabel}”로 답해 ${primaryType}번 유형 쪽 점수가 올라갔어요.`,
    );
}

function buildForcedChoiceQuestionEvidenceSummary(
  assessmentVersion: string,
  answers: AssessmentResultRecord["answers"],
  primaryType: EnneagramType,
  secondaryType: EnneagramType,
  resultStatus: AssessmentResultStatus,
) {
  const definition = resolveAssessmentDefinition(assessmentVersion);

  if (!definition) {
    return [];
  }

  const questionById = new Map(
    definition.questions
      .filter(isForcedChoiceQuestion)
      .map((question) => [question.id, question] as const),
  );
  const forcedChoiceAnswers = answers.filter(isForcedChoiceAnswer);
  const primaryChoices = forcedChoiceAnswers
    .map((answer) => {
      const question = questionById.get(answer.questionId);

      if (!question) {
        return null;
      }

      const selectedStatement =
        answer.selectedSide === "left" ? question.left : question.right;

      if (selectedStatement.keyedType !== primaryType) {
        return null;
      }

      return {
        question,
        selectedStatement,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort(
      (left, right) =>
        Number(right.question.pairCategory === "discriminator") -
          Number(left.question.pairCategory === "discriminator") ||
        left.question.id.localeCompare(right.question.id),
    )
    .slice(0, 2)
    .map(
      (item) =>
        `“${item.selectedStatement.prompt}” 쪽 설명을 고른 선택이 ${primaryType}번 후보 점수를 올렸어요.`,
    );
  const directDiscriminator = forcedChoiceAnswers.find((answer) => {
    const question = questionById.get(answer.questionId);

    if (!question || question.pairCategory !== "discriminator") {
      return false;
    }

    const typeIds = [question.left.keyedType, question.right.keyedType];

    return typeIds.includes(primaryType) && typeIds.includes(secondaryType);
  });

  if (!directDiscriminator) {
    return primaryChoices;
  }

  const discriminatorQuestion = questionById.get(directDiscriminator.questionId)!;
  const selectedStatement =
    directDiscriminator.selectedSide === "left"
      ? discriminatorQuestion.left
      : discriminatorQuestion.right;
  const oppositeStatement =
    directDiscriminator.selectedSide === "left"
      ? discriminatorQuestion.right
      : discriminatorQuestion.left;
  const discriminatorSummary =
    resultStatus === "mixed"
      ? `${primaryType}번과 ${secondaryType}번을 가르는 문항에서는 “${selectedStatement.prompt}” 쪽을 골라 ${selectedStatement.keyedType}번 쪽 해석이 조금 더 앞섰어요.`
      : `${primaryType}번과 ${secondaryType}번을 가르는 문항에서 “${selectedStatement.prompt}”를 택하고 “${oppositeStatement.prompt}”보다 더 가깝다고 본 선택이 결정적 근거로 작용했어요.`;

  return [discriminatorSummary, ...primaryChoices].slice(0, 3);
}

function buildRationaleSummary(
  record: AssessmentResultRecord,
  primaryType: EnneagramType,
  secondaryType: EnneagramType,
  primaryCopy: ReturnType<typeof resolveResultCopy>,
) {
  const definition = resolveAssessmentDefinition(record.assessmentVersion);
  const questionEvidence =
    definition && definition.questions.every(isForcedChoiceQuestion)
      ? buildForcedChoiceQuestionEvidenceSummary(
          record.assessmentVersion,
          record.answers,
          primaryType,
          secondaryType,
          record.resultStatus as AssessmentResultStatus,
        )
      : buildLikertQuestionEvidenceSummary(
          record.assessmentVersion,
          record.answers,
          primaryType,
        );
  const summary = [
    `${primaryType}번 유형이 가장 높은 점수(${record.normalizedScores[primaryType]})로 나타났어요.`,
    record.nearbyTypes.length > 0
      ? `가장 가까운 근접 유형은 ${record.nearbyTypes
          .slice(0, 2)
          .map((item) => `${item.typeId}번`)
          .join(", ")}이며 함께 참고하면 좋아요.`
      : "다른 유형보다 현재 주유형의 점수가 상대적으로 또렷하게 나타났어요.",
  ];

  if (questionEvidence.length > 0) {
    return summary.concat(questionEvidence);
  }

  return summary.concat(
    record.resultStatus === "mixed"
      ? "상위 유형 간 차이가 크지 않아 특정 문항보다 전체 응답 패턴을 함께 읽는 편이 더 적절해요."
      : record.resultStatus === "insufficient_variance"
        ? "응답이 전반적으로 고르게 분포되어 특정 문항 근거보다 재응답 비교가 더 중요해요."
        : primaryCopy.summary,
  );
}

function resolveCenterType(
  normalizedScores: Record<EnneagramType, number>,
  typeIds: readonly EnneagramType[],
) {
  return [...typeIds].sort((left, right) => {
    const scoreDifference = normalizedScores[right] - normalizedScores[left];

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return left - right;
  })[0];
}

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
  const isModern = record.assessmentVersion !== ASSESSMENT_VERSION_V1;
  const isV3 = record.assessmentVersion === ASSESSMENT_VERSION_V3;

  const primaryType = Number(record.primaryType) as EnneagramType;
  const primaryCopy = resolveResultCopy(record.copyVersion, primaryType);
  const topTypes = ([primaryType] as EnneagramType[])
    .concat(record.nearbyTypes.map((item) => item.typeId))
    .slice(0, 3)
    .map((typeId) => {
      const copy = resolveResultCopy(record.copyVersion, typeId);

      return {
        typeId,
        score: record.normalizedScores[typeId],
        title: copy.title,
        summary: copy.summary,
      };
    });
  const rationaleSummary = buildRationaleSummary(
    record,
    primaryType,
    topTypes[1]?.typeId ?? primaryType,
    primaryCopy,
  );

  const snapshot: ResultSnapshotViewModel = {
    publicId: record.publicId,
    assessmentVersion: record.assessmentVersion,
    resultStatus: record.resultStatus as AssessmentResultStatus,
    confidenceScore: record.confidenceScore,
    isModern,
    isV3,
    primaryType,
    wingType,
    growthType: Number(record.growthType) as EnneagramType,
    stressType: Number(record.stressType) as EnneagramType,
    normalizedScores: record.normalizedScores,
    nearbyTypes: record.nearbyTypes,
    centers: centers.map((center) => {
      const typeId = resolveCenterType(record.normalizedScores, center.typeIds);

      const centerCopy = resolveResultCopy(record.copyVersion, typeId);

      return {
        label: center.label,
        typeId,
        detail: centerCopy.title,
        modalCopy: {
          title: centerCopy.title,
          summary: centerCopy.summary,
        },
      };
    }),
    topTypes,
    rationaleSummary,
    copy: primaryCopy,
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
