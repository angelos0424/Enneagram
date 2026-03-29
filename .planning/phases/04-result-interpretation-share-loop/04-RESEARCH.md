# Phase 4: Result Interpretation & Share Loop - Research

**Researched:** 2026-03-29
**Domain:** Immutable public-result rendering, mobile-first interpretation UI, and share-loop actions
**Confidence:** HIGH

## User Constraints

No phase-specific `CONTEXT.md` exists for Phase 4. Planning should treat the roadmap, requirements, completed Phase 2/3 artifacts, and current codebase as the active constraints.

### Locked Inputs
- Goal: 사용자가 결과를 이해하기 쉬운 결과 중심 레이아웃으로 확인하고, 공유받은 사용자도 상단 CTA를 통해 새 검사를 즉시 시작할 수 있다.
- Depends on: Phase 3
- Requirements: `RSLT-01`, `RSLT-02`, `RSLT-03`, `RSLT-04`, `RSLT-05`, `RSLT-06`, `SHAR-02`, `SHAR-04`, `SHAR-05`, `SHAR-07`
- Success criteria:
  - 결과 페이지 상단에서 주 유형을 먼저 확인할 수 있어야 한다.
  - 같은 화면에서 날개, 점수 분포, 성장/스트레스 방향, 해설 카드를 읽을 수 있어야 한다.
  - 해석 유의사항과 비진단적 성격이 분명해야 한다.
  - 결과 페이지에서 공유 동작이 가능해야 한다.
  - 공유 결과 페이지 상단 CTA로 새 익명 검사 흐름에 진입할 수 있어야 한다.

### Project Constraints
- 결과는 Phase 2처럼 저장된 스냅샷으로만 렌더링되어야 한다. Phase 4에서도 재채점은 금지다.
- 결과 페이지는 모바일 우선이어야 한다.
- 공개 결과 페이지의 `noindex` / `no-referrer` 기본값을 유지해야 한다.
- 익명 검사 진입점은 Phase 3의 `/` 흐름을 재사용해야 한다.
- 새 인프라를 도입하지 않고 현재 `Next.js App Router + React + TypeScript + Tailwind + Drizzle` 구조 안에서 해결해야 한다.

### Out of Scope
- 계정 기반 결과 저장/히스토리
- OG 이미지나 채널별 미리보기 최적화
- 관리자 통계
- 새로운 점수 계산 로직

## What Exists Today

### Implemented
- [src/app/results/[publicId]/page.tsx](/home/ubuntu/Project/Enneagram/src/app/results/%5BpublicId%5D/page.tsx) loads immutable snapshots by `publicId`.
- [src/app/results/[publicId]/result-snapshot-view.tsx](/home/ubuntu/Project/Enneagram/src/app/results/%5BpublicId%5D/result-snapshot-view.tsx) renders a minimal public result page with title, summary, score list, and nearby types.
- [src/domain/assessment/result-copy.ts](/home/ubuntu/Project/Enneagram/src/domain/assessment/result-copy.ts) resolves copy by stored `copyVersion`.
- [src/content/type-copy/ko/v1.ts](/home/ubuntu/Project/Enneagram/src/content/type-copy/ko/v1.ts) has only `title`, `summary`, and `disclaimerTone`.
- Phase 3 already guarantees submit redirects and fresh restart through `/`.

### Missing For Phase 4
- Result-first mobile layout hierarchy. Current page is raw semantic output, not an intentional product UI.
- Rich interpretation content contract. Current copy entries are too thin for cards, disclaimers, or recommendations.
- A top-level `검사해보기` CTA on public result pages.
- Share actions (`copy link`, native share fallback).
- Recommendation section for next actions after reading a shared result.
- Browser verification for share-loop and CTA restart behavior.

## Missing Surface By Requirement

| Requirement | Gap in current code | Likely files |
|-------------|---------------------|--------------|
| `RSLT-01` | No strong hero/top section for primary type | `src/app/results/[publicId]/result-snapshot-view.tsx`, `src/app/globals.css` |
| `RSLT-02` | Wing is shown as a raw number only, not interpreted in-layout | `src/app/results/[publicId]/page.tsx`, `src/app/results/[publicId]/result-snapshot-view.tsx` |
| `RSLT-03` | Score distribution is an unstyled list, not a readable visual | `src/app/results/[publicId]/result-snapshot-view.tsx`, tests |
| `RSLT-04` | Growth/stress are shown as raw numbers only | `src/app/results/[publicId]/page.tsx`, `src/content/type-copy/ko/v1.ts` |
| `RSLT-05` | No explanation cards beyond a title and summary | `src/content/type-copy/ko/v1.ts`, `src/domain/assessment/types.ts`, `src/app/results/[publicId]/result-snapshot-view.tsx` |
| `RSLT-06` | No visible interpretation disclaimer block | `src/content/type-copy/ko/v1.ts`, `src/app/results/[publicId]/result-snapshot-view.tsx` |
| `SHAR-02` | No share button, clipboard flow, or native share hook | new `src/features/result-sharing/*` or route-local client component |
| `SHAR-04` | No top CTA on shared/public result page | `src/app/results/[publicId]/result-snapshot-view.tsx` |
| `SHAR-05` | No explicit flow from CTA to fresh assessment start | `src/app/results/[publicId]/result-snapshot-view.tsx`, browser coverage |
| `SHAR-07` | No recommendation section | `src/content/type-copy/ko/v1.ts`, `src/app/results/[publicId]/result-snapshot-view.tsx` |

## Recommended Decomposition

### Plan 04-01: Expand the immutable result-copy and view-model contract
- Add richer type-copy fields for cards, disclaimer text, direction labels, and recommendation items.
- Keep everything versioned under `copyVersion` so old links remain stable.
- Extend the public result page mapping and regression tests before visual redesign.

### Plan 04-02: Build the mobile-first result-first public page
- Redesign `result-snapshot-view.tsx` into a deliberate, mobile-safe hierarchy.
- Put the primary type hero first, then key stats, chart/distribution, interpretation cards, and disclaimer.
- Keep the page server-rendered from stored snapshot data only.

### Plan 04-03: Add share actions without breaking the immutable public route
- Introduce a small client boundary for `copy link` and `navigator.share` where available.
- Prefer graceful fallback to clipboard when native share is unavailable.
- Keep this boundary isolated so the page remains mostly server-rendered.

### Plan 04-04: Complete the public CTA loop and recommendation finish
- Add a top `검사해보기` CTA with an explicit fresh-start boundary before returning visitors to `/`.
- Add a recommendation/next-action section tuned for shared-result visitors.
- Prove the CTA loop and share/result page behavior in Playwright.

## Architecture Guidance

### Pattern 1: Server page + small client islands
- Keep [src/app/results/[publicId]/page.tsx](/home/ubuntu/Project/Enneagram/src/app/results/%5BpublicId%5D/page.tsx) as the server entry.
- Add client-only islands only for share buttons or browser-only APIs.
- Do not convert the whole result page to a client component.

### Pattern 2: Rich copy stays versioned content, not inline JSX
- Expand [src/domain/assessment/types.ts](/home/ubuntu/Project/Enneagram/src/domain/assessment/types.ts) and [src/content/type-copy/ko/v1.ts](/home/ubuntu/Project/Enneagram/src/content/type-copy/ko/v1.ts).
- Avoid hardcoding interpretation prose in the page component. Phase 2 already established `copyVersion` as the drift boundary.

### Pattern 3: UI uses derived labels, not rescoring
- The public page should derive human labels for wing/growth/stress from stored type ids and copy content.
- Do not import scoring logic into the result route or result components.

### Pattern 4: Share behavior is additive, not canonical
- Sharing should read from the current public URL and page metadata.
- It should not mint tokens, mutate results, or change persistence behavior.

## Risks And Mitigations

### Risk: Expanding copy contract breaks old snapshot rendering
- Mitigation: add optional-safe fields with a single versioned source of truth, then update page tests against stored records.

### Risk: A fully client-side result page weakens immutable SSR behavior
- Mitigation: isolate browser-only share interactions into a small client component and keep page data loading server-side.

### Risk: Recommendation content drifts away from type copy
- Mitigation: store recommendation items in the same versioned copy module as the rest of the interpretation text.

### Risk: Mobile UI becomes visually rich but hard to scan
- Mitigation: plan layout and share actions separately from copy contract so the layout plan can focus on hierarchy, spacing, and tap targets.

## Validation Architecture

Phase 4 needs both server-render regression tests and browser coverage.

### Automated
- `test/assessment/public-result.test.ts`
  - extend for richer view model, disclaimer content, CTA presence, and recommendation content
- `test/assessment/result-contract.test.ts`
  - extend for richer copy/type contract invariants if type shapes change
- `test/e2e/mobile-result-page.spec.ts` or expand `test/e2e/mobile-assessment.spec.ts`
  - verify public result hero, CTA to `/`, and share/copy affordance behavior on a mobile viewport
- `npm run typecheck`
- `npm run build`

### Manual
- confirm result page readability and scrolling rhythm on a narrow viewport
- confirm native share fallback behavior in environments without `navigator.share`

## Recommended Files To Change

- `src/domain/assessment/types.ts`
- `src/content/type-copy/ko/v1.ts`
- `src/domain/assessment/result-copy.ts`
- `src/app/results/[publicId]/page.tsx`
- `src/app/results/[publicId]/result-snapshot-view.tsx`
- `src/app/results/[publicId]/snapshot-metadata.ts` if share text/title needs refinement
- `src/app/globals.css`
- `test/assessment/public-result.test.ts`
- `test/assessment/result-contract.test.ts`
- `test/e2e/mobile-assessment.spec.ts` or a new result-page-specific e2e spec

## Primary Recommendation

Plan Phase 4 as four executable steps: first stabilize the versioned interpretation content contract, then redesign the public result page into a result-first mobile layout, then layer in share actions, and finally finish the CTA loop and recommendation section with explicit fresh-start semantics plus mobile browser verification. That sequencing preserves the immutable snapshot boundary from Phase 2 while avoiding a misleading bare `/` link in a product that now restores anonymous drafts by default.
