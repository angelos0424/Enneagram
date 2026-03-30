import { likertOptions } from "@/content/assessments/ko/v1";
import {
  ASSESSMENT_VERSION_V2,
  COPY_VERSION_V2,
  SCORING_VERSION_V2,
} from "@/domain/assessment/constants";
import type {
  AssessmentDefinition,
  AssessmentDimension,
  EnneagramType,
  KeyedAssessmentQuestion,
} from "@/domain/assessment/types";

function createQuestion(
  id: string,
  prompt: string,
  keyedType: EnneagramType,
  dimension: AssessmentDimension,
  reverse = false,
): KeyedAssessmentQuestion {
  return {
    id,
    prompt,
    keyedType,
    reverse,
    dimension,
  };
}

export const assessmentQuestionsV2 = [
  createQuestion(
    "q2_001",
    "나는 스스로 옳다고 느끼는 기준을 지키지 못하면 마음이 불편하다.",
    1,
    "motivation",
  ),
  createQuestion(
    "q2_002",
    "나는 잘못되거나 비효율적인 부분이 눈에 잘 들어오는 편이다.",
    1,
    "attention",
  ),
  createQuestion(
    "q2_003",
    "실수가 보이면 그냥 넘기기보다 바로잡아야 마음이 놓인다.",
    1,
    "defense",
  ),
  createQuestion(
    "q2_004",
    "사람들이 각자 알아서 하면 된다고 생각해, 기준을 굳이 맞추려 하지 않는다.",
    1,
    "interpersonal",
    true,
  ),
  createQuestion(
    "q2_005",
    "사람에게 필요한 존재라고 느껴질 때 관계가 안정된다고 느낀다.",
    2,
    "motivation",
  ),
  createQuestion(
    "q2_006",
    "나는 사람들이 말하지 않아도 무엇이 필요한지 빨리 읽는 편이다.",
    2,
    "attention",
  ),
  createQuestion(
    "q2_007",
    "관계가 멀어질 것 같으면 먼저 챙기고 맞춰 주는 쪽으로 움직인다.",
    2,
    "defense",
  ),
  createQuestion(
    "q2_008",
    "나는 다른 사람의 기대나 감정보다 내 일만 챙기면 된다고 느끼는 편이다.",
    2,
    "interpersonal",
    true,
  ),
  createQuestion(
    "q2_009",
    "눈에 보이는 성과가 있어야 내 노력이 가치 있게 느껴진다.",
    3,
    "motivation",
  ),
  createQuestion(
    "q2_010",
    "무엇이 가장 효율적이고 빨리 먹히는지 먼저 계산하는 편이다.",
    3,
    "attention",
  ),
  createQuestion(
    "q2_011",
    "감정이 복잡해도 일단 해내는 쪽으로 에너지를 모으려 한다.",
    3,
    "defense",
  ),
  createQuestion(
    "q2_012",
    "나는 보이는 결과보다 과정만 만족스러우면 충분하다고 쉽게 느낀다.",
    3,
    "interpersonal",
    true,
  ),
  createQuestion(
    "q2_013",
    "남들과 같기보다 나다운 감정과 의미를 잃지 않는 것이 중요하다.",
    4,
    "motivation",
  ),
  createQuestion(
    "q2_014",
    "분위기보다 내 안의 미묘한 감정 변화가 먼저 느껴지는 편이다.",
    4,
    "attention",
  ),
  createQuestion(
    "q2_015",
    "공허함이 느껴질수록 더 진짜 같은 감정이나 의미를 찾게 된다.",
    4,
    "defense",
  ),
  createQuestion(
    "q2_016",
    "관계에서 내 감정을 자세히 드러내기보다 무난하게 넘어가고 싶은 편이다.",
    4,
    "interpersonal",
    true,
  ),
  createQuestion(
    "q2_017",
    "충분히 이해하지 못한 상태에서 움직이면 에너지가 쉽게 고갈된다.",
    5,
    "motivation",
  ),
  createQuestion(
    "q2_018",
    "사람보다 정보와 구조를 먼저 파악하려는 편이다.",
    5,
    "attention",
  ),
  createQuestion(
    "q2_019",
    "부담이 커질수록 거리를 두고 혼자 생각할 시간을 확보한다.",
    5,
    "defense",
  ),
  createQuestion(
    "q2_020",
    "나는 생각이 덜 정리돼도 사람들과 계속 부딪치며 답을 찾는 편이다.",
    5,
    "interpersonal",
    true,
  ),
  createQuestion(
    "q2_021",
    "확실한 기반과 믿을 수 있는 사람을 확인해야 안심이 된다.",
    6,
    "motivation",
  ),
  createQuestion(
    "q2_022",
    "문제가 생길 가능성과 허점이 먼저 보이는 편이다.",
    6,
    "attention",
  ),
  createQuestion(
    "q2_023",
    "불확실하면 최악의 경우를 가정하고 대비책을 찾는다.",
    6,
    "defense",
  ),
  createQuestion(
    "q2_024",
    "나는 불안한 상황에서도 의심 없이 바로 믿고 맡기는 편이다.",
    6,
    "interpersonal",
    true,
  ),
  createQuestion(
    "q2_025",
    "답답함보다 가능성과 선택지가 많은 상태에서 살아나는 편이다.",
    7,
    "motivation",
  ),
  createQuestion(
    "q2_026",
    "새로운 아이디어나 재미있는 기회가 금방 눈에 들어온다.",
    7,
    "attention",
  ),
  createQuestion(
    "q2_027",
    "불편한 감정이 오래 가면 다른 계획이나 즐거운 일로 시선을 돌린다.",
    7,
    "defense",
  ),
  createQuestion(
    "q2_028",
    "나는 재미보다 한 가지 계획에 오래 머물며 제한을 감수하는 편이다.",
    7,
    "interpersonal",
    true,
  ),
  createQuestion(
    "q2_029",
    "약해 보이기보다 직접 나서서 통제권을 잡는 편이 더 편하다.",
    8,
    "motivation",
  ),
  createQuestion(
    "q2_030",
    "누가 힘을 쥐고 있고 어디가 약한지 빨리 파악하는 편이다.",
    8,
    "attention",
  ),
  createQuestion(
    "q2_031",
    "압박이 오면 물러서기보다 더 강하게 밀어붙이는 쪽으로 반응한다.",
    8,
    "defense",
  ),
  createQuestion(
    "q2_032",
    "갈등이 생겨도 먼저 강하게 주장하기보다 웬만하면 물러서는 편이다.",
    8,
    "interpersonal",
    true,
  ),
  createQuestion(
    "q2_033",
    "마음이 편하려면 갈등이 커지지 않고 흐름이 부드러워야 한다.",
    9,
    "motivation",
  ),
  createQuestion(
    "q2_034",
    "사람들의 입장을 두루 보느라 내 우선순위는 뒤로 밀릴 때가 있다.",
    9,
    "attention",
  ),
  createQuestion(
    "q2_035",
    "긴장이 생기면 중요한 문제도 미루고 익숙한 편안함으로 돌아가려 한다.",
    9,
    "defense",
  ),
  createQuestion(
    "q2_036",
    "의견 충돌이 생기면 분위기보다 내 입장을 먼저 강하게 밀어붙이는 편이다.",
    9,
    "interpersonal",
    true,
  ),
] as const satisfies readonly KeyedAssessmentQuestion[];

export const assessmentDefinitionV2 = {
  version: ASSESSMENT_VERSION_V2,
  locale: "ko-KR",
  scoringVersion: SCORING_VERSION_V2,
  copyVersion: COPY_VERSION_V2,
  likertOptions,
  questions: assessmentQuestionsV2,
} as const satisfies AssessmentDefinition<KeyedAssessmentQuestion>;
