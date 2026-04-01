import type { AssessmentDimension, EnneagramType } from "@/domain/assessment/types";

export type DiscriminatorPairReview = {
  readonly familyKey: `${EnneagramType}-${EnneagramType}`;
  readonly pair: readonly [EnneagramType, EnneagramType];
  readonly questionIds: readonly [string, string, string];
  readonly expectedDimensions: readonly [AssessmentDimension, AssessmentDimension, AssessmentDimension];
  readonly summary: string;
  readonly references: readonly {
    readonly title: string;
    readonly url: string;
  }[];
};

export const discriminatorPairReviewsV3 = [
  {
    familyKey: "1-6",
    pair: [1, 6],
    questionIds: ["q3_001", "q3_002", "q3_003"],
    expectedDimensions: ["motivation", "attention", "defense"],
    summary:
      "1번과 6번은 둘 다 의무감이 강해 보이지만, 1번은 내적 기준과 확신 쪽이고 6번은 불확실성, 점검, 검증된 지지 쪽이 더 핵심이다.",
    references: [
      {
        title: "Misidentifying Ones and Sixes - The Enneagram Institute",
        url: "https://www.enneagraminstitute.com/misidentifying-1-and-6/",
      },
    ],
  },
  {
    familyKey: "2-9",
    pair: [2, 9],
    questionIds: ["q3_004", "q3_005", "q3_006"],
    expectedDimensions: ["motivation", "attention", "defense"],
    summary:
      "2번과 9번은 둘 다 타인을 배려하지만, 2번은 상대의 필요를 읽고 필요한 사람이 되려는 쪽이고 9번은 편안함과 갈등 최소화를 우선하는 쪽이 더 두드러진다.",
    references: [
      {
        title: "Misidentifying Twos and Nines - The Enneagram Institute",
        url: "https://www.enneagraminstitute.com/misidentifying-2-and-9",
      },
    ],
  },
  {
    familyKey: "3-8",
    pair: [3, 8],
    questionIds: ["q3_007", "q3_008", "q3_009"],
    expectedDimensions: ["motivation", "attention", "defense"],
    summary:
      "3번과 8번은 둘 다 추진력이 강하지만, 3번은 성과와 효율, 인정이 핵심이고 8번은 통제권, 힘의 흐름, 직접 장악이 핵심이다.",
    references: [
      {
        title: "Misidentifying Threes and Eights - The Enneagram Institute",
        url: "https://www.enneagraminstitute.com/misidentifying-3-and-8/",
      },
    ],
  },
  {
    familyKey: "4-5",
    pair: [4, 5],
    questionIds: ["q3_010", "q3_011", "q3_012"],
    expectedDimensions: ["motivation", "attention", "defense"],
    summary:
      "4번과 5번은 둘 다 withdrawn type이지만, 4번은 주관적 감정과 정체성의 진정성을 더 보고 5번은 이해, 구조, 추상적 파악 쪽으로 더 물러난다.",
    references: [
      {
        title: "Misidentifying 4 and 5 - The Enneagram Institute",
        url: "https://www.enneagraminstitute.com/misidentifying-4-and-5/",
      },
    ],
  },
  {
    familyKey: "6-9",
    pair: [6, 9],
    questionIds: ["q3_013", "q3_014", "q3_015"],
    expectedDimensions: ["motivation", "attention", "interpersonal"],
    summary:
      "6번과 9번은 둘 다 안정성을 중시하지만, 6번은 위협 점검과 검증된 기준, 테스트가 핵심이고 9번은 평온 유지와 충돌 최소화가 핵심이다.",
    references: [
      {
        title: "Misidentifying 6 and 9 - The Enneagram Institute",
        url: "https://www.enneagraminstitute.com/misidentifying-6-and-9/",
      },
    ],
  },
  {
    familyKey: "7-8",
    pair: [7, 8],
    questionIds: ["q3_016", "q3_017", "q3_018"],
    expectedDimensions: ["motivation", "attention", "defense"],
    summary:
      "7번과 8번은 둘 다 assertive type이지만, 7번은 선택지와 재미, 탈출구 확대 쪽이고 8번은 강도, 현실 장악, 힘의 확보 쪽이 구분축이 된다.",
    references: [
      {
        title: "Misidentifying Sevens and Eights - The Enneagram Institute",
        url: "https://www.enneagraminstitute.com/misidentifying-7-and-8/",
      },
    ],
  },
] as const satisfies readonly DiscriminatorPairReview[];
