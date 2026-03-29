# 에니어그램 모바일 테스트 사이트

## What This Is

일반 사용자가 모바일에서 에니어그램 검사를 진행하고, 결과를 상세하게 확인한 뒤 공유 가능한 링크로 결과 페이지를 전달할 수 있는 한국어 웹 서비스다. 결과 페이지 상단에는 항상 검사 진입 버튼을 두어, 공유받은 사람이 바로 다시 검사를 시도할 수 있어야 한다. 초기 범위는 익명 사용 흐름에 집중하며, Coolify로 배포 가능한 구조를 전제로 한다.

## Core Value

사용자가 로그인 없이도 모바일에서 빠르게 에니어그램 검사를 완료하고, 이해하기 쉬운 상세 결과를 공유할 수 있어야 한다.

## Requirements

### Validated

- [x] Phase 01 validated: 운영자가 버전이 명시된 한국어 에니어그램 문항 세트와 선택지를 관리하고, 서버 권위 점수 계산으로 버전이 보존된 결과를 산출할 수 있어야 한다.
- [x] Phase 02 validated: 사용자가 완료한 결과를 영구 스냅샷 링크로 저장하고, 공개 결과 페이지에서 같은 스냅샷을 프라이버시 기본값과 함께 다시 볼 수 있어야 한다.

### Active

- [ ] 사용자가 모바일 환경에서 익명으로 에니어그램 검사를 진행할 수 있어야 한다.
- [ ] 사용자가 주 유형, 날개, 점수 분포, 성장/스트레스 방향, 설명 카드를 포함한 상세 결과를 볼 수 있어야 한다.
- [ ] 사용자가 영구 보관 가능한 결과 링크를 공유하고, 공유 결과 페이지 상단 CTA로 다시 검사를 시작할 수 있어야 한다.
- [ ] 운영자가 검사 결과 통계를 확인할 수 있어야 한다.

### Out of Scope

- 회원가입 및 로그인 기능 — 초기 버전은 익명 검사와 결과 공유에 집중한다.
- 다국어 지원 — 질문과 결과는 한국어만 우선 제공한다.
- 결과 자동 만료 정책 — 사용자가 직접 나중에 전체 서비스를 정리할 계획이므로 초기에는 영구 보관으로 단순화한다.

## Context

에니어그램 이론 기반 점수 계산을 사용하는 모바일 우선 테스트 사이트를 만들고자 한다. 사용자는 일반 대중이며, 검사는 별도의 회원 식별 없이 익명으로 진행된다. 결과 페이지에는 주 유형, 날개, 점수 분포, 성장/스트레스 방향, 설명 카드가 포함되어야 하고, 이 결과를 링크로 공유할 수 있어야 한다. 공유 결과 페이지 상단에는 항상 "검사해보기" 진입 버튼이 있어, 링크를 받은 사용자가 즉시 검사를 다시 수행할 수 있어야 한다. 공유 가능한 결과를 영구 보관하려면 결과 저장용 데이터베이스가 필요하다. 배포 환경은 Coolify를 전제로 한다.

## Constraints

- **Platform**: 모바일 우선 웹 경험 — 주요 사용 흐름이 휴대폰에서 자연스럽게 동작해야 한다.
- **Language**: 한국어 전용 — 초기 릴리스에서 질문과 결과 콘텐츠를 한국어만 지원한다.
- **User Model**: 익명 사용자 — 로그인 없이 검사, 저장, 공유 흐름을 설계해야 한다.
- **Persistence**: 결과 영구 저장 — 공유 링크가 지속적으로 동작하도록 결과 저장소가 필요하다.
- **Deployment**: Coolify 배포 — 컨테이너/서비스 구성이 Coolify 운영 방식과 잘 맞아야 한다.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 익명 사용자 흐름으로 시작 | 초기 진입 장벽을 낮추고 검사 완료율을 높이기 위해 | — Pending |
| 결과 페이지를 공유 단위로 사용 | 추천과 바이럴 흐름을 가장 단순하게 만들 수 있어 | — Pending |
| 결과 링크는 영구 보관 | 초기에는 만료 정책보다 단순한 공유 경험이 더 중요해 | — Pending |
| 관리자 기능은 통계 중심으로 제한 | 운영 복잡도를 낮추고 핵심 사용자 경험에 집중하기 위해 | — Pending |
| Coolify 배포를 전제로 설계 | 실제 운영 환경과 배포 제약을 초기에 반영하기 위해 | — Pending |
| 평가 계약은 코드 파일을 단일 원본으로 관리 | 초기에는 운영 수정 기능보다 버전 고정과 계약 안정성이 더 중요하기 때문에 | ✓ Good |
| 결과 계산은 서버 권위 방식으로 수행 | 클라이언트 드리프트를 막고 이후 영구 스냅샷 저장과 일관되게 연결하기 위해 | ✓ Good |
| 결과는 assessment/scoring/copy 버전을 모두 포함해야 함 | 과거 링크와 결과를 당시 기준으로 재현 가능하게 유지하기 위해 | ✓ Good |
| 주 유형 동점은 낮은 유형 번호 우선으로 판정 | Phase 1에서 결정적이고 재현 가능한 tie-break 규칙이 필요하기 때문에 | ✓ Good |
| 근접 유형은 상위 3개까지 보존 | 이후 결과 설명 단계에서 애매한 결과를 설명할 여지를 남기기 위해 | ✓ Good |
| 결과 링크는 저장 시점에 즉시 발급한다 | 공유 시점마다 다시 계산하거나 토큰을 늦게 만들면 스냅샷 계약이 흔들리기 때문에 | ✓ Good |
| 공개 결과 페이지는 저장된 copyVersion으로 해설을 조회한다 | 이후 콘텐츠 변경이 과거 링크를 드리프트시키지 않도록 하기 위해 | ✓ Good |
| 공개 결과 페이지는 noindex와 no-referrer를 기본값으로 둔다 | 영구 링크를 유지하되 불필요한 확산과 referrer 누출을 줄이기 위해 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-29 after Phase 2 completion*
