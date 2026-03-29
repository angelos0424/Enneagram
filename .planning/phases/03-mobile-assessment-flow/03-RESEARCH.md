# Phase 3: Mobile Assessment Flow - Research

**Researched:** 2026-03-29
**Domain:** Next.js App Router mobile assessment UX, anonymous draft persistence, and submission flow
**Confidence:** HIGH

## User Constraints

No phase-specific `CONTEXT.md` exists for Phase 3. The planner should treat the following as the active user constraints gathered from the phase prompt plus current project docs:

### Locked Inputs
- Goal: 익명 사용자가 모바일에서 검사를 시작하고, 응답을 이어서 복구하며, 모든 필수 문항을 제출해 결과 생성까지 도달할 수 있다.
- Depends on: Phase 2
- Requirements: `FLOW-01`, `FLOW-02`, `FLOW-03`, `FLOW-04`, `FLOW-05`
- Success criteria:
  - 사용자가 로그인 없이 모바일에서 바로 검사를 시작할 수 있다.
  - 사용자가 모바일 화면에 맞는 문항 UI에서 현재 진행 상태를 보며 응답할 수 있다.
  - 사용자가 새로고침하거나 잠시 이탈한 뒤 돌아와도 진행 중 응답을 복구할 수 있다.
  - 사용자가 모든 필수 문항에 답하면 검사를 제출하고 저장된 결과 페이지로 이동할 수 있다.

### Project Constraints
- 모바일 우선 웹 경험이어야 한다.
- 한국어 전용이다.
- 로그인 없는 익명 사용자 흐름이어야 한다.
- 결과는 영구 저장을 전제로 한다.
- Coolify 배포 전제를 깨지 않는 구조여야 한다.
- Phase 2의 영구 결과 스냅샷과 `/results/[publicId]` 계약을 재사용해야 한다.

### Out of Scope
- 회원가입/로그인
- 사용자 프로필 및 결과 히스토리
- 다국어 지원
- 네이티브 앱 전환

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FLOW-01 | 사용자는 로그인 없이 모바일에서 즉시 검사를 시작할 수 있다. | Anonymous cookie session + dedicated mobile route + no auth gate |
| FLOW-02 | 사용자는 모바일 화면에 최적화된 방식으로 문항에 응답할 수 있다. | Single-question client flow, large tap targets, mobile-first layout, native radio semantics |
| FLOW-03 | 사용자는 검사 진행 중 현재 진행 상태를 확인할 수 있다. | Native `<progress>` + answered count derived from current draft state |
| FLOW-04 | 사용자는 세션 중 새로고침 또는 일시 중단 후에도 진행 중인 응답을 복구할 수 있다. | HttpOnly anonymous cookie + Postgres-backed draft row; optional local mirror only as enhancement |
| FLOW-05 | 사용자는 모든 필수 문항 응답 후 검사를 제출할 수 있다. | Reuse existing score route, block incomplete submit client-side, redirect to returned `/results/{publicId}` |

## Project Constraints (from CLAUDE.md)

- Use the existing `Next.js App Router + React + TypeScript + Tailwind + Drizzle + PostgreSQL` baseline; do not switch architectures in this phase.
- Anonymous session strategy is a project directive: use an opaque, random `HttpOnly` cookie plus a database row. Do not introduce Redis-backed session infrastructure for this scope.
- Keep the product a mobile-first web flow; do not plan React Native / Flutter work.
- Do not split this into SPA frontend plus separate API backend just for the assessment flow.
- Do not introduce Supabase, MongoDB, or Redis as new foundational infrastructure for this phase.
- Keep result persistence compatible with the existing permanent snapshot route and copy-version behavior from Phase 2.
- Follow GSD workflow enforcement for any later implementation work.

## Summary

Phase 3 should be planned as a thin App Router feature on top of the current Phase 2 foundation, not as a new subsystem. The repo already has the authoritative assessment definition in typed code, a scoring route that persists immutable result snapshots, and a public result route. What is missing is the user-facing assessment route, an anonymous draft/session persistence layer, and browser-level validation that the mobile flow actually resumes after interruption.

The most important planning constraint is `CLAUDE.md`: anonymous session state should be modeled as an opaque `HttpOnly` cookie plus a database row, not localStorage-only recovery and not Redis. That means Phase 3 should add a draft/session table and route handlers for start/load/update behavior, then keep the existing `/api/assessments/score` route as the final submit boundary. A localStorage mirror can still be used as a secondary UX optimization, but it should not be the canonical recovery source for this project.

The other major planning gap is validation. The current repo has good Vitest coverage for domain and route contracts, but no browser test layer, no `jsdom` component-test setup, and no local Postgres tools available on this machine. Phase planning needs an explicit Wave 0 for either Playwright or equivalent browser coverage and should treat the local Node/Postgres mismatch as an execution constraint.

**Primary recommendation:** Build Phase 3 around a dedicated `/assessment` route with a single client questionnaire component, server-managed anonymous draft persistence via cookie + Postgres, native progress semantics, and Playwright-backed mobile resume verification.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | `15.5.3` (repo pin; npm latest `16.2.1`, published 2026-03-20) | App Router pages, route handlers, cookie/session boundary | Matches the existing codebase and keeps draft/session routes plus result redirect in one runtime |
| React | `19.1.1` (repo pin; npm latest `19.2.4`, published 2026-01-26) | Interactive questionnaire client component | Required for local state, event handlers, transitions, and browser APIs |
| TypeScript | `5.9.2` | Shared typing across assessment contract, draft payloads, and UI state | Prevents drift between question IDs, answers, and persistence payloads |
| Tailwind CSS | `4.1.13` (repo pin; npm latest `4.2.2`, published 2026-03-18) | Mobile-first layout and touch target styling | Already installed; fast way to build responsive assessment UI without extra component framework |
| Zod | `4.1.5` | Draft/update/submit payload validation | The project already uses Zod for submission contracts; extend that pattern instead of ad hoc parsing |
| drizzle-orm | `0.45.2` (npm latest also `0.45.2`, published 2026-03-27) | Draft/session repository and schema changes | Already the project persistence boundary; no reason to add another ORM or RPC layer |
| pg | `8.20.0` | PostgreSQL driver for draft/session storage | Existing database transport layer |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` | npm latest `1.58.2` (modified 2026-03-29) | Real mobile-flow E2E verification | Add in Wave 0 to verify resume-after-refresh, cookie persistence, and result redirect in a browser |
| `@testing-library/react` | npm latest `16.3.2` (published 2026-01-19) | Client component rendering tests | Add only if Phase 3 wants finer-grained client component tests alongside Vitest |
| `jsdom` | npm latest `29.0.1` (published 2026-03-20) | Browser-like environment for component tests | Required if Vitest component tests are added for draft/progress logic |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Cookie + Postgres draft persistence | `localStorage` only | Simpler, but contradicts project session guidance and makes recovery/browser integrity weaker |
| Existing score route + new draft routes | Server Actions for everything | Viable, but current repo already uses route handlers and score-route tests; mixing patterns adds plan complexity |
| Local reducer/state in one client boundary | Zustand/Redux | Overkill for 18 questions and a single route-level flow |
| Native `<progress>` | Custom `div` progressbar | Custom styling flexibility, but worse accessibility and more manual ARIA work |

**Installation:**
```bash
npm install -D @playwright/test
```

Optional component-test layer:
```bash
npm install -D @testing-library/react @testing-library/dom jsdom @vitejs/plugin-react vite-tsconfig-paths
```

**Version verification:** verified against `npm view` on 2026-03-29. The repo is intentionally pinned behind current `next`, `react`, and `tailwindcss` releases, which is acceptable for planning because Phase 1 locked the workspace toolchain. Do not silently upgrade versions inside Phase 3 planning.

## Architecture Patterns

### Recommended Project Structure

```text
src/
├── app/
│   ├── page.tsx                          # lightweight entry or CTA shell
│   ├── assessment/
│   │   ├── page.tsx                      # server shell for the assessment route
│   │   └── _components/
│   │       ├── assessment-flow-client.tsx
│   │       ├── question-card.tsx
│   │       └── progress-header.tsx
│   └── api/
│       └── assessment-session/
│           ├── route.ts                  # POST/GET start or load session
│           └── draft/route.ts            # PATCH draft answers/progress
├── db/
│   ├── schema.ts                         # add assessment draft/session table
│   └── repositories/
│       └── assessment-draft-repository.ts
├── domain/
│   └── assessment/
│       ├── draft-schema.ts               # zod payloads for draft routes
│       └── draft-session.ts              # cookie id helpers / mapping utilities
└── test/
    ├── assessment/
    │   ├── assessment-session-route.test.ts
    │   └── assessment-submit-flow.test.ts
    └── e2e/
        └── mobile-assessment.spec.ts
```

### Pattern 1: Server Shell + Single Client Boundary
**What:** Keep `app/assessment/page.tsx` as a Server Component that imports the authoritative assessment definition and passes serializable props into one top-level client component for interactivity.

**When to use:** Always for the questionnaire route. It matches App Router defaults, keeps bundle scope contained, and avoids pushing database or cookie concerns into the browser.

**Why:** Next.js documents that pages/layouts are Server Components by default, and Client Components should be introduced only where state, event handlers, lifecycle logic, or browser APIs are needed. That maps exactly to this flow: assessment contract on the server, questionnaire interactions in one client island.

**Example:**
```tsx
// Source: inferred from current repo + Next.js Server/Client Components docs
import { assessmentDefinition } from "@/content/assessments/ko/v1";

import { AssessmentFlowClient } from "./_components/assessment-flow-client";

export default async function AssessmentPage() {
  return (
    <AssessmentFlowClient
      definition={assessmentDefinition}
    />
  );
}
```

### Pattern 2: Anonymous Draft Session via HttpOnly Cookie + Draft Table
**What:** On assessment start, create or reuse an opaque anonymous session id in a Route Handler, set it as an `HttpOnly` cookie, and persist draft answers/progress in Postgres keyed by that session id.

**When to use:** Immediately when the user enters the assessment flow. This is the canonical recovery mechanism for `FLOW-04`.

**Why:** `CLAUDE.md` explicitly directs the project to model anonymous session state with `HttpOnly` cookie + DB row. Next.js also documents that cookies must be set in a Route Handler or Server Function, not during page rendering.

**Example:**
```ts
// Source: Next.js cookies() docs + project directive in CLAUDE.md
import { cookies } from "next/headers";

export async function POST() {
  const sessionId = crypto.randomUUID();
  const cookieStore = await cookies();

  cookieStore.set("assessment_session", sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  return Response.json({ ok: true });
}
```

### Pattern 3: Event-Driven Draft Saving, Not Submit-Only Saving
**What:** Persist draft state as the user answers, not only at final submit.

**When to use:** On each answer change, typically with a small debounce or coalescing layer in the client component.

**Why:** Submit-only persistence cannot satisfy `FLOW-04`. The phase requirement is recovery after refresh or interruption, so the durable draft must exist before final submission.

**Example:**
```tsx
// Source: inferred from requirements + React useTransition docs
"use client";

import { useTransition } from "react";

function useDraftPersistence() {
  const [isPending, startTransition] = useTransition();

  const saveDraft = (payload: unknown) => {
    startTransition(async () => {
      await fetch("/api/assessment-session/draft", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    });
  };

  return { isPending, saveDraft };
}
```

### Pattern 4: Native Progress Indicator + Derived Completion State
**What:** Compute completion from answered question count and render it through a native `<progress>` element plus visible copy like `8 / 18`.

**When to use:** Throughout the assessment route header.

**Why:** MDN recommends native progress semantics over custom ARIA recreation. The progress value can be derived from the current draft object, so there is no second source of truth.

**Example:**
```tsx
// Source: MDN <progress> docs
<label htmlFor="assessment-progress">진행 상태</label>
<progress
  id="assessment-progress"
  max={definition.questions.length}
  value={answeredCount}
>
  {answeredCount} / {definition.questions.length}
</progress>
```

### Pattern 5: Reuse Existing Score Route for Final Submit
**What:** Continue using `POST /api/assessments/score` as the final scoring/persistence boundary, then route the user to `payload.publicResult.href`.

**When to use:** Only after the client confirms all required questions are answered.

**Why:** The score route already validates, scores, persists the immutable snapshot, and returns `/results/{publicId}`. Phase 3 should not duplicate final scoring or introduce a second submit boundary.

**Example:**
```tsx
// Source: current src/app/api/assessments/score/route.ts + Next.js useRouter docs
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

function SubmitAssessmentButton({ submission }: { submission: unknown }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(async () => {
      const response = await fetch("/api/assessments/score", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      });
      const payload = await response.json();
      router.push(payload.publicResult.href);
    });
  };

  return <button disabled={isPending} onClick={onSubmit}>결과 보기</button>;
}
```

### Anti-Patterns to Avoid
- **`localStorage` as the only recovery source:** conflicts with the project session directive and leaves recovery coupled to one browser storage mechanism.
- **Cookie writes from a page/layout render:** Next.js docs explicitly say setting cookies is not supported during Server Component rendering.
- **A client-only SPA assessment route that redefines the contract:** the repo already has server-owned assessment content and score routing; duplicating those boundaries adds drift risk.
- **Progress tracked in a second mutable counter state:** derive progress from answer state to avoid mismatch bugs.
- **Using `beforeunload` as the only autosave hook:** MDN marks it unreliable; especially poor on mobile.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Anonymous session identity | Predictable IDs or manually concatenated tokens | Opaque random cookie value + Route Handler cookie APIs | Security-sensitive and already standardized by project guidance |
| Progress semantics | Custom `div` bar with manual ARIA recreation | Native `<progress>` | Better accessibility and less implementation surface |
| Final scoring path | Duplicate client-side scoring or a new submit endpoint | Existing `POST /api/assessments/score` | Phase 2 already established immutable snapshot persistence there |
| Mobile flow verification | Manual browser clicking only | Playwright mobile E2E | Cookie/storage/resume behavior needs real browser coverage |
| Request validation | Ad hoc object checks | Zod schemas | The project already uses Zod and machine-readable error contracts |

**Key insight:** The hard part of this phase is not rendering radio buttons. It is preserving authoritative state across server/client boundaries without breaking the Phase 2 snapshot contract. Reuse the existing boundaries aggressively.

## Common Pitfalls

### Pitfall 1: Putting browser APIs in the wrong component boundary
**What goes wrong:** `window`, `localStorage`, or event listeners are accessed from a Server Component, causing runtime errors or hydration issues.
**Why it happens:** App Router pages default to Server Components, and the current repo is mostly server-safe code.
**How to avoid:** Keep the questionnaire itself in one `"use client"` file and keep server pages/layouts pure.
**Warning signs:** `window is not defined`, hydration mismatches, or code trying to read storage during server render.

### Pitfall 2: Relying on `beforeunload` for recovery
**What goes wrong:** Draft state is not saved when the user backgrounds the browser or switches apps on mobile.
**Why it happens:** `beforeunload` is not reliably fired on mobile and is not Baseline according to MDN.
**How to avoid:** Persist on answer changes; use `visibilitychange` only as hardening, not as the primary save trigger.
**Warning signs:** Resume works on desktop reload but fails after app switching on phones.

### Pitfall 3: Using `localStorage` as canonical session state
**What goes wrong:** Recovery becomes browser-instance-specific, harder to clear safely after submit, and inconsistent with project session policy.
**Why it happens:** It feels simpler than adding a draft table.
**How to avoid:** Make Postgres draft state keyed by the anonymous cookie the source of truth. If a local mirror exists, treat it as disposable cache only.
**Warning signs:** No server route exists for loading drafts; restore logic only reads from browser storage.

### Pitfall 4: Over-saving or under-saving draft changes
**What goes wrong:** Every tap sends redundant writes, or users lose recent answers because saves are too infrequent.
**Why it happens:** The phase sits between instant local UI state and durable recovery needs.
**How to avoid:** Use event-driven saves with a small debounce/coalescing strategy and flush on explicit milestones like answer change or step change.
**Warning signs:** Noticeable input lag, duplicate draft writes, or stale restore state after refresh.

### Pitfall 5: Assuming current test coverage is enough
**What goes wrong:** Domain tests stay green, but the mobile flow still breaks around cookies, redirects, or resume behavior.
**Why it happens:** The current repo has route/domain Vitest tests only.
**How to avoid:** Add Playwright for real browser flow tests and keep Vitest for repository/route contracts.
**Warning signs:** No test exercises refresh, navigation, or browser storage/cookies end to end.

### Pitfall 6: Ignoring environment drift
**What goes wrong:** Planned commands or local runs fail because the repo expects Node 24+, but this machine currently runs Node 22.22.0 and has no local Postgres tooling.
**Why it happens:** `package.json` engines and actual runtime availability differ.
**How to avoid:** Treat Node/Postgres availability as explicit preconditions in the implementation plan.
**Warning signs:** `npm install` or app startup failures, missing `psql`/`pg_isready`, DB-backed E2E blocked locally.

## Code Examples

Verified patterns and project-specific inferred snippets:

### Client boundary for browser APIs
```tsx
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
"use client";

import { useEffect, useState } from "react";

export function AssessmentFlowClient() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Browser-only logic belongs here.
  }, []);

  return <div>{currentIndex}</div>;
}
```

### Safe cookie write in a Route Handler
```ts
// Source: https://nextjs.org/docs/app/api-reference/functions/cookies
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("assessment_session", "opaque-value", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  return Response.json({ ok: true });
}
```

### Transition-backed submit with client redirect
```tsx
// Source: https://react.dev/reference/react/useTransition
// Source: https://nextjs.org/docs/app/api-reference/functions/use-router
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ContinueButton({ href }: { href: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          router.push(href);
        });
      }}
    >
      계속하기
    </button>
  );
}
```

### Storage availability check for optional local mirror
```ts
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
export function localStorageAvailable() {
  try {
    const key = "__assessment_storage_test__";
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Big client-only SPA form with all logic in the browser | Server shell + focused client island in App Router | Next.js App Router era; current docs updated 2026-03-25 | Smaller bundle, cleaner cookie/DB boundaries, easier SSR entry |
| `beforeunload` autosave assumptions | Event-driven persistence, with `visibilitychange` as the reliable lifecycle signal | MDN guidance current as of 2026-02-20 / 2025-06-23 | Better mobile interruption handling |
| Custom ARIA progress bars | Native `<progress>` element | Longstanding HTML baseline; MDN current as of 2025-11-07 | Less accessibility debt |
| Unit-test-only confidence for async UI flows | Pair unit tests with real browser E2E | Next.js testing docs current as of 2026-03-25 | Necessary for cookie/resume/navigation correctness |

**Deprecated/outdated:**
- `beforeunload`-centric autosave as the primary recovery hook: MDN marks it limited availability and unreliable.
- Cookie mutation during Server Component render: Next.js docs explicitly disallow this.
- Adding a global state library first: unjustified for a single-route 18-question flow.

## Open Questions

1. **Should the assessment live at `/` or `/assessment`?**
   - What we know: share pages in Phase 4 need a stable `검사해보기` target, and the current `/` route is only a bootstrap placeholder.
   - What's unclear: whether the product wants a short intro screen on `/` before entering the questionnaire.
   - Recommendation: plan for `/assessment` as the durable flow route and keep `/` free for a lightweight entry shell or future marketing copy.

2. **Do we need a localStorage mirror in v1?**
   - What we know: project guidance says cookie + DB row is the canonical session strategy.
   - What's unclear: whether the team wants extra defense against transient network failure during draft writes.
   - Recommendation: make server-side draft persistence mandatory; treat localStorage only as optional enhancement, not as the recovery contract.

3. **How aggressive should draft autosave be?**
   - What we know: save-on-submit is too late; save-on-change is safest.
   - What's unclear: whether the team prefers one write per answer tap or a short debounce.
   - Recommendation: short debounce or coalescing around answer changes is the best planning default; do not batch until page exit only.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js app and tests | ✓ | `v22.22.0` | None; repo declares `>=24.0.0`, so this is a mismatch to resolve |
| npm | Package install / scripts | ✓ | `10.9.4` | — |
| PostgreSQL CLI (`psql`) | Local DB inspection and manual draft debugging | ✗ | — | Use app-level tests/mocks only until CLI/server is installed |
| PostgreSQL readiness (`pg_isready`) | Local DB availability checks | ✗ | — | None locally |
| Docker | Local database/container fallback | ✓ | `28.4.0` | Could run Postgres via Docker if needed |
| pnpm | Alternative package manager | ✗ | — | Use npm |

**Missing dependencies with no fallback:**
- Local Node runtime matching the repo engine (`>=24.0.0`) is not present.

**Missing dependencies with fallback:**
- Local PostgreSQL tooling/server is absent, but Docker is available if implementation needs a local DB.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4` existing; Playwright `1.58.2` recommended for this phase |
| Config file | [vitest.config.ts](/home/ubuntu/Project/Enneagram/vitest.config.ts), `playwright.config.ts` missing |
| Quick run command | `npm run test:assessment` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FLOW-01 | Anonymous user can start on mobile without login | e2e | `npx playwright test test/e2e/mobile-assessment.spec.ts --project=Mobile Chrome` | ❌ Wave 0 |
| FLOW-02 | Mobile question UI accepts responses cleanly | component/e2e | `vitest run test/assessment/assessment-flow.test.tsx -t "renders mobile questionnaire"` | ❌ Wave 0 |
| FLOW-03 | Progress updates with answered count | component | `vitest run test/assessment/assessment-flow.test.tsx -t "updates progress"` | ❌ Wave 0 |
| FLOW-04 | Refresh/interruption restores the current draft | e2e | `npx playwright test test/e2e/mobile-assessment.spec.ts -g "restores draft after refresh"` | ❌ Wave 0 |
| FLOW-05 | Complete answers submit and redirect to saved result | e2e + route | `npx playwright test test/e2e/mobile-assessment.spec.ts -g "submits completed assessment"` and `vitest run test/assessment/assessment-session-route.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:assessment`
- **Per wave merge:** `npm run test` plus targeted Playwright flow once installed
- **Phase gate:** Full assessment Vitest suite green and Playwright mobile flow green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/e2e/mobile-assessment.spec.ts` — covers `FLOW-01`, `FLOW-04`, `FLOW-05`
- [ ] `playwright.config.ts` — browser test harness
- [ ] `test/assessment/assessment-flow.test.tsx` — covers `FLOW-02`, `FLOW-03`
- [ ] `jsdom` + React Testing Library setup if component tests are added
- [ ] Node runtime upgrade to satisfy `package.json` engine

## Sources

### Primary (HIGH confidence)
- Current repo files:
  - [package.json](/home/ubuntu/Project/Enneagram/package.json)
  - [src/app/api/assessments/score/route.ts](/home/ubuntu/Project/Enneagram/src/app/api/assessments/score/route.ts)
  - [src/db/repositories/assessment-result-repository.ts](/home/ubuntu/Project/Enneagram/src/db/repositories/assessment-result-repository.ts)
  - [src/db/schema.ts](/home/ubuntu/Project/Enneagram/src/db/schema.ts)
  - [src/content/assessments/ko/v1.ts](/home/ubuntu/Project/Enneagram/src/content/assessments/ko/v1.ts)
  - [test/assessment/score-route.test.ts](/home/ubuntu/Project/Enneagram/test/assessment/score-route.test.ts)
  - [vitest.config.ts](/home/ubuntu/Project/Enneagram/vitest.config.ts)
- `CLAUDE.md` project directives: [CLAUDE.md](/home/ubuntu/Project/Enneagram/CLAUDE.md)
- Next.js Server and Client Components docs: https://nextjs.org/docs/app/getting-started/server-and-client-components
- Next.js `cookies()` docs: https://nextjs.org/docs/app/api-reference/functions/cookies
- Next.js `useRouter` docs: https://nextjs.org/docs/app/api-reference/functions/use-router
- Next.js Vitest guide: https://nextjs.org/docs/app/guides/testing/vitest
- Next.js Playwright guide: https://nextjs.org/docs/app/guides/testing/playwright
- React `useTransition` docs: https://react.dev/reference/react/useTransition
- MDN Web Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
- MDN `visibilitychange` event: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
- MDN `<progress>` element: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
- npm registry verification via `npm view` on 2026-03-29 for `next`, `react`, `tailwindcss`, `drizzle-orm`, `@playwright/test`, `@testing-library/react`, and `jsdom`

### Secondary (MEDIUM confidence)
- None needed; primary sources were sufficient for the key decisions.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - mostly derived from the existing repo plus official docs and registry checks
- Architecture: HIGH - strongly constrained by current codebase boundaries and `CLAUDE.md` session guidance
- Pitfalls: HIGH - backed by official Next.js/React/MDN guidance plus concrete repo gaps

**Research date:** 2026-03-29
**Valid until:** 2026-04-28
