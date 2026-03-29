# Roadmap: 에니어그램 모바일 테스트 사이트

## Overview

이 로드맵은 익명 모바일 검사, 서버 권위 점수 계산, 영구 스냅샷 결과 링크, 공유 루프, 집계형 관리자 통계, Coolify 운영까지를 한 번에 이어지는 사용자 가치 단위로 나눈다. 각 phase는 다음 phase를 열어주는 계약을 먼저 고정하고, 공유된 결과가 나중에도 같은 내용을 유지하는 것을 핵심 전제로 둔다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Assessment Contract & Scoring Core** - 버전된 문항과 서버 점수 계산 규칙을 고정한다.
- [ ] **Phase 2: Persistent Result Snapshots** - 저장된 결과 스냅샷과 영구 공유 링크를 제공한다.
- [ ] **Phase 3: Mobile Assessment Flow** - 익명 사용자가 모바일에서 검사를 끝까지 진행하고 제출할 수 있게 한다.
- [ ] **Phase 4: Result Interpretation & Share Loop** - 결과 이해와 공유받은 사용자의 재검사 유입 루프를 완성한다.
- [ ] **Phase 5: Aggregate Admin Stats** - 재식별 위험을 억제한 보호된 운영 통계를 제공한다.
- [ ] **Phase 6: Coolify Launch Hardening** - 배포, 백업, 메타데이터, 운영 복구 기준을 갖춘다.

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
**Plans**: 3 plans
Plans:
- [ ] 01-01-PLAN.md — Bootstrap the greenfield app/tooling and lock the authoritative Korean assessment contracts
- [ ] 01-02-PLAN.md — Implement the deterministic scoring engine and server-side scoring endpoint
- [ ] 01-03-PLAN.md — Define the persistence-ready result snapshot contract and Drizzle schema boundary

### Phase 2: Persistent Result Snapshots
**Goal**: 사용자가 완료한 결과가 영구 보관 가능한 스냅샷으로 저장되고, 추측 불가능한 공개 링크에서 동일한 결과를 다시 볼 수 있다.
**Depends on**: Phase 1
**Requirements**: RSLT-07, SHAR-01, SHAR-03, SHAR-06, OPER-02
**Success Criteria** (what must be TRUE):
  1. 시스템이 검사 완료마다 추측 불가능한 영구 공유 링크를 발급하고 PostgreSQL에 결과 스냅샷을 영속 저장한다.
  2. 공유 링크를 연 사용자는 로그인 없이 공개 결과 페이지를 볼 수 있다.
  3. 공개 결과 페이지는 저장된 스냅샷으로 렌더링되어 이후 계산 로직이나 콘텐츠가 바뀌어도 기존 링크 내용이 유지된다.
  4. 공유 결과 페이지에는 검색엔진 비노출과 기본 프라이버시 보호 설정이 적용된다.
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
**UI hint**: yes

### Phase 6: Coolify Launch Hardening
**Goal**: 서비스가 Coolify에서 웹 앱과 PostgreSQL을 분리 배포하고, 공유 미리보기와 백업 복구까지 포함한 운영 가능 상태로 출시될 수 있다.
**Depends on**: Phase 5
**Requirements**: OPER-01, OPER-03, OPER-04
**Success Criteria** (what must be TRUE):
  1. 시스템이 Coolify에서 웹 앱과 PostgreSQL을 분리된 서비스로 배포할 수 있다.
  2. 운영자가 백업 구성을 통해 결과 데이터를 복구할 수 있다.
  3. 시스템이 공유 결과 페이지용 메타데이터를 서버에서 생성해 링크 미리보기에 필요한 정보를 제공한다.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Assessment Contract & Scoring Core | 0/3 | Not started | - |
| 2. Persistent Result Snapshots | 0/TBD | Not started | - |
| 3. Mobile Assessment Flow | 0/TBD | Not started | - |
| 4. Result Interpretation & Share Loop | 0/TBD | Not started | - |
| 5. Aggregate Admin Stats | 0/TBD | Not started | - |
| 6. Coolify Launch Hardening | 0/TBD | Not started | - |
