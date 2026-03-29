# Phase 2: Persistent Result Snapshots - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

이 phase는 검사 완료 결과를 영구 스냅샷으로 저장하고, 추측 불가능한 공개 링크에서 동일한 결과를 다시 렌더링하는 범위를 다룬다. 결과는 Phase 1에서 고정된 서버 권위 점수 계산 결과를 기반으로 저장되어야 하며, 이후 로직 변경에도 과거 링크가 당시 결과를 유지해야 한다. 공유용 상세 레이아웃의 정교한 시각 구성이나 추천 섹션 고도화는 다음 phases의 범위다.

</domain>

<decisions>
## Implementation Decisions

### Public Link Identity
- **D-01:** 공개 결과 링크는 의미 없는 랜덤 토큰만 사용한다.
- **D-02:** 타입명, 사용자 식별 텍스트, 읽기 쉬운 slug는 공개 링크 경로에 포함하지 않는다.

### Snapshot Creation Timing
- **D-03:** 결과 스냅샷은 검사 제출 직후 서버 점수 계산이 끝나는 시점에 즉시 생성한다.
- **D-04:** 공개 링크 발급은 결과 페이지 첫 진입이나 공유 버튼 클릭 시점이 아니라, 제출 완료 시점과 동시에 이뤄진다.

### Public Result Scope
- **D-05:** 공개 링크에서 전체 상세 결과를 그대로 보여준다.
- **D-06:** 공개 결과 페이지는 주 유형, 날개, 점수 분포, 성장/스트레스 방향, 설명 카드까지 포함한 전체 상세 결과를 렌더링한다.

### Privacy Defaults
- **D-07:** 공개 결과 페이지에는 `noindex`를 기본 적용한다.
- **D-08:** 공개 결과 페이지는 엄격한 referrer 정책을 기본 적용한다.
- **D-09:** 삭제 또는 비공개 전환용 관리 토큰을 기본 설계에 포함한다.

### the agent's Discretion
- 랜덤 토큰의 정확한 길이와 생성 라이브러리(`nanoid` 등)는 the agent가 결정한다.
- 관리 토큰의 저장 방식과 삭제/비공개 전환 API의 정확한 인터페이스는 the agent가 결정한다.
- `noindex`와 referrer 정책을 메타 태그, 헤더, 둘 다 중 어디에 둘지는 the agent가 결정한다.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and requirements
- `.planning/PROJECT.md` — 영구 링크, 익명 사용자, 한국어 전용, 공유 결과 가치
- `.planning/REQUIREMENTS.md` — `RSLT-07`, `SHAR-01`, `SHAR-03`, `SHAR-06`, `OPER-02` 요구사항
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, Phase 1 이후 의존 관계
- `.planning/STATE.md` — 현재 phase 위치와 누적 결정

### Prior phase contracts
- `.planning/phases/01-assessment-contract-scoring-core/01-CONTEXT.md` — Phase 1에서 고정한 버전/점수/결과 계약
- `.planning/phases/01-assessment-contract-scoring-core/01-RESEARCH.md` — snapshot-first와 server-authoritative scoring 구현 근거
- `.planning/phases/01-assessment-contract-scoring-core/01-VERIFICATION.md` — Phase 1 goal 달성 증거와 실제 산출물 연결

### Existing implementation anchors
- `src/domain/assessment/scoring.ts` — version trio를 포함한 canonical scored result shape
- `src/domain/assessment/result-snapshot.ts` — persistence-ready snapshot builder
- `src/db/schema.ts` — immutable assessment result storage schema
- `src/db/repositories/assessment-result-repository.ts` — result snapshot save/find boundary

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/domain/assessment/result-snapshot.ts`: 점수 결과와 answers를 persistence draft로 바꾸는 helper가 이미 있다.
- `src/db/schema.ts`: `assessmentResults` 테이블 계약이 이미 정의되어 있다.
- `src/db/repositories/assessment-result-repository.ts`: 저장/조회 repository boundary가 이미 존재한다.
- `src/app/api/assessments/score/route.ts`: 제출 직후 서버가 canonical result를 계산하는 entrypoint가 있다.

### Established Patterns
- 점수 계산은 서버 권위 방식이며, version trio(`assessmentVersion`, `scoringVersion`, `copyVersion`)를 항상 함께 다룬다.
- persistence work는 snapshot-first와 immutable contract 기준으로 진행되어야 한다.
- 테스트는 Vitest 기반 회귀 검증으로 추가된다.

### Integration Points
- Phase 2는 Phase 1의 scorer 결과와 snapshot builder를 실제 저장/조회 흐름으로 연결해야 한다.
- 여기서 만든 공개 결과 조회 경로와 snapshot persistence는 Phase 3 제출 UX와 Phase 4 결과 페이지 확장에 직접 연결된다.

</code_context>

<specifics>
## Specific Ideas

- 영구 공유 링크는 사용자에게 읽기 쉬운 주소보다 추측 불가능성이 더 중요하다.
- 공유 링크를 열었을 때 “요약 카드”가 아니라 전체 상세 결과가 그대로 보여야 한다.
- 공개 결과는 공개 리소스라는 전제에서 강한 기본 보호(`noindex`, referrer 제한, 관리 토큰)를 같이 가져가야 한다.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---
*Phase: 02-persistent-result-snapshots*
*Context gathered: 2026-03-29*
