# Roadmap: 에니어그램 모바일 테스트 사이트

## Overview

이 로드맵은 익명 모바일 검사, 서버 권위 점수 계산, 영구 스냅샷 결과 링크, 공유 루프, 집계형 관리자 통계, Coolify 운영까지를 한 번에 이어지는 사용자 가치 단위로 나눈다. 각 phase는 다음 phase를 열어주는 계약을 먼저 고정하고, 공유된 결과가 나중에도 같은 내용을 유지하는 것을 핵심 전제로 둔다.

v2.0 마일스톤은 구조적 편향을 제거하고, 결과를 "정확한 진단"이 아니라 "해석 가능한 성향 프로필"로 정직하게 제시하며, 기존 v1 결과를 깨지 않으면서 v2로 안전하게 이행한다. 순서는 왜곡 제거 -> scoring v2 도입 -> 문항 재작성 -> 해석 품질 검토의 흐름을 따른다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

### Milestone v1.0 — 에니어그램 모바일 테스트 사이트

- [x] **Phase 1: Assessment Contract & Scoring Core** - 버전된 문항과 서버 점수 계산 규칙을 고정한다. (completed 2026-03-29)
- [x] **Phase 2: Persistent Result Snapshots** - 저장된 결과 스냅샷과 영구 공유 링크를 제공한다. (completed 2026-03-29)
- [x] **Phase 3: Mobile Assessment Flow** - 익명 사용자가 모바일에서 검사를 끝까지 진행하고 제출할 수 있게 한다. (completed 2026-03-29)
- [x] **Phase 4: Result Interpretation & Share Loop** - 결과 이해와 공유받은 사용자의 재검사 유입 루프를 완성한다. (completed 2026-03-29)
- [x] **Phase 5: Aggregate Admin Stats** - 재식별 위험을 억제한 보호된 운영 통계를 제공한다. (completed 2026-03-29)
- [ ] **Phase 6: Coolify Launch Hardening** - 배포, 백업, 메타데이터, 운영 복구 기준을 갖춘다.

### Milestone v2.0 — 에니어그램 검사 정확도 개선

- [ ] **Phase 7: Scoring Engine v2** - centered scoring과 독립 정규화로 구조적 편향을 제거한다.
- [ ] **Phase 8: Confidence Classification & Optional Wing** - 낮은 신뢰도 상태와 선택적 wing으로 억지 확정을 멈춘다.
- [ ] **Phase 9: v2 Assessment Content** - 36문항 이상의 다차원 문항 세트로 측정 품질을 높인다.
- [ ] **Phase 10: Version Compatibility & Migration** - v1 결과를 보존하면서 v2 결과를 올바른 경로로 렌더링한다.
- [ ] **Phase 11: Result UI Overhaul** - 결과 화면을 정직한 위계와 표현으로 재구성한다.

## Phase Details

### Phase 1: Assessment Contract & Scoring Core
**Goal**: 시스템이 버전된 한국어 문항 세트와 서버 권위 점수 계산 계약을 바탕으로 주 유형, 점수 분포, 날개, 성장/스트레스 방향을 일관되게 산출할 수 있다.
**Depends on**: Nothing (first phase)
**Requirements**: ASMT-01, ASMT-02, ASMT-03, ASMT-04, ASMT-05, ASMT-06
**Success Criteria** (what must be TRUE):
  1. 운영자가 버전 식별자가 있는 한국어 문항 세트와 선택지를 한 곳에서 관리하고 배포할 수 있다.
  2. 시스템이 동일한 응답 입력에 대해 서버에서 항상 같은 주 유형과 유형별 점수 분포를 계산한다.
  3. 시스템이 계산된 주 유형과 점수 분포를 바탕으로 날개와 성장/스트레스 방향을 함께 결정한다.
  4. 저장 대상 결과에는 문항 버전과 계산 버전이 함께 남아 이후 로직 변경과 구분된다.
**Plans**: 4 plans
Plans:
- [x] 01-01-PLAN.md — Bootstrap the greenfield app/tooling and validation harness
- [x] 01-02-PLAN.md — Lock the authoritative Korean assessment contracts, constants, fixtures, and definition tests
- [x] 01-03-PLAN.md — Implement the deterministic scoring engine and server-side scoring endpoint
- [x] 01-04-PLAN.md — Define the persistence-ready result snapshot contract and Drizzle schema boundary

### Phase 2: Persistent Result Snapshots
**Goal**: 사용자가 완료한 결과가 영구 보관 가능한 스냅샷으로 저장되고, 추측 불가능한 공개 링크에서 동일한 결과를 다시 볼 수 있다.
**Depends on**: Phase 1
**Requirements**: RSLT-07, SHAR-01, SHAR-03, SHAR-06, OPER-02
**Success Criteria** (what must be TRUE):
  1. 시스템이 검사 완료마다 추측 불가능한 영구 공유 링크를 발급하고 PostgreSQL에 결과 스냅샷을 영속 저장한다.
  2. 공유 링크를 연 사용자는 로그인 없이 공개 결과 페이지를 볼 수 있다.
  3. 공개 결과 페이지는 저장된 스냅샷으로 렌더링되어 이후 계산 로직이나 콘텐츠가 바뀌어도 기존 링크 내용이 유지된다.
  4. 공유 결과 페이지에는 검색엔진 비노출과 기본 프라이버시 보호 설정이 적용된다.
**Plans**: 2/2 plans complete
Plans:
- [x] 02-01-PLAN.md — Extend the snapshot persistence contract with opaque public/admin tokens and repository lookup boundaries
- [x] 02-02-PLAN.md — Persist snapshots on submit and add immutable public result retrieval with privacy defaults
**UI hint**: yes

### Phase 3: Mobile Assessment Flow
**Goal**: 익명 사용자가 모바일에서 검사를 시작하고, 응답을 이어서 복구하며, 모든 필수 문항을 제출해 결과 생성까지 도달할 수 있다.
**Depends on**: Phase 2
**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05
**Success Criteria** (what must be TRUE):
  1. 사용자가 로그인 없이 모바일에서 바로 검사를 시작할 수 있다.
  2. 사용자가 모바일 화면에 맞는 문항 UI에서 현재 진행 상태를 보며 응답할 수 있다.
  3. 사용자가 새로고침하거나 잠시 이탈한 뒤 돌아와도 진행 중 응답을 복구할 수 있다.
  4. 사용자가 모든 필수 문항에 답하면 검사를 제출하고 저장된 결과 페이지로 이동할 수 있다.
**Plans**: 4 plans
Plans:
- [x] 03-01-PLAN.md — Replace the bootstrap home route with the anonymous mobile assessment shell and progress contract
- [x] 03-02-PLAN.md — Add mobile browser harness plus canonical cookie and PostgreSQL draft-session boundaries
- [x] 03-03-PLAN.md — Wire route-backed session bootstrap, draft autosave, and refresh recovery into the assessment flow
- [x] 03-04-PLAN.md — Finalize canonical draft sessions on submit and redirect to the persisted public result page
**UI hint**: yes

### Phase 4: Result Interpretation & Share Loop
**Goal**: 사용자가 결과를 이해하기 쉬운 결과 중심 레이아웃으로 확인하고, 공유받은 사용자도 상단 CTA를 통해 새 검사를 즉시 시작할 수 있다.
**Depends on**: Phase 3
**Requirements**: RSLT-01, RSLT-02, RSLT-03, RSLT-04, RSLT-05, RSLT-06, SHAR-02, SHAR-04, SHAR-05, SHAR-07
**Success Criteria** (what must be TRUE):
  1. 사용자가 결과 페이지 상단에서 자신의 주 유형을 먼저 확인하고, 같은 화면에서 날개, 점수 분포, 성장/스트레스 방향, 해설 카드를 읽을 수 있다.
  2. 결과 페이지에 해석 유의사항과 비진단적 성격이 분명히 표시된다.
  3. 사용자가 결과 페이지에서 링크 복사 또는 모바일 공유 기능으로 결과를 전달할 수 있다.
  4. 공유 결과 페이지는 결과-first 위계를 유지하면서도 상단에 항상 `검사해보기` CTA를 노출한다.
  5. 공유받은 사용자가 상단 `검사해보기`를 눌러 새 익명 검사 흐름으로 진입하고, 추천 섹션을 통해 다음 행동을 제안받을 수 있다.
**Plans**: 4/4 plans complete
Plans:
- [x] 04-01-PLAN.md — Expand the immutable result copy contract and public-result view model for detailed interpretation content
- [x] 04-02-PLAN.md — Implement the result-first mobile layout for immutable public results
- [x] 04-03-PLAN.md — Add realistic share actions and direct public-result share verification
- [x] 04-04-PLAN.md — Add the fresh-start CTA loop and recommendation section for shared-result visitors
**UI hint**: yes

### Phase 5: Aggregate Admin Stats
**Goal**: 운영자가 보호된 화면에서 익명 서비스 운영에 필요한 집계 통계만 확인할 수 있다.
**Depends on**: Phase 4
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06
**Success Criteria** (what must be TRUE):
  1. 관리자만 보호된 통계 화면에 접근할 수 있다.
  2. 관리자가 날짜별 검사 시작 수와 완료 수를 집계로 확인할 수 있다.
  3. 관리자가 주 유형 분포와 날개 분포를 집계로 확인할 수 있다.
  4. 관리자가 공유 결과 페이지 유입 뒤 `검사해보기` 클릭 수를 확인할 수 있다.
  5. 시스템이 재식별 위험이 있는 소표본 통계를 그대로 노출하지 않는다.
**Plans**: 4/4 plans complete
Plans:
- [x] 05-01-PLAN.md — Add the protected admin auth boundary and dedicated login/session guard
- [x] 05-02-PLAN.md — Persist append-only start and shared-result restart events at server mutation boundaries
- [x] 05-03-PLAN.md — Build the centralized suppression layer and protected aggregate stats API
- [x] 05-04-PLAN.md — Ship the protected admin dashboard with browser/server verification
**UI hint**: yes

### Phase 6: Coolify Launch Hardening
**Goal**: 서비스가 Coolify에서 웹 앱과 PostgreSQL을 분리 배포하고, 공유 미리보기와 백업 복구까지 포함한 운영 가능 상태로 출시될 수 있다.
**Depends on**: Phase 5
**Requirements**: OPER-01, OPER-03, OPER-04
**Success Criteria** (what must be TRUE):
  1. 시스템이 Coolify에서 웹 앱과 PostgreSQL을 분리된 서비스로 배포할 수 있다.
  2. 운영자가 백업 구성을 통해 결과 데이터를 복구할 수 있다.
  3. 시스템이 공유 결과 페이지용 메타데이터를 서버에서 생성해 링크 미리보기에 필요한 정보를 제공한다.
**Plans**: 4 plans
Plans:
- [x] 06-01-PLAN.md — Lock the deterministic Dockerfile and standalone Next.js deployment artifact for Coolify
- [x] 06-02-PLAN.md — Add the runtime env, health boundary, and Coolify deployment runbook for the separated app/database topology
- [x] 06-03-PLAN.md — Ship privacy-safe server-generated result metadata and a route-scoped OG image for public share previews
- [ ] 06-04-PLAN.md — Make PostgreSQL backup/restore explicit with a rehearsal helper, operator checklist, and restore-drill gate

### Phase 7: Scoring Engine v2
**Goal**: 시스템이 centered scoring과 독립 정규화를 사용하여 균일 응답에서 특정 유형으로 쏠리지 않는 공정한 점수를 산출할 수 있다.
**Depends on**: Phase 6
**Requirements**: SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05, DBCO-01, TEST-01, TEST-05, TEST-06
**Success Criteria** (what must be TRUE):
  1. 전 문항 동일 응답 시 모든 유형이 동점이 되어 1번 유형으로 고정되지 않는다.
  2. 역문항의 부호가 반전 적용되어, 같은 응답값이라도 역문항에서는 반대 방향으로 점수가 계산된다.
  3. 유형별 점수가 독립적으로 0-100 범위로 정규화되어, 9개 유형 점수의 합이 100을 강제하지 않는다.
  4. 각 문항이 keyedType, reverse, dimension 속성을 명시적으로 가지며, 자동 생성 가중치를 사용하지 않는다.
  5. `ko-enneagram-v2` assessment version과 대응하는 scoring version이 정의되어 v1과 구분된다.
**Plans**: TBD

### Phase 8: Confidence Classification & Optional Wing
**Goal**: 시스템이 애매한 결과를 억지로 한 유형으로 확정하지 않고, 결과 신뢰도와 wing 유무를 정직하게 판정할 수 있다.
**Depends on**: Phase 7
**Requirements**: CONF-01, CONF-02, CONF-03, CONF-04, DBCO-02, DBCO-03, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. 전 문항 동일 응답이나 분산이 극히 낮은 응답이 `insufficient_variance`로 판정된다.
  2. 1위와 2위 유형 점수 격차가 작은 응답이 `mixed`로 판정된다.
  3. wing이 불명확할 때 `wingType: null`이 반환되고, 임계값 이상 우세할 때만 wing이 확정된다.
  4. 결과에 1위-2위 격차 기반 `confidence_score` 수치가 포함된다.
  5. `assessment_results` 테이블에 `result_status`가 저장되고 `wing_type`이 nullable로 동작한다.
**Plans**: TBD

### Phase 9: v2 Assessment Content
**Goal**: v2 문항 세트가 유형당 다차원 문항과 혼동쌍 분리 문항을 갖추어, 측정 품질과 판별력이 v1보다 향상된다.
**Depends on**: Phase 7
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, TEST-07
**Success Criteria** (what must be TRUE):
  1. v2 문항 세트가 최소 36문항(유형당 4문항)으로 구성되어 있다.
  2. 각 유형의 문항이 핵심 동기, 주의 초점, 방어 패턴, 대인 반응 중 서로 다른 dimension을 다룬다.
  3. 혼동이 잦은 유형쌍(1vs6, 2vs9, 3vs8, 4vs5, 6vs9, 7vs8)을 분리하는 문항이 포함되어 있다.
  4. 역문항이 포함되어 있고, 54문항까지 확장 가능한 구조로 정의되어 있다.
  5. 유형당 최소 문항 수와 역문항 비율을 검증하는 definition 테스트가 통과한다.
**Plans**: TBD

### Phase 10: Version Compatibility & Migration
**Goal**: 기존 v1 결과가 재채점 없이 원본 그대로 유지되고, 공개 결과 페이지가 저장된 버전에 따라 올바른 렌더링 경로를 선택한다.
**Depends on**: Phase 8, Phase 9
**Requirements**: DBCO-04, DBCO-05
**Success Criteria** (what must be TRUE):
  1. `ko-enneagram-v1`으로 저장된 기존 결과가 재채점되지 않고, 저장 시점의 버전 트리오(assessmentVersion, scoringVersion, copyVersion)를 그대로 유지한다.
  2. 공개 결과 페이지가 저장된 버전 정보에 따라 v1 렌더링 경로와 v2 렌더링 경로를 자동으로 분기한다.
**Plans**: TBD

### Phase 11: Result UI Overhaul
**Goal**: 사용자가 결과 화면에서 정직한 위계와 표현으로 자신의 성향 프로필을 이해하고, 단정적이지 않은 해석을 읽을 수 있다.
**Depends on**: Phase 10
**Requirements**: RUI-01, RUI-02, RUI-03, RUI-04, RUI-05, RUI-06, TEST-08
**Success Criteria** (what must be TRUE):
  1. 결과 화면이 주유형 후보 > 근접 유형 > 결과 선명도 > 날개 후보 > 성장/스트레스 참고 순서로 표시된다.
  2. wing이 null일 때 "날개는 뚜렷하지 않음"이 표시되고 UI가 깨지지 않는다.
  3. 성장/스트레스 방향이 "이론적 연결선"임을 명시하는 참고 정보로 하향 표시된다.
  4. mixed/insufficient_variance 결과에 대해 적절한 안내 문구가 렌더링된다.
  5. 결과 표현이 "가장 가까운 유형 후보" 톤으로 바뀌어 단정적 표현이 줄어든다.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11
Note: Phase 9 depends on Phase 7 (not Phase 8), so Phase 8 and Phase 9 can execute in parallel if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Assessment Contract & Scoring Core | 4/4 | Complete | 2026-03-29 |
| 2. Persistent Result Snapshots | 2/2 | Complete | 2026-03-29 |
| 3. Mobile Assessment Flow | 4/4 | Complete | 2026-03-29 |
| 4. Result Interpretation & Share Loop | 4/4 | Complete | 2026-03-29 |
| 5. Aggregate Admin Stats | 4/4 | Complete | 2026-03-29 |
| 6. Coolify Launch Hardening | 3/4 | In Progress | - |
| 7. Scoring Engine v2 | 0/? | Not started | - |
| 8. Confidence Classification & Optional Wing | 0/? | Not started | - |
| 9. v2 Assessment Content | 0/? | Not started | - |
| 10. Version Compatibility & Migration | 0/? | Not started | - |
| 11. Result UI Overhaul | 0/? | Not started | - |
