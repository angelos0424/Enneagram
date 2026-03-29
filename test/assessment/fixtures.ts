import { assessmentDefinition } from "@/content/assessments/ko/v1";
import type {
  EnneagramType,
  LikertValue,
} from "@/domain/assessment/types";

export type AssessmentAnswer = {
  questionId: string;
  value: LikertValue;
};

function buildAnswers(
  resolver: (question: (typeof assessmentDefinition.questions)[number]) => LikertValue,
): AssessmentAnswer[] {
  return assessmentDefinition.questions.map((question) => ({
    questionId: question.id,
    value: resolver(question),
  }));
}

export function buildUniformAnswers(value: LikertValue): AssessmentAnswer[] {
  return buildAnswers(() => value);
}

export function buildTypeDominantAnswers(
  typeId: EnneagramType,
): AssessmentAnswer[] {
  return buildAnswers((question) => {
    const dominantWeight = Math.max(...question.typeWeights[typeId]);

    return question.typeWeights[typeId][4] === dominantWeight ? 5 : 1;
  });
}

export function buildEqualTopAnswers(
  [typeA, typeB]: readonly [EnneagramType, EnneagramType],
): AssessmentAnswer[] {
  return buildAnswers((question) => {
    const dominantTypeIds = Object.entries(question.typeWeights)
      .filter(([, weights]) => weights[4] === Math.max(...weights))
      .map(([typeId]) => Number(typeId) as EnneagramType);

    return dominantTypeIds.includes(typeA) || dominantTypeIds.includes(typeB)
      ? 5
      : 1;
  });
}
