# Domain Pitfalls

**Domain:** 모바일 우선 익명 에니어그램 검사 웹앱  
**Researched:** 2026-03-29  
**Scope:** 한국어 문항, 익명 검사, 영구 결과 공유 링크, 관리자 통계

## Critical Pitfalls

### 1. 결과를 “정체성 확정” 또는 준진단처럼 포장하는 실수
**What goes wrong:** 에니어그램 결과를 너무 단정적으로 제시하면 사용자가 결과를 과학적 사실이나 심리 진단처럼 받아들인다. 제품 신뢰도보다 반발, 오해, 재검사 이탈이 먼저 온다.

**Why it happens:** 자기계발형 검사 서비스가 공유성과 바이럴을 위해 강한 카피를 쓰기 쉽고, 결과 페이지가 “당신은 X형이다” 식으로 과도하게 확정적이 되기 쉽다.

**Warning signs:**
- 결과 카피에 `정확한 성격 진단`, `본질`, `타고난 유형` 같은 단정 표현이 많다.
- 결과 화면에 불확실성, 점수 분포, 해석 한계가 없다.
- 재검사 시 결과 차이를 설명할 장치가 없다.

**Prevention strategy:**
- 결과를 `자기이해용 해석`으로 명확히 위치시킨다. 진단/치료/선발 도구가 아니라는 안내를 결과 화면과 시작 화면 모두에 둔다.
- 단일 라벨만 크게 보여주지 말고 점수 분포, 근접 유형, 해석 유의사항을 함께 보여준다.
- 결과 카피는 “경향”, “가능성”, “현재 응답 기준” 같은 표현으로 제한한다.

**Which phase should address it:** 콘텐츠/결과 해석 설계 phase, 결과 페이지 UX phase

### 2. 한국어 현지화가 “번역”에서 끝나고 문화 적합성 검증이 없는 실수
**What goes wrong:** 직역된 문항, 어색한 높임말/반말 톤, 한국어에서 의미가 겹치는 선택지가 응답 오류를 만든다. 점수 계산이 맞아도 입력 데이터가 왜곡된다.

**Why it happens:** 심리검사 문항은 단순 번역이 아니라 의미 등가성과 응답 과정 검증이 필요하지만, greenfield에서는 보통 카피 작업으로 처리해버린다.

**Warning signs:**
- 파일럿 테스트에서 “질문 뜻이 비슷하다”, “뭘 고르라는지 모르겠다”는 피드백이 반복된다.
- 특정 문항의 이탈률이나 응답 시간만 유독 높다.
- 한국어 문항에서 부정문, 이중부정, 모호한 빈도 표현이 많다.

**Prevention strategy:**
- 문항 세트를 번역, 역번역, 소규모 인지 인터뷰로 검증한다.
- 한국어 문항은 짧고 단문으로 유지하고, 한 문항에 한 개념만 묻는다.
- 점수 산식 확정 전 모바일 파일럿으로 문항별 응답 시간, 이탈률, 분산을 확인해 문제 문항을 제거한다.
- 문항/결과 카피 버전을 별도 관리해 추후 재검증 가능하게 한다.

**Which phase should address it:** 평가 콘텐츠 설계 phase, 파일럿 검증 phase

### 3. 모바일 설계를 무시하고 데스크톱형 설문 구조를 가져오는 실수
**What goes wrong:** 긴 문단, 작은 탭 영역, 한 화면 다문항, 가로 스크롤, 복잡한 매트릭스형 UI 때문에 완료율과 응답 품질이 같이 떨어진다.

**Why it happens:** 설문 자체만 구현하면 된다고 보고, 모바일 입력 비용과 로딩 비용을 과소평가한다.

**Warning signs:**
- 질문 1개를 읽기 위해 스크롤이 길다.
- 답변 선택지가 화면 폭을 넘어간다.
- 첫 3~5문항에서 이탈이 집중된다.
- 저사양 모바일에서 전환 애니메이션이나 이미지 때문에 체감 지연이 크다.

**Prevention strategy:**
- 기본 원칙을 `한 화면 한 질문 또는 한 묶음`으로 잡는다.
- 라디오/버튼 중심의 터치 친화적 UI를 사용하고 매트릭스형 문항은 피한다.
- 진행 상태, 뒤로 가기, 자동 임시저장을 넣어 새로고침/전화 수신/탭 전환에 복원되게 한다.
- 결과/공유 페이지 포함 전체 플로우를 실제 모바일 기기에서 파일럿한다.

**Which phase should address it:** 핵심 검사 UX phase, 모바일 성능/QA phase

### 4. 문항 품질보다 문항 수를 늘려 정밀도를 착각하는 실수
**What goes wrong:** 길고 반복적인 문항 세트는 사용자를 피로하게 만들고, 후반부 응답은 대충 고르거나 패턴 클릭으로 무너진다. 겉보기엔 데이터가 많아도 실제 신뢰도는 떨어진다.

**Why it happens:** 유형 판별력을 높이려는 욕심 때문에 비슷한 문항을 많이 넣는다.

**Warning signs:**
- 후반 문항에서 동일 응답 반복 비율이 높다.
- 평균 소요 시간이 짧아지는데 완료율은 낮다.
- 결과 분포가 특정 유형으로 과도하게 몰린다.

**Prevention strategy:**
- MVP에서는 짧은 문항 세트로 시작하고, 문항별 분별력 검증 후 확장한다.
- 중복 문항과 구분이 약한 문항을 제거한다.
- 응답 무성의 탐지 규칙(비정상적으로 빠른 응답, 동일 값 반복)을 정의하되, 사용자에게는 처벌형 UX가 아니라 품질 필터로만 사용한다.

**Which phase should address it:** 평가 엔진/문항 설계 phase, 분석 보정 phase

### 5. 결과 영구 링크를 “비공개처럼” 취급하는 실수
**What goes wrong:** 로그인 없이 접근 가능한 영구 링크는 사실상 공개 링크다. 추측 가능한 ID, 검색엔진 인덱싱, 외부 스크립트 referrer, 미리보기 크롤러 때문에 결과가 의도보다 넓게 퍼질 수 있다.

**Why it happens:** 익명 앱이라 계정이 없으니 권한 문제도 없다고 착각하기 쉽다. 하지만 공유 링크는 공개 리소스이고, URL 자체가 민감 데이터가 된다.

**Warning signs:**
- URL이 증가형 숫자 ID나 짧은 슬러그다.
- 결과 페이지에 `noindex`가 없다.
- 결과 페이지에 광고, 외부 분석 스크립트, 외부 이미지가 많다.
- “링크를 받은 사람만 보게 해달라” 요구가 초기에 나온다.

**Prevention strategy:**
- 결과 URL은 충분히 긴 무작위 토큰으로 만들고 내부 PK를 노출하지 않는다.
- 결과 페이지에 검색엔진 `noindex`를 적용한다.
- 기본 `Referrer-Policy`를 엄격하게 두고, 결과 페이지의 제3자 리소스를 최소화한다.
- 영구 보관을 유지하더라도 `삭제/비공개 전환용 별도 관리 토큰`을 같이 발급하는 설계를 초기에 검토한다.

**Which phase should address it:** 공유/저장 아키텍처 phase, 보안 하드닝 phase

### 6. “익명 서비스”인데 운영 데이터가 사실상 개인 추적 데이터가 되는 실수
**What goes wrong:** IP, UA, referrer, precise timestamp, share path, device fingerprint를 습관적으로 쌓다 보면 서비스는 익명처럼 보여도 운영자는 개인 수준 재식별이 가능한 로그를 갖게 된다.

**Why it happens:** 통계와 디버깅에 필요하다는 이유로 원본 이벤트를 전부 저장하는 패턴이 흔하다.

**Warning signs:**
- 이유 없이 원본 IP와 전체 user-agent를 장기 보관한다.
- 유입 URL 전체 쿼리스트링을 그대로 저장한다.
- 익명 검사인데도 세션/기기 식별자가 영구 ID처럼 쓰인다.

**Prevention strategy:**
- `무엇을 저장하지 않을지`부터 정한다. 최소 수집 원칙을 설계 기준으로 둔다.
- 운영 통계는 집계 중심으로 저장하고, 원시 식별자는 짧게 보관하거나 해시/절단/가명처리한다.
- 개인정보 처리방침과 실제 로그 스키마를 맞춘다.
- 관리자 화면에는 개인 수준 이벤트가 아니라 집계 지표만 노출한다.

**Which phase should address it:** 데이터 모델링 phase, 통계/로깅 phase, 운영 정책 phase

### 7. 관리자 통계에서 소표본 셀을 그대로 노출하는 실수
**What goes wrong:** 익명 통계라도 `희귀 조합`을 자르면 개인이 드러난다. 예: 특정 유입원, 특정 날짜, 특정 유형 조합이 1~2건인 경우.

**Why it happens:** 익명화는 이름 제거로 끝난다고 생각하고, quasi-identifier 결합 위험을 놓친다.

**Warning signs:**
- 관리자 대시보드에서 자유로운 필터 조합과 원본 다운로드가 가능하다.
- 일 단위, 캠페인 단위, 기기 단위, 결과 유형 단위를 모두 교차 필터링할 수 있다.
- count 1, 2 같은 셀이 그대로 보인다.

**Prevention strategy:**
- 관리자 통계는 최소 집계 단위와 최소 셀 크기 기준을 둔다.
- 희귀 조합은 숨기거나 `other`로 합친다.
- 원본 이벤트 export를 MVP에서 제외한다.
- 통계용 데이터셋은 서비스 데이터셋과 분리하고, 가명/집계 파이프라인을 둔다.

**Which phase should address it:** 관리자 통계 설계 phase, 데이터 거버넌스 phase

### 8. 관리자 기능을 별도 보안 영역으로 설계하지 않는 실수
**What goes wrong:** 공개 결과 앱은 단순해 보여도 관리자 통계는 민감하다. 약한 인증, 프런트엔드 환경변수 의존, 단일 공용 비밀번호, 누락된 권한 체크는 바로 운영 리스크가 된다.

**Why it happens:** 사용자 계정이 없으니 전체 서비스가 “가벼운 사이트”처럼 느껴져 admin 보호를 뒤로 미룬다.

**Warning signs:**
- `/admin`이 단순 프런트 라우팅 가드에만 의존한다.
- 관리자 인증 비밀값이 클라이언트 번들에서 보인다.
- 통계 API가 세션 없이 직접 호출 가능하다.

**Prevention strategy:**
- 관리자 기능은 공개 앱과 분리된 인증 경계로 둔다.
- 서버 측 인증/권한 검사를 강제하고, 실패 응답과 로그를 남긴다.
- 최소한 강한 비밀번호 정책, rate limit, 2FA 또는 별도 접근 제어를 둔다.
- 운영 계정 수를 최소화하고 감사 로그를 남긴다.

**Which phase should address it:** 관리자 인증 phase, 보안 하드닝 phase

### 9. 결과 계산 규칙과 콘텐츠를 버전 없이 바꾸는 실수
**What goes wrong:** 문항 수정, 가중치 조정, 날개/방향 해석 변경이 생기면 과거 링크 결과와 현재 로직이 어긋난다. 영구 링크가 있는 제품에서는 이것이 곧 데이터 무결성 문제다.

**Why it happens:** 초기에는 “나중에 문항 바꾸면 되지”라고 생각하지만, 저장형 결과 제품은 계산 시점의 규칙을 재현할 수 있어야 한다.

**Warning signs:**
- 결과 레코드에 테스트 버전, 계산 버전, 콘텐츠 버전이 없다.
- 결과 페이지가 저장된 값이 아니라 현재 코드로 재계산한다.
- QA 중에 동일 응답으로 결과가 바뀐다.

**Prevention strategy:**
- 결과 저장 시 원점수, 파생 결과, 알고리즘 버전, 문항 세트 버전을 함께 저장한다.
- 공유 페이지는 기본적으로 `저장된 스냅샷`을 렌더링한다.
- 향후 재해석이 필요하면 마이그레이션을 명시적으로 수행한다.

**Which phase should address it:** 결과 저장 모델 phase, 데이터 마이그레이션/운영 phase

### 10. 공유받은 사용자의 재검사 진입 흐름을 결과 페이지에 억지로 덧붙이는 실수
**What goes wrong:** 공유 결과와 재검사 CTA가 충돌하면 사용자는 “내 결과 보기”와 “나도 해보기” 사이에서 헷갈린다. 모바일에서는 특히 상단 공간이 좁아 핵심 정보가 밀린다.

**Why it happens:** 바이럴 루프를 만들려다 결과 페이지를 랜딩 페이지와 검사 시작 페이지의 혼합물로 만든다.

**Warning signs:**
- 결과 페이지 첫 화면이 CTA와 배너로 가득하고 정작 결과 요약이 안 보인다.
- 공유 유입 사용자가 스크롤 없이 자신의 목적을 바로 달성하지 못한다.
- CTA 클릭률은 높은데 결과 체류/스크롤은 낮다.

**Prevention strategy:**
- 결과 페이지의 1순위는 `공유된 결과 이해`, 2순위는 `재검사 유도`로 우선순위를 고정한다.
- 상단 CTA는 유지하되 결과 요약을 침범하지 않는 높이와 시각 위계로 제한한다.
- 공유 유입 세션과 직접 검사 유입 세션을 분리 측정해 CTA 배치 효과를 검증한다.

**Which phase should address it:** 결과 페이지 UX phase, 성장/전환 최적화 phase

## Moderate Pitfalls

### 11. 소셜 공유 미리보기만 보고 실제 공유 경험을 검증하지 않는 실수
**What goes wrong:** 카카오톡/문자/브라우저 내장 공유에서 제목, 썸네일, 한글 줄바꿈, OG 캐시가 깨지면 공유 의도는 높아도 클릭 후 신뢰가 떨어진다.

**Warning signs:**
- 메신저별 미리보기 카드가 다르게 보인다.
- OG 이미지에 한글 줄바꿈/잘림 문제가 있다.

**Prevention strategy:**
- 주요 공유 채널별 실제 디바이스 테스트를 한다.
- OG 제목/설명/이미지는 결과 카드와 별개로 설계한다.

**Which phase should address it:** 공유 UX phase

### 12. 결과 페이지에 스크린샷 친화성을 고려하지 않는 실수
**What goes wrong:** 많은 사용자는 링크보다 스크린샷을 먼저 공유한다. 핵심 결과가 첫 화면에 정리되지 않으면 공유 확산성과 이해도가 같이 떨어진다.

**Warning signs:**
- 첫 화면에 결과 핵심 요약이 다 들어오지 않는다.
- 스크린샷 시 광고/버튼/불필요한 설명이 대부분을 차지한다.

**Prevention strategy:**
- 결과 상단을 `스크린샷 가능한 카드`로 설계한다.
- 핵심 유형, 날개, 분포 요약, 한 줄 설명을 above-the-fold에 배치한다.

**Which phase should address it:** 결과 페이지 UI phase

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| 평가 콘텐츠 설계 | 문항 번역/적응 검증 없이 출시 | 역번역, 인지 인터뷰, 파일럿 데이터로 문항 정제 |
| 핵심 검사 플로우 | 모바일 이탈률 급증 | 한 화면 한 질문, 자동 임시저장, 실제 기기 QA |
| 결과 해석 UX | 단정적/준진단 카피 | 한계 고지, 분포 기반 결과, 재검사 허용 메시지 |
| 공유 링크 구현 | 추측 가능한 URL, 인덱싱, referrer 누출 | 랜덤 토큰, `noindex`, 엄격한 referrer 정책, 제3자 스크립트 최소화 |
| 저장 모델 | 버전 없는 재계산 | 결과 스냅샷 + 알고리즘/콘텐츠 버전 저장 |
| 관리자 통계 | 재식별 가능한 소표본 노출 | 최소 셀 크기, 희귀 조합 숨김, 원본 export 제외 |
| 관리자 인증 | 프런트엔드만 막는 가짜 보안 | 서버 측 authz, rate limit, 감사 로그, 강한 인증 |
| 운영/정책 | 익명 서비스인데 과수집 | 최소 수집, 짧은 보관, 가명/집계 중심 로그 설계 |

## Recommended Phase Ownership

1. **Assessment Design Phase**
   - Pitfalls 1, 2, 4
2. **Core Mobile Test Flow Phase**
   - Pitfalls 3, 4
3. **Results and Sharing Phase**
   - Pitfalls 5, 9, 10, 11, 12
4. **Admin Stats and Data Governance Phase**
   - Pitfalls 6, 7, 8
5. **Security and Launch Hardening Phase**
   - Re-check Pitfalls 5, 6, 7, 8, 9

## Sources

- International Test Commission, *Guidelines for Translating and Adapting Tests* (2025 update) — HIGH confidence  
  https://www.intestcom.org/files/guideline_test_adaptation_2ed.pdf
- WHO, *World Health Survey Plus: questionnaire adaptation guideline* (2025) — HIGH confidence  
  https://iris.who.int/handle/10665/381630
- SurveyMonkey, *How to design a mobile-friendly survey* — MEDIUM confidence  
  https://www.surveymonkey.com/learn/survey-best-practices/mobile-friendly-surveys/
- SurveyMonkey, *Survey best practices* — MEDIUM confidence  
  https://www.surveymonkey.com/learn/survey-best-practices/
- OWASP, *Insecure Direct Object Reference Prevention Cheat Sheet* — HIGH confidence  
  https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html
- OWASP, *Authorization Cheat Sheet* — HIGH confidence  
  https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- OWASP, *Authentication Cheat Sheet* — HIGH confidence  
  https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- Google Search Central, *Block Search indexing with noindex* — HIGH confidence  
  https://developers.google.com/search/docs/crawling-indexing/block-indexing
- MDN, *Referrer-Policy* practical guide — HIGH confidence  
  https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Referrer_policy
- 국가법령정보센터, 개인정보 보호법 제15조 / 제16조 — HIGH confidence  
  https://www.law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900078586  
  https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=900079387
- 국가법령정보센터, 개인정보 보호법 제28조의2 관련 판례/조문 — HIGH confidence  
  https://www.law.go.kr/detcInfoP.do?detcSeq=186381
- NIST SP 800-188, *De-Identifying Government Datasets: Techniques and Governance* — HIGH confidence  
  https://www.nist.gov/publications/de-identifying-government-datasets-techniques-and-governance

## Confidence Notes

- **Product/UX pitfalls:** MEDIUM. Strong support from current survey/mobile UX sources, plus direct inference from shareable-results product patterns.
- **Security/privacy pitfalls:** HIGH. Supported by OWASP, Google, MDN, NIST, and current Korean legal sources.
- **Korean localization and psychometric pitfalls:** HIGH for translation/adaptation process necessity; MEDIUM for any claim about a specific enneagram item set until that item bank exists.
