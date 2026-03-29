# Phase 2: Persistent Result Snapshots - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 2-Persistent Result Snapshots
**Areas discussed:** 공개 링크 ID 형식, 저장 시점, 공개 결과 페이지 범위, 프라이버시 기본값

---

## 공개 링크 ID 형식

| Option | Description | Selected |
|--------|-------------|----------|
| 랜덤 토큰만 | 예: `/r/8fK2mQp9Xz...` | ✓ |
| 짧은 slug + 랜덤 토큰 | 예: `/r/type-4w5-8fK2mQp9` | |
| 사람이 읽기 쉬운 slug 중심 | 예: `/r/type-4w5-jisoo-result` | |

**User's choice:** 랜덤 토큰만
**Notes:** 공개 링크는 의미 노출보다 추측 불가능성이 우선이다.

---

## 저장 시점

| Option | Description | Selected |
|--------|-------------|----------|
| 제출 직후 즉시 저장 | 서버가 점수 계산을 끝내는 순간 결과 스냅샷을 만들고 링크를 발급 | ✓ |
| 결과 페이지 첫 진입 시 저장 | 계산만 먼저 하고, 결과 페이지를 실제로 열 때 저장 | |
| 공유 버튼 클릭 시 저장 | 일반 결과는 임시로 보고, 공유를 원할 때만 영구 저장 | |

**User's choice:** 제출 직후 즉시 저장
**Notes:** 저장과 링크 발급은 제출 완료 시점과 동시에 일어나야 한다.

---

## 공개 결과 페이지 범위

| Option | Description | Selected |
|--------|-------------|----------|
| 전체 상세결과 그대로 | 주 유형, 날개, 점수 분포, 성장/스트레스 방향, 설명 카드 전부 표시 | ✓ |
| 공유용 요약 + 일부 상세 | 핵심 결과는 다 보이되 일부 설명 카드나 세부 분포는 축약 | |
| 요약만 | 주 유형 중심 공유 카드 수준만 보여주고 자세한 내용은 숨김 | |

**User's choice:** 전체 상세결과 그대로
**Notes:** 이 프로젝트의 공유 가치는 상세 결과 공유 쪽에 있다.

---

## 프라이버시 기본값

| Option | Description | Selected |
|--------|-------------|----------|
| 강한 기본 보호 | `noindex`, 엄격한 referrer 정책, 삭제/비공개 전환용 관리 토큰까지 기본 포함 | ✓ |
| 기본 보호만 | `noindex`와 referrer 제한은 넣되, 삭제/비공개 전환 토큰은 나중에 | |
| 최소 보호 | 일단 랜덤 토큰만 믿고 나머지는 후순위 | |

**User's choice:** 강한 기본 보호
**Notes:** 영구 링크는 결국 공개 리소스라 기본 보호를 강하게 두는 편이 맞다.

---

## the agent's Discretion

- 랜덤 토큰 길이와 생성 구현
- 관리 토큰 저장 및 삭제/비공개 전환 API 형태
- 메타 태그/헤더 조합을 포함한 프라이버시 적용 방식

## Deferred Ideas

None
