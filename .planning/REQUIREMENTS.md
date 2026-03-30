# Requirements: 에니어그램 모바일 테스트 사이트 — Milestone v2.0

**Defined:** 2026-03-30
**Milestone:** v2.0 — 에니어그램 검사 정확도 개선
**Core Value:** 사용자가 로그인 없이도 모바일에서 빠르게 에니어그램 검사를 완료하고, 이해하기 쉬운 상세 결과를 공유할 수 있어야 한다.

## v2 Requirements

### Scoring Engine

- [ ] **SCORE-01**: 시스템은 centered scoring(-2..+2)으로 응답을 변환하여, 전 문항 동일 응답 시 전 유형 0점이 되어 특정 유형으로 쏠리지 않아야 한다.
- [ ] **SCORE-02**: 시스템은 역문항(reverse)을 지원하여 부호를 반전 적용할 수 있어야 한다.
- [ ] **SCORE-03**: 시스템은 유형별 독립 정규화(0-100)를 적용하여, 9개 유형 점수의 합이 100을 강제하지 않아야 한다.
- [ ] **SCORE-04**: 각 문항은 dimension(motivation/attention/defense/interpersonal) 태그를 가져야 한다.
- [ ] **SCORE-05**: 시스템은 `buildTypeWeights()` 자동 생성 방식 대신, 문항별 명시적 `keyedType`과 `reverse` 플래그로 스코어링해야 한다.

### Confidence & Wing

- [ ] **CONF-01**: 시스템은 결과에 `ResultStatus`(clear/mixed/insufficient_variance)를 산출하여, 모든 응답을 억지로 한 유형으로 확정하지 않아야 한다.
- [ ] **CONF-02**: 시스템은 응답 분산이 매우 낮으면 `insufficient_variance`, 1위-2위 격차가 작으면 `mixed`, 그 외 `clear`로 판정해야 한다.
- [ ] **CONF-03**: 시스템은 wing이 불명확할 때 `wingType: null`을 반환하고, 임계값 이상 우세할 때만 wing을 확정해야 한다.
- [ ] **CONF-04**: 시스템은 1위-2위 점수 격차 기반의 `confidence_score` 수치를 산출해야 한다.

### Assessment Content

- [ ] **CONT-01**: v2 문항 세트는 최소 36문항(유형당 4문항)으로 구성되어야 한다.
- [ ] **CONT-02**: 각 유형의 문항은 서로 다른 dimension(핵심 동기, 주의 초점, 방어 패턴, 대인 반응)을 다뤄야 한다.
- [ ] **CONT-03**: 혼동이 잦은 유형쌍(1vs6, 2vs9, 3vs8, 4vs5, 6vs9, 7vs8)을 분리하는 문항이 포함되어야 한다.
- [ ] **CONT-04**: 역문항이 포함되어 무의식적 일괄 체크를 줄여야 한다.
- [ ] **CONT-05**: v2 문항 세트는 54문항(유형당 6문항)까지 확장 가능한 구조여야 한다.
- [ ] **CONT-06**: 문항 작성 시 사회적 바람직성 편향을 줄이고, 행동보다 동기를 드러내는 표현을 사용해야 한다.

### Result UI

- [ ] **RUI-01**: 결과 화면은 주유형 후보 > 근접 유형 > 결과 선명도 > 날개 후보 > 성장/스트레스 참고 순서로 위계를 재정렬해야 한다.
- [ ] **RUI-02**: wing이 null일 때 "날개는 뚜렷하지 않음"을 표시하고, UI가 깨지지 않아야 한다.
- [ ] **RUI-03**: 성장/스트레스 방향은 "현재 응답에서 별도로 측정된 결과가 아니라 이론적 연결선"임을 명시하는 참고 정보로 하향 표시해야 한다.
- [ ] **RUI-04**: 정규화 점수 분포 명칭을 "상대 강도 지표" 또는 "유형별 반응 지표"로 변경해야 한다.
- [ ] **RUI-05**: mixed/insufficient_variance 결과에 대해 적절한 안내 문구를 렌더링해야 한다.
- [ ] **RUI-06**: 결과 표현을 "가장 가까운 유형 후보" 톤으로 바꿔 단정적 표현을 줄여야 한다.

### DB & Compatibility

- [ ] **DBCO-01**: `ko-enneagram-v2`를 새 assessment version으로 추가하고, v2 전용 scoring/copy version을 정의해야 한다.
- [ ] **DBCO-02**: `assessment_results` 테이블에 `result_status` 필드를 추가해야 한다.
- [ ] **DBCO-03**: `wing_type`을 nullable로 변경해야 한다.
- [ ] **DBCO-04**: 기존 `ko-enneagram-v1` 결과는 재채점하지 않고, 저장 시점의 버전 트리오를 그대로 유지해야 한다.
- [ ] **DBCO-05**: 공개 결과 페이지는 저장된 `assessmentVersion`, `scoringVersion`, `copyVersion`에 따라 올바른 렌더링 경로를 선택해야 한다.

### Test Coverage

- [ ] **TEST-01**: 전 문항 동일 응답 시 1번 유형 고정이 나오지 않는 테스트가 있어야 한다.
- [ ] **TEST-02**: 전 문항 3점일 때 `insufficient_variance`가 되는 테스트가 있어야 한다.
- [ ] **TEST-03**: top1/top2 격차가 작을 때 `mixed`가 되는 테스트가 있어야 한다.
- [ ] **TEST-04**: wing이 불명확하면 null이 되는 테스트가 있어야 한다.
- [ ] **TEST-05**: 역문항이 반대로 계산되는 테스트가 있어야 한다.
- [ ] **TEST-06**: 유형별 독립 정규화가 합 100을 강제하지 않는 테스트가 있어야 한다.
- [ ] **TEST-07**: 유형당 최소 문항 수와 역문항 비율을 검증하는 definition 테스트가 있어야 한다.
- [ ] **TEST-08**: 낮은 신뢰도 결과 문구, wing 없음 상태, 성장/스트레스 참고 표시를 검증하는 UI 테스트가 있어야 한다.

## Future Requirements

- 54문항 이상 확장 시 별도 "상세 검사" 모드 분리
- 모집단 기반 백분위 정규화 (충분한 데이터 확보 후)
- 문항 난이도/판별력 통계 기반 문항 선별

## Out of Scope

- RHETI 수준의 144문항 정밀 진단 — 모바일 빠른 완료 목표와 충돌
- v1 결과 재채점 — 기존 공유 링크 안정성 보장
- 다국어 v2 문항 — 한국어 전용 유지

## Traceability

(Filled by roadmap)
