import { assessmentDefinition } from "@/content/assessments/ko/v1";
import { assessmentDefinitionV2 } from "@/content/assessments/ko/v2";
import { NEARBY_TYPE_LIMIT } from "@/domain/assessment/constants";
import { growthStressMap, wingAdjacencyMap } from "@/domain/assessment/mappings";
import {
  normalizeIndependentScores,
  normalizeRawScores,
} from "@/domain/assessment/normalization";
import type { AssessmentSubmission } from "@/domain/assessment/schema";
import type {
  AssessmentDefinition,
  AssessmentResultStatus,
  KeyedAssessmentQuestion,
  EnneagramType,
  NearbyTypeScore,
  WeightedAssessmentQuestion,
} from "@/domain/assessment/types";

const supportedAssessments: Record<string, AssessmentDefinition> = {
  [assessmentDefinition.version]: assessmentDefinition,
  [assessmentDefinitionV2.version]: assessmentDefinitionV2,
};

const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];

export type AssessmentScoreErrorCode =
  | "UNKNOWN_ASSESSMENT_VERSION"
  | "DUPLICATE_QUESTION_ID"
  | "INCOMPLETE_ANSWER_COVERAGE";

export class AssessmentScoringError extends Error {
  constructor(
    readonly code: AssessmentScoreErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AssessmentScoringError";
  }
}

export type AssessmentScoreResult = {
  assessmentVersion: string;
  scoringVersion: string;
  copyVersion: string;
  rawScores: Record<EnneagramType, number>;
  normalizedScores: Record<EnneagramType, number>;
  primaryType: EnneagramType;
  wingType: EnneagramType | null;
  growthType: EnneagramType;
  stressType: EnneagramType;
  nearbyTypes: NearbyTypeScore[];
  resultStatus: AssessmentResultStatus;
  confidenceScore: number;
};

export function scoreAssessment(
  submission: AssessmentSubmission,
): AssessmentScoreResult {
  const definition = supportedAssessments[submission.assessmentVersion];

  if (!definition) {
    throw new AssessmentScoringError(
      "UNKNOWN_ASSESSMENT_VERSION",
      `Unknown assessment version: ${submission.assessmentVersion}`,
    );
  }

  assertQuestionCoverage(definition, submission.answers);

  const answerByQuestionId = new Map(
    submission.answers.map((answer) => [answer.questionId, answer.value] as const),
  );
  const scores = isWeightedAssessmentDefinition(definition)
    ? scoreWeightedAssessment(definition, answerByQuestionId)
    : scoreKeyedAssessment(
        definition as AssessmentDefinition<KeyedAssessmentQuestion>,
        answerByQuestionId,
      );
  const sortedTypeIds = [...enneagramTypes].sort((leftTypeId, rightTypeId) => {
    const rawScoreDelta = scores.rawScores[rightTypeId] - scores.rawScores[leftTypeId];

    if (rawScoreDelta !== 0) {
      return rawScoreDelta;
    }

    return leftTypeId - rightTypeId;
  });
  const primaryType = sortedTypeIds[0];
  const wingType = isWeightedAssessmentDefinition(definition)
    ? resolveLegacyWingType(primaryType, scores.rawScores)
    : resolveOptionalWingType(primaryType, scores.rawScores, scores.resultStatus);
  const nearbyTypes = sortedTypeIds
    .filter((typeId) => typeId !== primaryType)
    .slice(0, NEARBY_TYPE_LIMIT)
    .map(
      (typeId): NearbyTypeScore => ({
        typeId,
        rawScore: scores.rawScores[typeId],
        normalizedScore: scores.normalizedScores[typeId],
        gapFromPrimary: scores.rawScores[primaryType] - scores.rawScores[typeId],
      }),
    );
  const confidenceScore = Math.round(
    (scores.normalizedScores[primaryType] - scores.normalizedScores[sortedTypeIds[1]]) * 10,
  ) / 10;

  return {
    assessmentVersion: definition.version,
    scoringVersion: definition.scoringVersion,
    copyVersion: definition.copyVersion,
    rawScores: scores.rawScores,
    normalizedScores: scores.normalizedScores,
    primaryType,
    wingType,
    growthType: growthStressMap[primaryType].growth,
    stressType: growthStressMap[primaryType].stress,
    nearbyTypes,
    resultStatus: scores.resultStatus,
    confidenceScore,
  };
}

function assertQuestionCoverage(
  definition: AssessmentDefinition,
  answers: AssessmentSubmission["answers"],
): void {
  const seenQuestionIds = new Set<string>();

  for (const answer of answers) {
    if (seenQuestionIds.has(answer.questionId)) {
      throw new AssessmentScoringError(
        "DUPLICATE_QUESTION_ID",
        `Duplicate questionId: ${answer.questionId}`,
      );
    }

    seenQuestionIds.add(answer.questionId);
  }

  const expectedQuestionIds = new Set(definition.questions.map((question) => question.id));

  if (answers.length !== definition.questions.length) {
    throw new AssessmentScoringError(
      "INCOMPLETE_ANSWER_COVERAGE",
      "Answers must cover the full assessment exactly once.",
    );
  }

  for (const questionId of seenQuestionIds) {
    if (!expectedQuestionIds.has(questionId)) {
      throw new AssessmentScoringError(
        "INCOMPLETE_ANSWER_COVERAGE",
        `Unexpected questionId: ${questionId}`,
      );
    }
  }

  for (const questionId of expectedQuestionIds) {
    if (!seenQuestionIds.has(questionId)) {
      throw new AssessmentScoringError(
        "INCOMPLETE_ANSWER_COVERAGE",
        `Missing questionId: ${questionId}`,
      );
    }
  }
}

function buildEmptyRawScores(): Record<EnneagramType, number> {
  return {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };
}

function isWeightedAssessmentDefinition(
  definition: AssessmentDefinition,
): definition is AssessmentDefinition<WeightedAssessmentQuestion> {
  return definition.questions.every((question) => "typeWeights" in question);
}

function scoreWeightedAssessment(
  definition: AssessmentDefinition<WeightedAssessmentQuestion>,
  answerByQuestionId: Map<string, AssessmentSubmission["answers"][number]["value"]>,
): {
  rawScores: Record<EnneagramType, number>;
  normalizedScores: Record<EnneagramType, number>;
  resultStatus: AssessmentResultStatus;
} {
  const rawScores = buildEmptyRawScores();

  for (const question of definition.questions) {
    const answerValue = answerByQuestionId.get(question.id);

    if (!answerValue) {
      throw new AssessmentScoringError(
        "INCOMPLETE_ANSWER_COVERAGE",
        `Missing answer for question ${question.id}`,
      );
    }

    for (const typeId of enneagramTypes) {
      rawScores[typeId] += question.typeWeights[typeId][answerValue - 1];
    }
  }

  return {
    rawScores,
    normalizedScores: normalizeRawScores(rawScores),
    resultStatus: "clear",
  };
}

function scoreKeyedAssessment(
  definition: AssessmentDefinition<KeyedAssessmentQuestion>,
  answerByQuestionId: Map<string, AssessmentSubmission["answers"][number]["value"]>,
): {
  rawScores: Record<EnneagramType, number>;
  normalizedScores: Record<EnneagramType, number>;
  resultStatus: AssessmentResultStatus;
} {
  const rawScores = buildEmptyRawScores();
  const itemCountsByType = buildEmptyRawScores();
  const answerValues: number[] = [];

  for (const question of definition.questions) {
    const answerValue = answerByQuestionId.get(question.id);

    if (!answerValue) {
      throw new AssessmentScoringError(
        "INCOMPLETE_ANSWER_COVERAGE",
        `Missing answer for question ${question.id}`,
      );
    }

    itemCountsByType[question.keyedType] += 1;
    answerValues.push(answerValue);

    const centeredScore = question.reverse ? 3 - answerValue : answerValue - 3;
    rawScores[question.keyedType] += centeredScore;
  }

  const maxAbsoluteScores = {
    1: itemCountsByType[1] * 2,
    2: itemCountsByType[2] * 2,
    3: itemCountsByType[3] * 2,
    4: itemCountsByType[4] * 2,
    5: itemCountsByType[5] * 2,
    6: itemCountsByType[6] * 2,
    7: itemCountsByType[7] * 2,
    8: itemCountsByType[8] * 2,
    9: itemCountsByType[9] * 2,
  } satisfies Record<EnneagramType, number>;
  const normalizedScores = normalizeIndependentScores(rawScores, maxAbsoluteScores);
  const uniqueAnswerValues = new Set(answerValues);
  const sortedTypeIds = [...enneagramTypes].sort(
    (leftTypeId, rightTypeId) =>
      rawScores[rightTypeId] - rawScores[leftTypeId] || leftTypeId - rightTypeId,
  );
  const topGap = rawScores[sortedTypeIds[0]] - rawScores[sortedTypeIds[1]];
  const resultStatus: AssessmentResultStatus =
    uniqueAnswerValues.size <= 1
      ? "insufficient_variance"
      : topGap <= 1
        ? "mixed"
        : "clear";

  return {
    rawScores,
    normalizedScores,
    resultStatus,
  };
}

function resolveLegacyWingType(
  primaryType: EnneagramType,
  rawScores: Record<EnneagramType, number>,
): EnneagramType {
  const [adjacentTypeA, adjacentTypeB] = wingAdjacencyMap[primaryType];

  if (rawScores[adjacentTypeA] === rawScores[adjacentTypeB]) {
    return adjacentTypeA < adjacentTypeB ? adjacentTypeA : adjacentTypeB;
  }

  return rawScores[adjacentTypeA] > rawScores[adjacentTypeB]
    ? adjacentTypeA
    : adjacentTypeB;
}

function resolveOptionalWingType(
  primaryType: EnneagramType,
  rawScores: Record<EnneagramType, number>,
  resultStatus: AssessmentResultStatus,
): EnneagramType | null {
  if (resultStatus !== "clear") {
    return null;
  }

  const [adjacentTypeA, adjacentTypeB] = wingAdjacencyMap[primaryType];
  const scoreA = rawScores[adjacentTypeA];
  const scoreB = rawScores[adjacentTypeB];

  if (scoreA === scoreB) {
    return null;
  }

  const dominantWing = scoreA > scoreB ? adjacentTypeA : adjacentTypeB;
  const dominantScore = rawScores[dominantWing];
  const wingGap = Math.abs(scoreA - scoreB);

  if (dominantScore <= 0 || wingGap < 2) {
    return null;
  }

  return dominantWing;
}
