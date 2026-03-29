# Phase 05: aggregate-admin-stats - Research

**Researched:** 2026-03-29
**Domain:** Protected aggregate analytics for an anonymous Next.js + PostgreSQL app
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

No `CONTEXT.md` exists for this phase.

Use the existing roadmap, requirements, project constraints, and codebase reality:
- Mobile-first, Korean-only, anonymous user flow
- Admin scope limited to aggregate operational stats only
- No raw event export or per-user/per-link analytics in v1
- Privacy-preserving reporting is required for small samples
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STAT-01 | 관리자만 보호된 통계 화면에 접근할 수 있다. | Env-backed single-admin login, signed `HttpOnly` cookie, server-side guard in `/admin` layout and stats DAL |
| STAT-02 | 관리자는 날짜별 검사 시작 수와 완료 수를 확인할 수 있다. | Persist `assessment_started` events; derive completions from `assessment_results.created_at`; group by local day in SQL |
| STAT-03 | 관리자는 주 유형 분포를 확인할 수 있다. | Aggregate `assessment_results.primary_type` with suppression before render |
| STAT-04 | 관리자는 날개 분포를 확인할 수 있다. | Aggregate `assessment_results.wing_type` with suppression before render |
| STAT-05 | 관리자는 공유 결과 페이지 유입 후 `검사해보기` 클릭 수를 확인할 수 있다. | Persist `assessment_restart_clicked` only through a dedicated result-restart server boundary |
| STAT-06 | 시스템은 재식별 위험이 있는 소표본 통계를 그대로 노출하지 않는다. | Centralized small-cell suppression, hidden totals policy, no raw JSON/API exposure |
</phase_requirements>

## Summary

Phase 05 is mostly a data-boundary problem, not a dashboard-library problem. The current schema already supports completion counts and type/wing distributions from `assessment_results`, but it cannot reconstruct historical starts or result-page restart clicks. `assessment_draft_sessions` is transient by design: rows are deleted on submit and on fresh-start reset, so it is not a reliable analytics source. Restart clicks are not stored anywhere today.

The lowest-risk implementation is:
1. Keep admin auth minimal and server-only: one env-backed admin credential, one signing secret, one signed session cookie, no user table, no third-party auth platform, and no client-readable session state.
2. Add a narrow append-only event table only for data the current schema cannot recover later: `assessment_started` and `assessment_restart_clicked`.
3. Query completions and type/wing distributions from `assessment_results`, then apply suppression in the server data layer before any UI render.

**Primary recommendation:** Use a server-rendered `/admin` page protected by a signed cookie, persist only start and restart events in an append-only table, derive completions from `assessment_results`, and suppress any bucket under `5` before it leaves the server.

## Project Constraints (from CLAUDE.md)

- Use the existing GSD workflow and planning artifacts; this file supports planning, not ad-hoc implementation.
- Preserve the current stack and architecture: Next.js App Router, Drizzle ORM, PostgreSQL, anonymous-user product model.
- Do not introduce end-user accounts or a full auth platform for this phase.
- Keep scope focused on aggregate admin stats only; raw event export and per-link analytics are out of scope.
- Respect mobile-first behavior and Korean-only product copy.
- Prefer existing code patterns in the repo over introducing new infrastructure.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.3` in repo, latest `16.2.1` published 2026-03-20 | Protected admin page, cookies, redirects, server actions | Already in use; App Router supports server-side auth/session patterns cleanly |
| `drizzle-orm` | `0.45.2` published 2026-03-27 | Event writes and aggregate reads | Already in use; explicit SQL-shaped queries fit reporting |
| `pg` | `8.20.0` published 2026-03-04 | PostgreSQL driver | Already in use and sufficient for aggregate queries |
| `zod` | `4.1.5` in repo, latest `4.3.6` published 2026-01-22 | Admin env and login payload validation | Already in use; consistent with existing env parsing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `jose` | `6.2.2` published 2026-03-18 | Signed stateless admin session cookie | Use for cookie signing/verification instead of hand-rolled crypto |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| App-owned admin cookie session | Coolify/reverse-proxy basic auth | Lower app code, but not testable in-repo and weaker for route/DAL-level authorization guarantees |
| Append-only event source for starts/restarts | Reconstruct from existing tables | Not possible for starts after draft deletion, and impossible for restart clicks |
| Query-time daily grouping | Persist daily aggregates immediately | Premature complexity at this traffic level; hard to change when metrics evolve |
| Direct `/api/admin/stats` JSON API | Server-rendered `/admin` page that reads repos directly | JSON API adds auth surface; server rendering is lower-risk for MVP |

**Installation:**
```bash
npm install jose
```

**Version verification:** verified with `npm view` on 2026-03-29.

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/admin/
│   ├── layout.tsx                # server-side auth gate
│   ├── login/
│   │   ├── page.tsx              # password form
│   │   └── actions.ts            # server action sets/deletes admin cookie
│   └── page.tsx                  # server-rendered stats screen
├── app/api/assessment-session/
│   ├── route.ts                  # existing start + delete boundary
│   └── restart-from-result/route.ts
├── db/repositories/
│   ├── admin-stats-event-repository.ts
│   └── admin-stats-read-repository.ts
├── domain/admin-auth/
│   ├── cookie.ts
│   └── session.ts
└── domain/admin-stats/
    ├── schemas.ts
    ├── suppression.ts
    └── view-model.ts
```

### Pattern 1: Minimal Admin Auth Surface
**What:** Add a single admin login form that posts to a server action, validates an env-backed credential, and issues a short-lived signed `HttpOnly` cookie.
**When to use:** All `/admin` pages.
**Prescriptive choice:** Do not add a user table, OAuth provider, auth framework, or client-side session store for this phase.

**Why this fits the repo:**
- Current product is anonymous for end users.
- Admin scope is one protected screen, not a general back office.
- Server-rendered admin pages avoid introducing `/api/admin/*` unless later needed.

### Pattern 2: Record Only Non-Reconstructable Facts
**What:** Persist new data only where current tables lose the fact permanently.
**When to use:** Starts and result-page restart clicks.
**Prescriptive choice:** Keep completions and type/wing distributions on `assessment_results`; do not duplicate them into a second aggregate store in v1.

**Newly persisted data required:**
- `assessment_started`
  - Why: `assessment_draft_sessions` is deleted on submit or reset, so historical starts disappear.
  - Write point: `POST /api/assessment-session` only when it creates a brand-new draft.
- `assessment_restart_clicked`
  - Why: current result CTA only deletes the session then redirects; no durable record exists.
  - Write point: a new dedicated route, e.g. `/api/assessment-session/restart-from-result`, after successful reset logic.

**Data already reconstructable:**
- Daily completions: `assessment_results.created_at`
- Primary type distribution: `assessment_results.primary_type`
- Wing distribution: `assessment_results.wing_type`

### Pattern 3: Append-Only Events, Query-Time Daily Aggregates
**What:** Use one append-only event table as the source of truth for starts and restart clicks, then group by day in SQL.
**When to use:** Date series for starts and shared-result restarts.
**Prescriptive choice:** Do not persist daily aggregate rows in Phase 05.

**Why append-only wins here:**
- Volume is low and product is early-stage.
- Metric definitions may still change during Phase 05 or Phase 06.
- Rebuilding derived daily views from events is safer than correcting precomputed daily rows.
- The repo already has a simple repository pattern; adding a daily-rollup job would create more operational surface than value.

### Pattern 4: Dedicated Restart Route, Not Generic DELETE Instrumentation
**What:** Split result-page restart tracking into its own server boundary.
**When to use:** Shared-result CTA analytics.
**Prescriptive choice:** Do not count restarts inside the existing generic `DELETE /api/assessment-session`.

**Why this matters:**
- The current `DELETE` route is a generic session-clear primitive.
- If future flows reuse it, generic instrumentation will overcount “restart from shared result.”
- A dedicated route makes STAT-05 semantically exact and easier to test.

### Pattern 5: Suppression Before Render
**What:** The read repository returns already-suppressed DTOs.
**When to use:** Daily counts, type distribution, wing distribution, and any totals.
**Prescriptive choice:** Never hand raw counts to client components and never rely on UI-only masking.

### Low-Risk Execution Slices

### Slice 1: Analytics Schema And Write Repository
**Why first:** It isolates the only new persistence surface.
**Edits:**
- `src/db/schema.ts`
- new migration in `drizzle/`
- `src/db/repositories/admin-stats-event-repository.ts`
**Deliverable:** append-only event table + tested write boundary

### Slice 2: Instrument Existing Start Flow
**Why second:** Lowest-risk instrumentation because `POST /api/assessment-session` already distinguishes “existing draft” vs “brand-new draft”.
**Edits:**
- [src/app/api/assessment-session/route.ts](/home/ubuntu/Project/Enneagram/src/app/api/assessment-session/route.ts)
- route tests in `test/assessment/assessment-session-route.test.ts`
**Deliverable:** `assessment_started` recorded only on new draft creation

### Slice 3: Add Dedicated Result-Restart Boundary
**Why third:** Prevents analytics logic from contaminating the generic delete route.
**Edits:**
- new `src/app/api/assessment-session/restart-from-result/route.ts`
- [src/app/results/[publicId]/public-result-restart-cta.tsx](/home/ubuntu/Project/Enneagram/src/app/results/[publicId]/public-result-restart-cta.tsx)
- e2e + unit tests
**Deliverable:** reliable STAT-05 source without semantic drift

### Slice 4: Admin Auth Boundary
**Why fourth:** Keeps admin security separate from analytics math.
**Edits:**
- `src/env.ts`
- `src/domain/admin-auth/*`
- `src/app/admin/login/*`
- `src/app/admin/layout.tsx`
**Deliverable:** signed-cookie admin access with no new end-user auth surface

### Slice 5: Read Models, Suppression, And Admin Page
**Why fifth:** The UI is fed only by finalized, protected DTOs.
**Edits:**
- `src/db/repositories/admin-stats-read-repository.ts`
- `src/domain/admin-stats/*`
- `src/app/admin/page.tsx`
**Deliverable:** protected stats screen showing starts, completions, type and wing distribution, and restart clicks

### Slice 6: Validation And Regression Coverage
**Why last:** Verifies each boundary after code shape is stable.
**Edits:**
- route tests
- new admin auth/read-model tests
- new or extended Playwright protected-admin spec
**Deliverable:** low-risk merge gate

### Anti-Patterns to Avoid
- **Do not reuse `adminToken` from `assessment_results` for site-wide admin auth:** it is per-result metadata, not an operator identity system.
- **Do not build a generic analytics collector:** only record the two facts Phase 05 truly needs.
- **Do not store `publicId`, IP, user agent, or referrer in v1 analytics:** that expands privacy scope without supporting any current requirement.
- **Do not create `/api/admin/stats` unless the server page truly needs client refetching:** server rendering is simpler and more secure here.
- **Do not compute daily buckets in JS:** do timezone-aware bucketing in SQL.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session signing | Custom HMAC/JWT helpers | `jose` | Cookie/session crypto is easy to get subtly wrong |
| Admin identity storage | `admin_users` table for one operator | Env-backed credential + signed cookie | Smaller auth surface and no admin-user lifecycle complexity |
| Start/restart telemetry | Client click tracking | Server-side event writes at success boundaries | Redirects and network races will undercount |
| Privacy masking | Component-level `if (count < n)` checks | Shared suppression module in the domain layer | Keeps every stat view consistent and auditable |
| Daily rollups | Cron job or write-time aggregate rows | Query-time SQL grouping from events/results | Lower operational risk while data volume is small |

**Key insight:** the hard part of this phase is not counting rows; it is choosing the exact mutation boundaries where counts become durable and privacy-safe.

## Common Pitfalls

### Pitfall 1: Counting Starts From Draft Rows
**What goes wrong:** historical starts are lower than reality.
**Why it happens:** `assessment_draft_sessions` is deleted on successful submit and on fresh-start reset.
**How to avoid:** write an `assessment_started` event when the server creates a new draft session.
**Warning signs:** totals drift after users complete assessments or restart from results.

### Pitfall 2: Overloading Generic Session Delete For Restart Analytics
**What goes wrong:** restart metrics become semantically ambiguous.
**Why it happens:** the generic delete route may later be reused outside shared-result flows.
**How to avoid:** add a dedicated restart-from-result route and count only there.
**Warning signs:** future flows clear drafts without being true result-page restarts.

### Pitfall 3: Duplicating Completion Data Into Events Too Early
**What goes wrong:** extra writes, extra tests, and drift between two completion sources.
**Why it happens:** symmetry is mistaken for simplicity.
**How to avoid:** in Phase 05, read completions from `assessment_results.created_at`.
**Warning signs:** code needs reconciliation logic between event rows and result rows.

### Pitfall 4: Leaking Hidden Counts Through Totals
**What goes wrong:** users infer suppressed cells by subtraction.
**Why it happens:** visible totals are rendered alongside hidden rows.
**How to avoid:** if a view contains suppressed cells, omit exact totals for that view or return totals as hidden too.
**Warning signs:** one hidden row and a visible grand total let the hidden value be derived exactly.

### Pitfall 5: Protecting Only The Page Shell
**What goes wrong:** backend data remains fetchable by an unguarded route or helper.
**Why it happens:** layout redirects are treated as complete authorization.
**How to avoid:** gate both `/admin` layout and the repository access path with the same session verifier.
**Warning signs:** stats can be fetched in tests without a valid admin cookie.

## Code Examples

Verified patterns from official sources and this codebase:

### Minimal Stateless Admin Session
```ts
// Source: https://nextjs.org/docs/app/guides/authentication
// Source: https://nextjs.org/docs/app/api-reference/functions/cookies
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_COOKIE = "admin_stats_session";

export async function issueAdminSession(secret: Uint8Array) {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function requireAdminSession(secret: Uint8Array) {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) throw new Error("UNAUTHORIZED");
  await jwtVerify(value, secret);
}
```

### Daily Bucketing In SQL With Explicit Time Zone
```ts
// Source: https://www.postgresql.org/docs/current/functions-datetime.html
import { and, eq, gte, lt, sql } from "drizzle-orm";

const zone = "Asia/Seoul";
const localDay = sql<string>`
  date_trunc('day', ${adminStatsEvents.occurredAt} AT TIME ZONE ${zone})::date
`;
const total = sql<number>`count(*)::int`;

const rows = await db
  .select({ day: localDay, total })
  .from(adminStatsEvents)
  .where(
    and(
      eq(adminStatsEvents.eventType, "assessment_started"),
      gte(adminStatsEvents.occurredAt, from),
      lt(adminStatsEvents.occurredAt, to),
    ),
  )
  .groupBy(localDay)
  .orderBy(localDay);
```

### Suppression At The Read-Model Boundary
```ts
export type SuppressedCount =
  | { hidden: true }
  | { hidden: false; count: number };

export function suppressCount(count: number, threshold = 5): SuppressedCount {
  return count < threshold ? { hidden: true } : { hidden: false, count };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client beacons for UI clicks | Server-owned event writes at successful mutation boundaries | Already standard in modern server-driven apps | More reliable counts, less leakage, easier tests |
| Layout-only auth checks | Page/layout guard plus DAL/route authorization | Reflected in current Next.js auth guidance | Prevents accidental backend exposure |
| Precomputed daily aggregate tables by default | Append-only source + query-time grouping until scale demands more | Common current default for low-volume internal analytics | Lower migration and reconciliation risk |

**Deprecated/outdated:**
- Treating transient session tables as analytics truth: unsuitable here because deletes are part of the product flow.
- UI-only privacy masking: insufficient because raw values can still leak through JSON, logs, or future consumers.

## Open Questions

1. **Which timezone should define “daily” stats?**
   - What we know: all persisted timestamps are `timestamptz`.
   - What's unclear: whether operators expect UTC or Korea time.
   - Recommendation: lock `Asia/Seoul` unless a different ops timezone is explicitly required.

2. **Should the suppression floor be `5` or `10`?**
   - What we know: some threshold is required, and totals must avoid subtraction leaks.
   - What's unclear: how much low-volume visibility the operator actually needs.
   - Recommendation: ship `5` in code as a centralized constant, making future tightening cheap.

3. **Do we need a client-side filtering UI in Phase 05?**
   - What we know: requirements only ask for a protected stats screen, not an exploratory BI tool.
   - What's unclear: whether date-range controls beyond a default recent window are needed immediately.
   - Recommendation: start with a fixed recent range or a simple query-param date window on the server page, not a client data-fetch API.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | App/test execution | ✓ but below repo engine | `v22.22.0` | Use Node 24 before trusting local build parity |
| npm | Package install and scripts | ✓ | `10.9.4` | — |
| Vitest | Unit/route tests | ✓ | `3.2.4` | — |
| Playwright | Browser regression tests | ✓ | `1.58.2` | — |
| PostgreSQL CLI / local service probe | Direct local DB verification | ✗ | — | Use checked-in migrations plus repo tests; DB-level validation will need a provisioned Postgres instance |
| Docker | Local disposable services if needed | ✓ | `28.4.0` | — |

**Missing dependencies with no fallback:**
- None for writing code and repo-level tests.

**Missing dependencies with fallback:**
- Local PostgreSQL tooling is absent. Phase 05 can still be implemented and mostly tested with repository/unit coverage and existing in-memory patterns, but true migration/runtime verification against Postgres will need a provisioned DB later.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4` + Playwright `1.58.2` |
| Config file | [vitest.config.ts](/home/ubuntu/Project/Enneagram/vitest.config.ts), [playwright.config.ts](/home/ubuntu/Project/Enneagram/playwright.config.ts) |
| Quick run command | `npm run test:assessment -- --run test/assessment/assessment-session-route.test.ts test/assessment/score-route.test.ts` |
| Full suite command | `npm test && npx playwright test test/e2e/public-result.spec.ts` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01 | Admin page rejects unauthenticated access and accepts signed session | unit + e2e | `npm test -- test/admin/admin-auth.test.ts` | ❌ Wave 0 |
| STAT-02 | New session creation records starts; stats page shows daily starts/completions | unit | `npm test -- test/admin/admin-stats-read.test.ts test/assessment/assessment-session-route.test.ts` | ❌ Wave 0 / ✅ existing route file |
| STAT-03 | Primary type distribution is aggregated and suppressed correctly | unit | `npm test -- test/admin/admin-stats-read.test.ts` | ❌ Wave 0 |
| STAT-04 | Wing distribution is aggregated and suppressed correctly | unit | `npm test -- test/admin/admin-stats-read.test.ts` | ❌ Wave 0 |
| STAT-05 | Shared-result restart route records click and still returns user to fresh assessment | unit + e2e | `npm test -- test/admin/result-restart-route.test.ts && npx playwright test test/e2e/public-result.spec.ts` | ❌ Wave 0 / ✅ e2e file exists |
| STAT-06 | Buckets below threshold are hidden and totals are not back-solvable | unit | `npm test -- test/admin/admin-stats-suppression.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test:assessment`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm test && npx playwright test test/e2e/public-result.spec.ts`

### Wave 0 Gaps
- [ ] `test/admin/admin-auth.test.ts` — covers STAT-01 session issuance and verification
- [ ] `test/admin/admin-stats-read.test.ts` — covers STAT-02, STAT-03, STAT-04 aggregate DTOs
- [ ] `test/admin/admin-stats-suppression.test.ts` — covers STAT-06 small-cell policy
- [ ] `test/admin/result-restart-route.test.ts` — covers STAT-05 dedicated restart boundary
- [ ] Extend [test/e2e/public-result.spec.ts](/home/ubuntu/Project/Enneagram/test/e2e/public-result.spec.ts) — verify restart flow still works after route split
- [ ] Extend [test/assessment/assessment-session-route.test.ts](/home/ubuntu/Project/Enneagram/test/assessment/assessment-session-route.test.ts) — assert start event write happens only on fresh draft creation

## Sources

### Primary (HIGH confidence)
- [assessment-session route](/home/ubuntu/Project/Enneagram/src/app/api/assessment-session/route.ts) - verified start flow semantics and existing delete boundary
- [assessment score route](/home/ubuntu/Project/Enneagram/src/app/api/assessments/score/route.ts) - verified completion persistence source
- [assessment draft session repository](/home/ubuntu/Project/Enneagram/src/db/repositories/assessment-draft-session-repository.ts) - verified transient draft deletion behavior
- [assessment result repository](/home/ubuntu/Project/Enneagram/src/db/repositories/assessment-result-repository.ts) - verified result fields already available for completion/type/wing stats
- [schema](/home/ubuntu/Project/Enneagram/src/db/schema.ts) - verified current persisted model and missing analytics data
- [public result restart CTA](/home/ubuntu/Project/Enneagram/src/app/results/[publicId]/public-result-restart-cta.tsx) - verified current restart click is not persisted
- https://nextjs.org/docs/app/guides/authentication - verified current Next.js guidance for stateless sessions, env secret, route-handler authorization, and session libraries
- https://nextjs.org/docs/app/api-reference/functions/cookies - verified server-side cookie read/write/delete support in App Router
- https://www.postgresql.org/docs/current/functions-datetime.html - verified `date_trunc` and `AT TIME ZONE` for daily bucketing

### Secondary (MEDIUM confidence)
- https://www.ons.gov.uk/file?uri=%2Fmethodology%2Fmethodologytopicsandstatisticalconcepts%2Fdisclosurecontrol%2Fpolicyonprotectingconfidentialityintablesofbirthanddeathstatistics%2Fdisclosurecontrolguidanceforbirthanddeathstatisticsv2tcm77351338.pdf - verified official guidance that primary suppressions can be derived by subtraction unless totals are handled carefully
- https://www.cdc.gov/united-states-cancer-statistics/technical-notes/pdf/uscs-2014-technical-notes.pdf - verified official use of suppression thresholds for small-count publication risk management

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - almost entirely existing repo stack plus one focused library addition (`jose`)
- Architecture: HIGH - driven by current code boundaries and official Next.js/PostgreSQL guidance
- Pitfalls: HIGH - directly supported by observed transient draft behavior and generic delete semantics
- Small-cell threshold exact value: MEDIUM - need for suppression is clear, but `5` is a policy recommendation rather than a product requirement

**Research date:** 2026-03-29
**Valid until:** 2026-04-28
