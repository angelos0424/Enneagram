# Requirements: 에니어그램 모바일 테스트 사이트

**Defined:** 2026-03-29
**Core Value:** 사용자가 로그인 없이도 모바일에서 빠르게 에니어그램 검사를 완료하고, 이해하기 쉬운 상세 결과를 공유할 수 있어야 한다.

## v1 Requirements

### Assessment Foundation

- [x] **ASMT-01**: 운영자는 버전이 명시된 한국어 에니어그램 문항 세트와 선택지를 관리 가능한 형태로 유지할 수 있다.
- [x] **ASMT-02**: 시스템은 제출된 응답을 서버에서 계산하여 주 유형을 산출할 수 있다.
- [x] **ASMT-03**: 시스템은 제출된 응답을 서버에서 계산하여 유형별 점수 분포를 산출할 수 있다.
- [x] **ASMT-04**: 시스템은 산출된 주 유형과 점수 분포를 바탕으로 날개를 결정할 수 있다.
- [x] **ASMT-05**: 시스템은 주 유형을 기준으로 성장 방향과 스트레스 방향을 결정할 수 있다.
- [x] **ASMT-06**: 시스템은 결과 저장 시 문항 버전과 계산 버전을 함께 기록할 수 있다.

### Assessment Experience

- [x] **FLOW-01**: 사용자는 로그인 없이 모바일에서 즉시 검사를 시작할 수 있다.
- [x] **FLOW-02**: 사용자는 모바일 화면에 최적화된 방식으로 문항에 응답할 수 있다.
- [x] **FLOW-03**: 사용자는 검사 진행 중 현재 진행 상태를 확인할 수 있다.
- [x] **FLOW-04**: 사용자는 세션 중 새로고침 또는 일시 중단 후에도 진행 중인 응답을 복구할 수 있다.
- [x] **FLOW-05**: 사용자는 모든 필수 문항 응답 후 검사를 제출할 수 있다.

### Results

- [x] **RSLT-01**: 사용자는 검사 완료 직후 자신의 주 유형을 결과 페이지 상단에서 확인할 수 있다.
- [x] **RSLT-02**: 사용자는 결과 페이지에서 자신의 날개를 확인할 수 있다.
- [x] **RSLT-03**: 사용자는 결과 페이지에서 유형별 점수 분포를 시각적으로 확인할 수 있다.
- [x] **RSLT-04**: 사용자는 결과 페이지에서 성장 방향과 스트레스 방향을 확인할 수 있다.
- [x] **RSLT-05**: 사용자는 결과 페이지에서 주 유형 해설 카드를 읽을 수 있다.
- [x] **RSLT-06**: 사용자는 결과 페이지에서 해석 유의사항과 결과의 비진단적 성격을 확인할 수 있다.
- [x] **RSLT-07**: 시스템은 공유 결과 페이지를 저장된 스냅샷으로 렌더링하여 이후 로직 변경에도 동일 결과를 유지할 수 있다.

### Sharing And Recommendation

- [x] **SHAR-01**: 시스템은 각 완료 결과에 대해 추측 불가능한 영구 공유 링크를 생성할 수 있다.
- [x] **SHAR-02**: 사용자는 결과 페이지에서 공유 링크를 복사하거나 모바일 공유 기능으로 전달할 수 있다.
- [x] **SHAR-03**: 공유 링크를 연 사용자는 공개 결과 페이지를 로그인 없이 확인할 수 있다.
- [x] **SHAR-04**: 공유 결과 페이지 상단에는 항상 `검사해보기` 버튼이 표시된다.
- [x] **SHAR-05**: 공유 결과 페이지에서 `검사해보기`를 누른 사용자는 새 검사 흐름으로 진입할 수 있다.
- [x] **SHAR-06**: 시스템은 공유 결과 페이지에 검색엔진 비노출 및 기본 프라이버시 보호 설정을 적용할 수 있다.
- [x] **SHAR-07**: 결과 페이지는 공유받은 사용자에게 다음 행동을 제안하는 추천 섹션을 보여줄 수 있다.

### Admin Stats

- [ ] **STAT-01**: 관리자만 보호된 통계 화면에 접근할 수 있다.
- [ ] **STAT-02**: 관리자는 날짜별 검사 시작 수와 완료 수를 확인할 수 있다.
- [ ] **STAT-03**: 관리자는 주 유형 분포를 확인할 수 있다.
- [ ] **STAT-04**: 관리자는 날개 분포를 확인할 수 있다.
- [ ] **STAT-05**: 관리자는 공유 결과 페이지 유입 후 `검사해보기` 클릭 수를 확인할 수 있다.
- [ ] **STAT-06**: 시스템은 재식별 위험이 있는 소표본 통계를 그대로 노출하지 않는다.

### Operations And Deployment

- [ ] **OPER-01**: 시스템은 Coolify에서 웹 앱과 PostgreSQL을 분리된 서비스로 배포할 수 있다.
- [x] **OPER-02**: 시스템은 결과 영구 보관을 위해 PostgreSQL 영속 스토리지를 사용한다.
- [ ] **OPER-03**: 운영자는 데이터베이스 백업 구성을 통해 결과 데이터를 복구할 수 있다.
- [ ] **OPER-04**: 시스템은 결과 페이지 공유 미리보기를 위한 메타데이터를 서버에서 생성할 수 있다.

## v2 Requirements

### Result Confidence And Refinement

- **CONF-01**: 사용자는 근접 유형 비교 뷰를 통해 상위 2~3개 유형 차이를 확인할 수 있다.
- **CONF-02**: 사용자는 불확실한 결과에 대해 보정용 재질문 또는 재검사 흐름을 진행할 수 있다.

### Sharing Enhancements

- **SHAR-08**: 시스템은 공유 결과에 최적화된 OG 이미지 또는 공유 카드 이미지를 생성할 수 있다.
- **SHAR-09**: 시스템은 카카오톡 등 주요 공유 채널별 미리보기 품질을 최적화할 수 있다.

### Analytics Expansion

- **STAT-07**: 관리자는 유입 소스별 전환율을 확인할 수 있다.
- **STAT-08**: 관리자는 결과 페이지 조회 상위 링크를 확인할 수 있다.

## Out of Scope

| Feature | Reason |
|---------|--------|
| 사용자 회원가입/로그인 | 초기 버전은 익명 진입과 공유 루프 검증이 핵심이다 |
| 사용자 프로필 및 결과 히스토리 관리 | 계정 시스템 없이 유지하기 어렵고 MVP 검증 범위를 넘는다 |
| 친구 그래프, 댓글, 커뮤니티 기능 | 핵심 검사 경험과 무관한 고복잡도 기능이다 |
| 전문가 코칭, 상담 연결, 마켓플레이스 | 제품 범주가 테스트 서비스에서 서비스 비즈니스로 커진다 |
| 일지, 습관 추적, 장기 성장 프로그램 | 지속 사용 기능은 초기 검증 대상이 아니다 |
| 궁합/관계 분석 엔진 | 단일 사용자 결과 경험보다 우선순위가 낮다 |
| 다국어 지원 | 질문과 결과는 한국어만 우선 제공한다 |
| 공개 결과 페이지의 인덱싱 허용 | 영구 링크는 유지하되 공개 확산은 제한해야 한다 |
| 원시 이벤트 다운로드형 관리자 기능 | 익명 서비스의 재식별 위험을 높인다 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ASMT-01 | Phase 1 | Complete |
| ASMT-02 | Phase 1 | Complete |
| ASMT-03 | Phase 1 | Complete |
| ASMT-04 | Phase 1 | Complete |
| ASMT-05 | Phase 1 | Complete |
| ASMT-06 | Phase 1 | Complete |
| FLOW-01 | Phase 3 | Complete |
| FLOW-02 | Phase 3 | Complete |
| FLOW-03 | Phase 3 | Complete |
| FLOW-04 | Phase 3 | Complete |
| FLOW-05 | Phase 3 | Complete |
| RSLT-01 | Phase 4 | Complete |
| RSLT-02 | Phase 4 | Complete |
| RSLT-03 | Phase 4 | Complete |
| RSLT-04 | Phase 4 | Complete |
| RSLT-05 | Phase 4 | Complete |
| RSLT-06 | Phase 4 | Complete |
| RSLT-07 | Phase 2 | Complete |
| SHAR-01 | Phase 2 | Complete |
| SHAR-02 | Phase 4 | Complete |
| SHAR-03 | Phase 2 | Complete |
| SHAR-04 | Phase 4 | Complete |
| SHAR-05 | Phase 4 | Complete |
| SHAR-06 | Phase 2 | Complete |
| SHAR-07 | Phase 4 | Complete |
| STAT-01 | Phase 5 | Pending |
| STAT-02 | Phase 5 | Pending |
| STAT-03 | Phase 5 | Pending |
| STAT-04 | Phase 5 | Pending |
| STAT-05 | Phase 5 | Pending |
| STAT-06 | Phase 5 | Pending |
| OPER-01 | Phase 6 | Pending |
| OPER-02 | Phase 2 | Complete |
| OPER-03 | Phase 6 | Pending |
| OPER-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

---
*Requirements defined: 2026-03-29*
*Last updated: 2026-03-29 after Phase 4 completion*
