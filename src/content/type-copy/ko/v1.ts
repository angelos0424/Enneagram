import { COPY_VERSION } from "@/domain/assessment/constants";
import type {
  EnneagramType,
  TypeCopyEntry,
} from "@/domain/assessment/types";

export const typeCopyEntries: Record<EnneagramType, TypeCopyEntry> = {
  1: {
    typeId: 1,
    title: "원칙을 세우는 개혁가",
    summary: "기준과 책임을 중시하며 더 나은 방향으로 바로잡고 싶어하는 해석이다.",
    disclaimerTone: "interpretive",
  },
  2: {
    typeId: 2,
    title: "관계를 돌보는 조력가",
    summary: "사람의 필요를 빠르게 읽고 도움을 통해 연결감을 만들려는 해석이다.",
    disclaimerTone: "interpretive",
  },
  3: {
    typeId: 3,
    title: "성과를 만드는 성취가",
    summary: "목표와 효율, 인정받는 결과를 통해 자신의 가치를 확인하려는 해석이다.",
    disclaimerTone: "interpretive",
  },
  4: {
    typeId: 4,
    title: "의미를 찾는 개성가",
    summary: "감정의 깊이와 자기만의 진정성을 중요하게 여기는 해석이다.",
    disclaimerTone: "interpretive",
  },
  5: {
    typeId: 5,
    title: "이해를 축적하는 탐구가",
    summary: "거리 두기와 관찰, 지식 축적을 통해 세상을 파악하려는 해석이다.",
    disclaimerTone: "interpretive",
  },
  6: {
    typeId: 6,
    title: "안전을 점검하는 충성가",
    summary: "위험을 예상하고 신뢰할 기반을 확인하며 안정성을 지키려는 해석이다.",
    disclaimerTone: "interpretive",
  },
  7: {
    typeId: 7,
    title: "가능성을 확장하는 낙천가",
    summary: "새로운 선택지와 활력을 통해 답답함을 벗어나려는 해석이다.",
    disclaimerTone: "interpretive",
  },
  8: {
    typeId: 8,
    title: "주도권을 잡는 도전가",
    summary: "강인함과 직접성을 바탕으로 상황을 움직이고 통제하려는 해석이다.",
    disclaimerTone: "interpretive",
  },
  9: {
    typeId: 9,
    title: "조화를 지키는 중재가",
    summary: "충돌을 낮추고 평온한 흐름을 유지하며 균형을 만들려는 해석이다.",
    disclaimerTone: "interpretive",
  },
};

export const typeCopyDefinition = {
  copyVersion: COPY_VERSION,
  entries: typeCopyEntries,
} as const;
