# Phase 4: Result Interpretation & Share Loop - Research

**Researched:** 2026-03-29
**Domain:** Immutable public result presentation, mobile-first interpretation UX, and sharing/re-entry flows
**Confidence:** HIGH

## User Constraints

No phase-specific `CONTEXT.md` exists for Phase 4. Planning should treat the roadmap, requirements, completed Phase 2/3 verification artifacts, and the current public-result implementation as the locked inputs.

### Locked Inputs
- Goal: 사용자가 결과를 이해하기 쉬운 결과 중심 레이아웃으로 확인하고, 공유받은 사용자도 상단 CTA를 통해 새 검사를 즉시 시작할 수 있어야 한다.
- Depends on: Phase 3
- Requirements: `RSLT-01`, `RSLT-02`, `RSLT-03`, `RSLT-04`, `RSLT-05`, `RSLT-06`, `SHAR-02`, `SHAR-04`, `SHAR-05`, `SHAR-07`
- Success criteria:
  - 결과 페이지 상단에서 주 유형을 먼저 보여줘야 한다.
  - 같은 화면에서 날개, 점수 분포, 성장/스트레스 방향, 해설 카드, 비진단적 유의사항을 읽을 수 있어야 한다.
  - 결과 페이지에서 공유 링크 복사 또는 모바일 공유가 가능해야 한다.
  - 공유 결과 페이지 상단에는 항상 `검사해보기` CTA가 보여야 하며, 새 익명 검사 흐름으로 이어져야 한다.
  - 공유받은 사용자에게 다음 행동을 제안하는 추천 섹션이 있어야 한다.

### Project Constraints
- 결과 페이지는 Phase 2의 immutable snapshot rendering 원칙을 깨면 안 된다.
- 해설은 저장된 `copyVersion`을 기준으로 읽어야 한다.
- 모바일 우선이어야 하며, Phase 3의 익명 검사 진입 흐름(`/`)과 자연스럽게 연결되어야 한다.
- 공유 페이지는 여전히 로그인 없이 접근 가능하고 privacy defaults(`noindex`, `no-referrer`)를 유지해야 한다.

### Out of Scope
- OG metadata / channel-specific preview optimization (`OPER-04`, `SHAR-08`, `SHAR-09`)
- 관리자 통계 수집 (`STAT-*`)
- 계정/히스토리

## Current State

### What Exists
- `src/app/results/[publicId]/page.tsx`
  - persisted snapshot을 `publicId`로 조회하고 `copyVersion`으로 interpretation copy를 resolve한다.
- `src/app/results/[publicId]/result-snapshot-view.tsx`
  - 최소한의 텍스트 렌더링만 제공한다.
- `src/content/type-copy/ko/v1.ts`
  - 각 유형별 `title`, `summary`, `disclaimerTone`만 가진 얇은 copy contract다.
- Phase 3 submit flow
  - 모바일 검사 제출이 `/results/{publicId}`로 redirect되므로, Phase 4는 실제 유저가 처음 보는 페이지를 다듬는 작업이 된다.

### Gaps
- 현재 결과 페이지는 result-first hierarchy가 없고, 모바일 레이아웃/시각 위계가 거의 없다.
- `TypeCopyEntry`가 너무 얇아서 설명 카드, 비진단적 안내, 추천 섹션 문구를 지원하지 못한다.
- 상단 `검사해보기` CTA, share actions, recommendation section이 전혀 없다.
- 브라우저 레벨에서 “공유 링크로 들어와서 CTA로 새 검사를 시작하는 루프”가 검증되지 않았다.

## Key Risks

### 1. Immutable snapshot boundary drift
Result page를 풍부하게 만들면서 score를 다시 계산하거나 현재 콘텐츠에서 파생 계산을 새로 하면 Phase 2 계약을 깨기 쉽다. Plan은 “저장된 snapshot + 저장된 copyVersion”에서 표현만 확장하는 방향이어야 한다.

### 2. Share UI needs a client island
현재 결과 페이지는 서버 렌더링만으로 충분했지만, `navigator.share`와 clipboard fallback은 클라이언트 컴포넌트가 필요하다. Plan은 share controls만 분리된 client island로 두고, 나머지 결과 본문은 server-driven view model을 유지하는 편이 안전하다.

### 3. Result copy contract is underspecified
`title`/`summary`만으로는 해설 카드, 주의사항, recommendation copy를 표현하기 어렵다. Phase 4 초반에 versioned copy shape를 확장하지 않으면 뒤 계획이 UI 텍스트를 하드코딩하게 된다.

### 4. Browser verification can become flaky if it depends on remote APIs
Web Share API는 데스크톱 브라우저/automation에서 일관되지 않을 수 있다. Clipboard fallback and CTA navigation should be the hard requirements for automation, while native share sheet appearance stays manual-only.

## Recommended Decomposition

### Plan 04-01: Expand immutable result copy + view-model contract
Purpose:
- versioned copy contract를 해설/유의사항/label metadata까지 확장한다.
- public result page view model을 Phase 4 UI에 필요한 이름 있는 필드로 정리한다.

Why first:
- Later UI and share/recommendation sections need stable content primitives.
- This keeps Phase 4 from scattering text literals across TSX.

### Plan 04-02: Implement result-first mobile layout + top CTA restart loop
Purpose:
- primary type hero를 상단에 배치하고, 같은 화면에서 wing/growth/stress/score distribution을 읽게 한다.
- 항상 보이는 `검사해보기` CTA로 `/`로 돌아가 새 익명 검사 진입을 가능하게 한다.

Why second:
- Core Phase 4 value is the result-reading experience itself.
- CTA loop is required before share polish because shared visitors need a clean next step immediately.

### Plan 04-03: Add share actions + recommendation section + browser verification
Purpose:
- clipboard copy + Web Share fallback을 제공한다.
- nearby types and restart/share prompts를 활용한 recommendation section을 추가한다.
- 브라우저에서 shared-result page behavior를 검증한다.

Why third:
- Depends on the richer layout and stable copy/view model.
- Lets the final plan focus on user loop closure and coverage.

## Verification Strategy

### Automated
- Vitest:
  - extend `test/assessment/public-result.test.ts` for richer view-model/copy contract assertions
  - add share-control tests if a dedicated client utility/component appears
- Type/build:
  - `npm run typecheck`
  - `npm run build`
- Playwright:
  - keep `test/e2e/mobile-assessment.spec.ts` for submit-to-result landing assertions
  - add `test/e2e/public-result.spec.ts` for direct public-result page behavior, top CTA loop, and copy/share fallback feedback

### Manual-only
- Real mobile share sheet invocation with `navigator.share`
- Perceived content hierarchy/readability on a phone screen

## Recommended File Targets

### Likely modified
- `src/domain/assessment/types.ts`
- `src/content/type-copy/ko/v1.ts`
- `src/domain/assessment/result-copy.ts`
- `src/app/results/[publicId]/page.tsx`
- `src/app/results/[publicId]/result-snapshot-view.tsx`
- `test/assessment/public-result.test.ts`
- `test/e2e/mobile-assessment.spec.ts`

### Likely new
- `src/app/results/[publicId]/public-result-share-controls.tsx`
- `src/app/results/[publicId]/result-recommendations.tsx`
- `test/e2e/public-result.spec.ts`

## Recommendation

Plan Phase 4 as 3 executable plans across 3 waves:
1. copy/view-model foundation
2. result-first layout + top CTA
3. share/recommendation loop + browser verification

This keeps immutable snapshot rendering intact while delivering the user-facing value in the order users actually experience it.
