import {
  ASSESSMENT_VERSION_V3,
  COPY_VERSION_V3,
  SCORING_VERSION_V3,
} from "@/domain/assessment/constants";
import type {
  AssessmentDefinition,
  AssessmentDimension,
  AssessmentPairCategory,
  EnneagramType,
  ForcedChoiceAssessmentQuestion,
  ForcedChoiceAssessmentStatement,
} from "@/domain/assessment/types";

type StatementIndex = 0 | 1 | 2;

function createStatement(
  prompt: string,
  keyedType: EnneagramType,
  dimension: AssessmentDimension,
): ForcedChoiceAssessmentStatement {
  return {
    prompt,
    keyedType,
    dimension,
  };
}

function createPair(
  id: string,
  left: ForcedChoiceAssessmentStatement,
  right: ForcedChoiceAssessmentStatement,
  pairCategory: AssessmentPairCategory = "baseline",
): ForcedChoiceAssessmentQuestion {
  return {
    id,
    left,
    right,
    pairCategory,
  };
}

const statementBank: Record<
  EnneagramType,
  Record<AssessmentDimension, readonly [string, string, string]>
> = {
  1: {
    motivation: [
      "나는 옳다고 믿는 기준을 지키며 사는 것이 중요하다.",
      "나는 스스로 떳떳하려면 해야 할 기준을 지켜야 한다.",
      "나는 편안함보다 제대로 하는 쪽을 택할 때가 많다.",
    ],
    attention: [
      "나는 어디가 잘못됐는지나 어긋났는지를 먼저 본다.",
      "나는 흐름보다 빠진 규칙이나 허점을 먼저 점검한다.",
      "나는 대충 넘어갈 부분보다 바로잡아야 할 부분이 먼저 보인다.",
    ],
    defense: [
      "문제가 보이면 고치기 전까지 마음이 잘 놓이지 않는다.",
      "어긋난 상황을 보면 기준을 세워 정리하고 싶어진다.",
      "압박이 커질수록 더 정확하고 단정하게 하려는 편이다.",
    ],
    interpersonal: [
      "관계에서도 편하게 맞추기보다 원칙을 지키는 쪽을 택한다.",
      "상대가 불편해해도 기준이 필요하다고 느끼면 말하는 편이다.",
      "사람들이 느슨하게 가도 나는 선을 분명히 두는 편이다.",
    ],
  },
  2: {
    motivation: [
      "나는 필요한 사람이 된다고 느낄 때 관계가 안정된다고 느낀다.",
      "나는 누군가에게 도움이 되는 순간 내 존재감이 커진다고 느낀다.",
      "나는 사랑받으려면 먼저 보살피는 쪽이 자연스럽다고 느낀다.",
    ],
    attention: [
      "나는 사람들이 말하지 않아도 무엇이 필요한지 빨리 알아차린다.",
      "나는 분위기보다 사람의 정서적 필요를 먼저 읽는 편이다.",
      "나는 누가 서운해졌는지나 돌봄이 필요한지를 금방 감지한다.",
    ],
    defense: [
      "관계가 멀어질 것 같으면 더 챙기고 맞추는 쪽으로 움직인다.",
      "서운함이 생겨도 내 필요보다 상대를 먼저 돌보려는 편이다.",
      "불편한 상황일수록 내가 먼저 해 주면 괜찮아질 거라 느낀다.",
    ],
    interpersonal: [
      "사람들과 가까워지려면 내 시간을 내주는 것이 자연스럽다.",
      "나는 관계를 유지하기 위해 상대에게 맞춰 주는 편이다.",
      "누군가 기대면 부담보다 보람을 먼저 느끼는 편이다.",
    ],
  },
  3: {
    motivation: [
      "나는 눈에 보이는 성과가 있어야 내 가치가 확인된다고 느낀다.",
      "나는 결과를 만들어 낼 때 가장 자신감이 살아난다.",
      "나는 인정받을 만한 성취가 있어야 안심이 된다.",
    ],
    attention: [
      "나는 무엇이 가장 효율적이고 빨리 먹히는지 먼저 계산한다.",
      "나는 감정보다 목표 달성에 유리한 방식을 먼저 본다.",
      "나는 일의 의미보다 성과가 나는 경로를 먼저 고르는 편이다.",
    ],
    defense: [
      "복잡한 감정이 있어도 일단 해내는 쪽으로 에너지를 모은다.",
      "압박이 커질수록 더 유능한 모습으로 버티려는 편이다.",
      "불안할수록 멈추기보다 성과를 내서 증명하고 싶어진다.",
    ],
    interpersonal: [
      "나는 사람들에게 능력 있고 해내는 사람으로 보이고 싶다.",
      "나는 관계에서도 기대에 부응하는 모습이 중요하다고 느낀다.",
      "나는 평가받는 자리에서 약점보다 강점을 보여 주려는 편이다.",
    ],
  },
  4: {
    motivation: [
      "나는 남들과 같기보다 나다운 감정과 의미를 잃지 않는 것이 중요하다.",
      "나는 진짜라고 느껴지는 정서와 정체성을 지키고 싶다.",
      "나는 평범하게 맞추기보다 내 고유한 결을 살리고 싶다.",
    ],
    attention: [
      "나는 분위기보다 내 안의 미묘한 감정 변화를 먼저 느낀다.",
      "나는 상황의 사실보다 그 안에서 느껴지는 정서를 먼저 본다.",
      "나는 겉으로 보이는 결과보다 감정의 결이나 분위기를 더 의식한다.",
    ],
    defense: [
      "공허함이 느껴질수록 더 진짜 같은 감정과 의미를 찾게 된다.",
      "불편할수록 내 감정을 더 깊게 들여다보는 편이다.",
      "채워지지 않는 느낌이 들면 나를 더 특별하게 설명하고 싶어진다.",
    ],
    interpersonal: [
      "관계에서도 감정을 솔직하게 드러내야 진짜 연결이라고 느낀다.",
      "나는 사람들 사이에서도 내 감정의 진정성을 지키고 싶다.",
      "상대가 불편해해도 내 진짜 감정을 숨기면 더 답답해진다.",
    ],
  },
  5: {
    motivation: [
      "나는 충분히 이해하지 못한 상태에서 움직이면 에너지가 쉽게 고갈된다.",
      "나는 먼저 파악하고 정리해야 안전하게 움직일 수 있다고 느낀다.",
      "나는 섣불리 개입하기보다 이해를 쌓을 때 안정감을 느낀다.",
    ],
    attention: [
      "나는 사람보다 정보와 구조를 먼저 파악하려는 편이다.",
      "나는 관계의 온도보다 개념과 패턴을 먼저 정리한다.",
      "나는 감정보다 맥락과 원리를 이해하는 데 시선이 간다.",
    ],
    defense: [
      "부담이 커질수록 거리를 두고 혼자 생각할 시간을 확보한다.",
      "압박이 오면 더 적게 쓰고 더 물러서며 버티려는 편이다.",
      "지치는 상황에서는 개입보다 관찰 쪽으로 물러나는 편이다.",
    ],
    interpersonal: [
      "관계에서도 내 시간과 에너지를 쉽게 열어 두지 않는 편이다.",
      "나는 사람들과 붙어 있기보다 필요한 만큼만 연결되는 쪽이 편하다.",
      "상대가 가까워져도 먼저 거리를 조절할 여유가 필요하다.",
    ],
  },
  6: {
    motivation: [
      "나는 확실한 기반과 믿을 수 있는 사람을 확인해야 안심이 된다.",
      "나는 불확실할수록 검증된 기준과 지지가 필요하다고 느낀다.",
      "나는 믿을 수 있는 구조가 있어야 마음이 놓인다.",
    ],
    attention: [
      "나는 문제가 생길 가능성과 허점이 먼저 보이는 편이다.",
      "나는 좋은 점보다 위험 신호와 빠진 대비책을 먼저 살핀다.",
      "나는 안정감보다 의심해야 할 지점을 먼저 떠올리는 편이다.",
    ],
    defense: [
      "불확실하면 최악의 경우를 가정하고 대비책을 찾는다.",
      "긴장될수록 확인하고 점검하며 확신을 얻으려는 편이다.",
      "압박이 오면 믿어도 되는지 다시 검토하는 쪽으로 반응한다.",
    ],
    interpersonal: [
      "관계에서도 상대가 믿을 만한지 시간을 두고 확인하는 편이다.",
      "나는 가까워져도 쉽게 안심하기보다 일관성을 살핀다.",
      "누군가를 따를 때도 의심이 풀려야 마음이 놓이는 편이다.",
    ],
  },
  7: {
    motivation: [
      "나는 답답함보다 가능성과 선택지가 많은 상태에서 살아난다.",
      "나는 열려 있는 기회가 많을수록 에너지가 커지는 편이다.",
      "나는 막히는 느낌보다 앞으로 펼쳐질 재미를 더 중요하게 느낀다.",
    ],
    attention: [
      "나는 새로운 아이디어나 재미있는 기회가 금방 눈에 들어온다.",
      "나는 제한보다 확장될 가능성과 흥미거리를 먼저 본다.",
      "나는 해야 할 의무보다 기대되는 선택지가 먼저 보이는 편이다.",
    ],
    defense: [
      "불편한 감정이 오래 가면 다른 계획이나 즐거운 일로 시선을 돌린다.",
      "답답할수록 더 재미있거나 가벼운 가능성을 찾아 움직인다.",
      "압박이 오면 문제 안에 머물기보다 탈출구를 넓히려는 편이다.",
    ],
    interpersonal: [
      "관계에서도 가볍고 자유로운 흐름이 유지될 때 마음이 편하다.",
      "사람들과 있을 때도 선택지가 막히지 않아야 숨이 트인다.",
      "너무 무거운 기대가 걸리면 거리보다 가벼움을 먼저 찾는 편이다.",
    ],
  },
  8: {
    motivation: [
      "나는 약해 보이기보다 직접 나서서 통제권을 잡는 편이 더 편하다.",
      "나는 상황을 내가 움직일 수 있다고 느껴야 안심이 된다.",
      "나는 밀리지 않으려면 먼저 힘을 쥐어야 한다고 느낀다.",
    ],
    attention: [
      "나는 누가 힘을 쥐고 있고 어디가 약한지 빨리 파악하는 편이다.",
      "나는 분위기보다 힘의 흐름과 실제 영향력을 먼저 본다.",
      "나는 말보다 누가 판을 움직이는지를 먼저 보는 편이다.",
    ],
    defense: [
      "압박이 오면 물러서기보다 더 강하게 밀어붙이는 쪽으로 반응한다.",
      "위협을 느끼면 방어보다 먼저 장악하려는 편이다.",
      "밀린다고 느껴질수록 더 직접적이고 단호해지는 편이다.",
    ],
    interpersonal: [
      "관계에서도 약한 모습보다 강하고 분명한 태도를 보이는 편이다.",
      "나는 가까운 사람도 함부로 못 건드리게 선을 강하게 지킨다.",
      "사람들과 있을 때도 주도권을 잃지 않아야 편하다고 느낀다.",
    ],
  },
  9: {
    motivation: [
      "나는 마음이 편하려면 갈등이 커지지 않고 흐름이 부드러워야 한다.",
      "나는 강한 긴장보다 평온하고 무리 없는 상태를 더 원한다.",
      "나는 큰 마찰 없이 모두가 편안한 쪽이 좋다고 느낀다.",
    ],
    attention: [
      "나는 사람들의 입장을 두루 보느라 내 우선순위가 뒤로 밀릴 때가 있다.",
      "나는 내 주장보다 전체 분위기와 균형을 먼저 의식하는 편이다.",
      "나는 누가 맞는지보다 모두가 무리 없이 가는지를 먼저 본다.",
    ],
    defense: [
      "긴장이 생기면 중요한 문제도 미루고 익숙한 편안함으로 돌아가려 한다.",
      "불편한 상황일수록 큰 충돌 없이 지나가길 바라며 버티는 편이다.",
      "압박이 오면 밀어붙이기보다 일단 잦아들길 기다리는 편이다.",
    ],
    interpersonal: [
      "관계에서도 내 주장보다 충돌을 줄이는 쪽을 먼저 택하는 편이다.",
      "나는 사람들과 부딪치기보다 조용히 맞춰 가는 쪽이 편하다.",
      "가까운 사이일수록 내 입장을 세우기보다 흐름을 부드럽게 잇는 편이다.",
    ],
  },
};

function statement(
  typeId: EnneagramType,
  dimension: AssessmentDimension,
  index: StatementIndex,
): ForcedChoiceAssessmentStatement {
  return createStatement(statementBank[typeId][dimension][index], typeId, dimension);
}

export const assessmentQuestionsV3 = [
  createPair("q3_001", statement(1, "motivation", 0), statement(6, "motivation", 0), "discriminator"),
  createPair("q3_002", statement(1, "attention", 0), statement(6, "attention", 0), "discriminator"),
  createPair("q3_003", statement(1, "defense", 0), statement(6, "defense", 0), "discriminator"),
  createPair("q3_004", statement(2, "motivation", 0), statement(9, "motivation", 0), "discriminator"),
  createPair("q3_005", statement(2, "attention", 0), statement(9, "attention", 0), "discriminator"),
  createPair("q3_006", statement(2, "defense", 0), statement(9, "defense", 0), "discriminator"),
  createPair("q3_007", statement(3, "motivation", 0), statement(8, "motivation", 0), "discriminator"),
  createPair("q3_008", statement(3, "attention", 0), statement(8, "attention", 0), "discriminator"),
  createPair("q3_009", statement(3, "defense", 0), statement(8, "defense", 0), "discriminator"),
  createPair("q3_010", statement(4, "motivation", 0), statement(5, "motivation", 0), "discriminator"),
  createPair("q3_011", statement(4, "attention", 0), statement(5, "attention", 0), "discriminator"),
  createPair("q3_012", statement(4, "defense", 0), statement(5, "defense", 0), "discriminator"),
  createPair("q3_013", statement(6, "motivation", 1), statement(9, "motivation", 1), "discriminator"),
  createPair("q3_014", statement(6, "attention", 1), statement(9, "attention", 1), "discriminator"),
  createPair("q3_015", statement(6, "interpersonal", 0), statement(9, "interpersonal", 0), "discriminator"),
  createPair("q3_016", statement(7, "motivation", 0), statement(8, "motivation", 1), "discriminator"),
  createPair("q3_017", statement(7, "attention", 0), statement(8, "attention", 1), "discriminator"),
  createPair("q3_018", statement(7, "defense", 0), statement(8, "defense", 1), "discriminator"),
  createPair("q3_019", statement(1, "interpersonal", 0), statement(6, "motivation", 2)),
  createPair("q3_020", statement(1, "interpersonal", 1), statement(8, "motivation", 2)),
  createPair("q3_021", statement(1, "interpersonal", 2), statement(9, "motivation", 2)),
  createPair("q3_022", statement(2, "interpersonal", 0), statement(6, "attention", 2)),
  createPair("q3_023", statement(2, "interpersonal", 1), statement(8, "attention", 2)),
  createPair("q3_024", statement(2, "interpersonal", 2), statement(9, "attention", 2)),
  createPair("q3_025", statement(3, "interpersonal", 0), statement(6, "defense", 1)),
  createPair("q3_026", statement(3, "interpersonal", 1), statement(8, "interpersonal", 0)),
  createPair("q3_027", statement(3, "interpersonal", 2), statement(9, "defense", 1)),
  createPair("q3_028", statement(4, "interpersonal", 0), statement(6, "defense", 2)),
  createPair("q3_029", statement(4, "interpersonal", 1), statement(8, "defense", 2)),
  createPair("q3_030", statement(4, "interpersonal", 2), statement(9, "defense", 2)),
  createPair("q3_031", statement(5, "interpersonal", 0), statement(6, "interpersonal", 1)),
  createPair("q3_032", statement(5, "interpersonal", 1), statement(8, "interpersonal", 1)),
  createPair("q3_033", statement(5, "interpersonal", 2), statement(9, "interpersonal", 1)),
  createPair("q3_034", statement(7, "interpersonal", 0), statement(6, "interpersonal", 2)),
  createPair("q3_035", statement(7, "interpersonal", 1), statement(8, "interpersonal", 2)),
  createPair("q3_036", statement(7, "interpersonal", 2), statement(9, "interpersonal", 2)),
  createPair("q3_037", statement(1, "motivation", 1), statement(7, "motivation", 1)),
  createPair("q3_038", statement(2, "motivation", 1), statement(5, "motivation", 1)),
  createPair("q3_039", statement(3, "motivation", 1), statement(4, "motivation", 1)),
  createPair("q3_040", statement(1, "motivation", 2), statement(2, "motivation", 2)),
  createPair("q3_041", statement(3, "motivation", 2), statement(7, "motivation", 2)),
  createPair("q3_042", statement(4, "motivation", 2), statement(5, "motivation", 2)),
  createPair("q3_043", statement(1, "attention", 1), statement(4, "attention", 1)),
  createPair("q3_044", statement(2, "attention", 1), statement(7, "attention", 1)),
  createPair("q3_045", statement(3, "attention", 1), statement(5, "attention", 1)),
  createPair("q3_046", statement(1, "attention", 2), statement(5, "attention", 2)),
  createPair("q3_047", statement(2, "attention", 2), statement(4, "attention", 2)),
  createPair("q3_048", statement(3, "attention", 2), statement(7, "attention", 2)),
  createPair("q3_049", statement(1, "defense", 1), statement(3, "defense", 1)),
  createPair("q3_050", statement(2, "defense", 1), statement(4, "defense", 1)),
  createPair("q3_051", statement(5, "defense", 1), statement(7, "defense", 1)),
  createPair("q3_052", statement(1, "defense", 2), statement(7, "defense", 2)),
  createPair("q3_053", statement(2, "defense", 2), statement(3, "defense", 2)),
  createPair("q3_054", statement(4, "defense", 2), statement(5, "defense", 2)),
] as const satisfies readonly ForcedChoiceAssessmentQuestion[];

export const assessmentDefinitionV3 = {
  version: ASSESSMENT_VERSION_V3,
  locale: "ko-KR",
  scoringVersion: SCORING_VERSION_V3,
  copyVersion: COPY_VERSION_V3,
  responseStyle: "forced-choice",
  likertOptions: [],
  questions: assessmentQuestionsV3,
} as const satisfies AssessmentDefinition<ForcedChoiceAssessmentQuestion>;
