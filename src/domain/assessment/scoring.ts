import { assessmentDefinition } from "@/content/assessments/ko/v1";
import { NEARBY_TYPE_LIMIT } from "@/domain/assessment/constants";
import { growthStressMap, wingAdjacencyMap } from "@/domain/assessment/mappings";
import { normalizeRawScores } from "@/domain/assessment/normalization";
import type { AssessmentSubmission } from "@/domain/assessment/schema";
import type {
  AssessmentDefinition,
  EnneagramType,
  NearbyTypeScore,
} from "@/domain/assessment/types";

const supportedAssessments: Record<string, AssessmentDefinition> = {
  [assessmentDefinition.version]: assessmentDefinition,
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
  wingType: EnneagramType;
  growthType: EnneagramType;
  stressType: EnneagramType;
  nearbyTypes: NearbyTypeScore[];
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

  const normalizedScores = normalizeRawScores(rawScores);
  const sortedTypeIds = [...enneagramTypes].sort((leftTypeId, rightTypeId) => {
    const rawScoreDelta = rawScores[rightTypeId] - rawScores[leftTypeId];

    if (rawScoreDelta !== 0) {
      return rawScoreDelta;
    }

    return leftTypeId - rightTypeId;
  });
  const primaryType = sortedTypeIds[0];
  const wingType = resolveWingType(primaryType, rawScores);
  const nearbyTypes = sortedTypeIds
    .filter((typeId) => typeId !== primaryType)
    .slice(0, NEARBY_TYPE_LIMIT)
    .map(
      (typeId): NearbyTypeScore => ({
        typeId,
        rawScore: rawScores[typeId],
        normalizedScore: normalizedScores[typeId],
        gapFromPrimary: rawScores[primaryType] - rawScores[typeId],
      }),
    );

  return {
    assessmentVersion: definition.version,
    scoringVersion: definition.scoringVersion,
    copyVersion: definition.copyVersion,
    rawScores,
    normalizedScores,
    primaryType,
    wingType,
    growthType: growthStressMap[primaryType].growth,
    stressType: growthStressMap[primaryType].stress,
    nearbyTypes,
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

function resolveWingType(
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
