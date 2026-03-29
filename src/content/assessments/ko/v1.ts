import {
  ASSESSMENT_VERSION,
  COPY_VERSION,
  SCORING_VERSION,
} from "@/domain/assessment/constants";
import type {
  AssessmentDefinition,
  AssessmentQuestion,
  EnneagramType,
  LikertOption,
} from "@/domain/assessment/types";

const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];

const questionFocusById = {
  q_001: 1,
  q_002: 1,
  q_003: 2,
  q_004: 2,
  q_005: 3,
  q_006: 3,
  q_007: 4,
  q_008: 4,
  q_009: 5,
  q_010: 5,
  q_011: 6,
  q_012: 6,
  q_013: 7,
  q_014: 7,
  q_015: 8,
  q_016: 8,
  q_017: 9,
  q_018: 9,
} as const satisfies Record<string, EnneagramType>;

const typeNeighbors: Record<EnneagramType, readonly EnneagramType[]> = {
  1: [2, 9],
  2: [1, 3],
  3: [2, 4],
  4: [3, 5],
  5: [4, 6],
  6: [5, 7],
  7: [6, 8],
  8: [7, 9],
  9: [8, 1],
};

export const likertOptions = [
  { value: 1, label: "전혀 나와 맞지 않는다" },
  { value: 2, label: "별로 맞지 않는다" },
  { value: 3, label: "반반이다" },
  { value: 4, label: "꽤 맞는다" },
  { value: 5, label: "매우 잘 맞는다" },
] as const satisfies readonly LikertOption[];

function buildTypeWeights(
  primaryType: EnneagramType,
): AssessmentQuestion["typeWeights"] {
  const neighboringTypes = new Set(typeNeighbors[primaryType]);
  const typeWeights = {} as AssessmentQuestion["typeWeights"];

  for (const typeId of enneagramTypes) {
    const base =
      typeId === primaryType
        ? ([0, 1, 2, 4, 6] as const)
        : neighboringTypes.has(typeId)
          ? ([0, 1, 1, 2, 3] as const)
          : ([0, 0, 1, 1, 1] as const);

    typeWeights[typeId] = base;
  }

  return typeWeights;
}

const questionPrompts = [
  ["q_001", "나는 기준에 맞지 않는 상황을 보면 그냥 넘기기 어렵다."],
  ["q_002", "나는 해야 할 일을 제대로 해내는지 자주 스스로 점검한다."],
  ["q_003", "나는 주변 사람이 필요로 하는 마음을 빨리 알아차리는 편이다."],
  ["q_004", "나는 도움이 필요해 보이는 사람을 보면 먼저 손을 내밀고 싶다."],
  ["q_005", "나는 인정받을 만한 성과를 내고 있는지가 중요한 편이다."],
  ["q_006", "나는 목표를 정하면 효율적으로 결과를 만드는 데 집중한다."],
  ["q_007", "나는 내 감정의 결을 섬세하게 느끼고 표현하려는 편이다."],
  ["q_008", "나는 평범함보다 나만의 의미와 진정성이 더 중요하다."],
  ["q_009", "나는 충분히 이해될 때까지 혼자 깊게 생각하는 시간이 필요하다."],
  ["q_010", "나는 감정보다 지식과 분석으로 상황을 파악하려는 편이다."],
  ["q_011", "나는 예상치 못한 문제가 생기지 않도록 미리 대비하려는 편이다."],
  ["q_012", "나는 사람이나 상황을 쉽게 믿기보다 확인하고 판단하려 한다."],
  ["q_013", "나는 재미있고 새로운 가능성을 떠올리면 금방 에너지가 올라간다."],
  ["q_014", "나는 답답한 상황에 오래 머무르기보다 다른 선택지를 찾고 싶다."],
  ["q_015", "나는 중요한 순간에 주도권을 잡고 밀어붙이는 편이다."],
  ["q_016", "나는 약해 보이기보다 단호하고 강하게 보이고 싶을 때가 많다."],
  ["q_017", "나는 갈등을 키우기보다 전체 분위기가 편안해지도록 맞추는 편이다."],
  ["q_018", "나는 내 의견이 있어도 주변과 조화를 이루는 쪽을 먼저 생각한다."],
] as const;

export const assessmentQuestions = questionPrompts.map(([id, prompt]) => ({
  id,
  prompt,
  typeWeights: buildTypeWeights(questionFocusById[id]),
})) as readonly AssessmentQuestion[];

export const assessmentDefinition = {
  version: ASSESSMENT_VERSION,
  locale: "ko-KR",
  scoringVersion: SCORING_VERSION,
  copyVersion: COPY_VERSION,
  likertOptions,
  questions: assessmentQuestions,
} as const satisfies AssessmentDefinition;
