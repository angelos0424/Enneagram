# Phase 1: Assessment Contract & Scoring Core - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

이 phase는 한국어 에니어그램 검사의 평가 계약을 고정한다. 구체적으로는 버전이 있는 문항 세트, 5점 리커트 응답 형식, 서버 권위 점수 계산 규칙, 주 유형/날개/성장·스트레스 방향 산출 규칙, 그리고 이후 공유 결과 무결성을 위한 버전 저장 기준을 정의하는 범위다. 모바일 UI, 결과 화면 표현, 공유 UX는 다음 phases의 범위다.

</domain>

<decisions>
## Implementation Decisions

### Content Source
- **D-01:** Phase 1에서는 문항, 선택지, 유형 설명 원본을 코드 파일로 고정한다.
- **D-02:** 운영 중 실시간 수정 가능한 DB 기반 콘텐츠 관리 기능은 이번 phase 범위에 포함하지 않는다.

### Response And Scoring Contract
- **D-03:** 응답 형식은 5점 리커트 척도로 고정한다.
- **D-04:** 응답 라벨은 적합도형 표현을 사용한다: `전혀 나와 맞지 않는다 / 별로 맞지 않는다 / 반반이다 / 꽤 맞는다 / 매우 잘 맞는다`.
- **D-05:** 각 응답은 에니어그램 9개 유형 점수에 가중치 방식으로 반영되는 구조를 전제로 한다.

### Result Determination Rules
- **D-06:** 주 유형은 최고점 규칙으로 결정한다.
- **D-07:** 날개는 주 유형의 인접 유형 중 더 높은 점수를 가진 유형으로 결정한다.
- **D-08:** 성장 방향과 스트레스 방향은 주 유형 기준의 고정 매핑으로 결정한다.
- **D-09:** 시스템은 최종 판정과 함께 근접 상위 유형 정보도 결과 데이터에 남겨 이후 결과 해석에 활용할 수 있어야 한다.

### Versioning And Integrity
- **D-10:** 결과 저장 시 문항 세트 버전, 점수 계산 버전, 결과 카피 버전을 모두 함께 저장한다.
- **D-11:** 이후 규칙이나 카피가 바뀌더라도 과거 결과는 당시 기준을 재현할 수 있어야 한다.

### the agent's Discretion
- 문항/선택지/가중치 정의 파일의 정확한 파일 포맷 (`ts` vs `json`), 디렉터리 구조, 타입 모델링 방식은 the agent가 결정한다.
- 점수 정규화 방식, 근접 상위 유형의 저장 개수, 테스트 fixture 구조는 the agent가 결정한다.
- 유형 설명 원본을 Phase 1에서 최소 계약 수준으로 둘지, placeholder 포함 구조로 둘지는 the agent가 결정한다.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and constraints
- `.planning/PROJECT.md` — 제품 비전, 익명 사용자 제약, 한국어 전용, 영구 링크, Coolify 배포 전제
- `.planning/REQUIREMENTS.md` — ASMT-01~06 요구사항과 전체 프로젝트 범위
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, 전체 phase 의존 관계
- `.planning/STATE.md` — 현재 focus와 Phase 1 관련 누적 결정

### Research context
- `.planning/research/SUMMARY.md` — scoring contract와 snapshot-first roadmap ordering의 핵심 근거
- `.planning/research/STACK.md` — Next.js + Postgres + Drizzle 기준의 기본 기술 방향
- `.planning/research/ARCHITECTURE.md` — server-authoritative scoring, immutable snapshot, 결과 스키마 방향
- `.planning/research/PITFALLS.md` — 한국어 문항 품질, 과도한 단정 표현, 버전 없는 재계산 리스크

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 현재 재사용 가능한 앱 코드가 없다. 이 phase는 초기 greenfield 계약과 scaffold 전제를 함께 잡아야 한다.

### Established Patterns
- 기존 제품 코드는 없고, 프로젝트 레벨에서만 `Next.js 15 + React 19 + TypeScript + Tailwind 4 + PostgreSQL + Drizzle` 방향이 결정되어 있다.
- 공유 결과 무결성을 위해 snapshot-first와 server-authoritative scoring 패턴을 따라야 한다.

### Integration Points
- Phase 1 산출물은 이후 Phase 2의 결과 저장 모델과 Phase 3의 검사 제출 흐름의 계약점이 된다.
- Phase 1에서 정의한 버전 필드와 결과 구조는 이후 public result page, share metadata, admin stats가 모두 참조하게 된다.

</code_context>

<specifics>
## Specific Ideas

- 사용자는 이 프로젝트를 “에니어그램 모바일 테스트 사이트”로 인식하고 있으며, 결과 해석 품질의 기반이 되는 점수 계약을 먼저 고정하길 원한다.
- 응답 라벨은 심리 검사 문맥에서 자연스럽게 읽히는 적합도형 톤을 선호한다.
- 결과 판정은 단순해야 하지만, 근접 유형 정보는 후속 결과 설명에 활용할 수 있도록 남겨두길 원한다.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---
*Phase: 01-assessment-contract-scoring-core*
*Context gathered: 2026-03-29*
