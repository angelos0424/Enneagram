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
| STAT-01 | 관리자만 보호된 통계 화면에 접근할 수 있다. | Signed admin session cookie, dedicated `/admin/login`, server-side guard for pages and `/api/admin/*` routes |
| STAT-02 | 관리자는 날짜별 검사 시작 수와 완료 수를 확인할 수 있다. | Append-only event table for starts, `assessment_results.created_at` or completion event for completions, daily aggregate queries |
| STAT-03 | 관리자는 주 유형 분포를 확인할 수 있다. | Aggregate `assessment_results.primary_type` with suppression |
| STAT-04 | 관리자는 날개 분포를 확인할 수 있다. | Aggregate `assessment_results.wing_type` with suppression |
| STAT-05 | 관리자는 공유 결과 페이지 유입 후 `검사해보기` 클릭 수를 확인할 수 있다. | Append-only restart-click event recorded at server mutation boundary |
| STAT-06 | 시스템은 재식별 위험이 있는 소표본 통계를 그대로 노출하지 않는다. | Centralized suppression threshold and hidden-cell policy applied in repository/DAL before UI render |
</phase_requirements>

## Summary

Phase 05 needs three things, not one: a minimal admin auth boundary, a durable append-only event source for starts/restart clicks, and a privacy policy that suppresses small cells before data reaches the UI. The current schema already supports completion counts and type/wing distributions from `assessment_results`, but it cannot reconstruct historical starts or restart clicks because draft sessions are deleted and restart CTA clicks are not persisted.

The safest v1 design is server-owned analytics only. Record `assessment_started` when the server creates a fresh draft session, `assessment_restart_clicked` when the shared-result CTA successfully clears the draft and returns the user to `/`, and derive completions from `assessment_results.created_at` or record a parallel `assessment_completed` event at submit time for symmetry. Do not store IPs, user agents, referrers, or source `publicId`s for this phase.

**Primary recommendation:** Add a small signed-cookie admin login, an append-only `admin_stats_events` table, and a centralized suppression floor of `5` applied in the server data layer before rendering any admin stats.

## Project Constraints (from CLAUDE.md)

- Stay inside the GSD workflow; this artifact exists to support planning, not bypass it.
- Preserve the existing architecture: Next.js App Router, Drizzle, PostgreSQL, anonymous user model.
- Do not recommend member auth or user accounts for this phase.
- Respect mobile-first behavior and Korean-only product copy.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `15.5.3` (repo pinned; npm latest `16.2.1`, published 2026-03-20) | Admin page, route handlers, cookies | Already in use; server rendering and cookie APIs fit protected internal pages well |
| `drizzle-orm` | `0.45.2` (latest, published 2026-03-27) | Aggregate queries and new event table access | Already in use; explicit SQL-shaped reporting is a good fit |
| `pg` | `8.20.0` (latest, published 2026-03-04) | PostgreSQL driver | Existing DB layer |
| `zod` | `4.1.5` (repo pinned; npm latest `4.3.6`, published 2026-01-22) | Admin env and query validation | Existing validation pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `jose` | `6.2.2` (latest, published 2026-03-18) | Signed admin session cookie | Use for stateless admin auth; do not hand-roll cookie signing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| App-level signed admin session | Reverse-proxy/Coolify basic auth only | Simpler infra, but not testable in repo and weaker for route-level app guarantees |
| Append-only events table | Reconstruct from draft/result tables | Fails for starts and restart clicks because draft rows are deleted |
| Store per-link source ids | Store only event type + date | Per-link data helps future v2 analytics, but increases privacy scope and is out of scope for v1 |

**Installation:**
```bash
npm install jose
```

## Architecture Patterns

### Recommended Project Structure
```text
src/
├── app/admin/                    # protected admin pages + login route
├── app/api/admin/stats/          # server-only stats JSON boundary if needed
├── db/repositories/admin-stats-* # event writes + aggregate reads
├── domain/admin-auth/            # cookie signing/verification
└── domain/admin-stats/           # DTOs, suppression policy, date-range schemas
```

### Pattern 1: Dedicated Admin Session Boundary
**What:** Add a dedicated `/admin/login` flow that verifies a single admin password from env, then issues an `HttpOnly`, `secure`, `sameSite=lax` signed cookie with short TTL.
**When to use:** All `/admin` pages and `/api/admin/*` routes.
**Recommendation:** Guard twice: page/layout guard for navigation UX, and a shared `requireAdminSession()` helper inside the DAL/API boundary so data cannot be fetched accidentally without auth.

### Pattern 2: Append-Only Event Recording At Server Mutation Boundaries
**What:** Record analytics when the server already knows the action succeeded.
**When to use:** On fresh draft creation, on successful result persistence, and on successful shared-result restart handling.
**Recommendation:** Do not record on the client with `navigator.sendBeacon`, `onClick`, or fire-and-forget fetches. Navigation races will undercount restart clicks.

### Pattern 3: Aggregate Read Models, Not Raw Event Browsing
**What:** Build one repository that returns already-suppressed admin DTOs.
**When to use:** Daily starts/completions/restarts, type distribution, wing distribution.
**Recommendation:** The UI should never receive unsuppressed raw cells.

### Anti-Patterns to Avoid
- **Reusing `adminToken` from `assessment_results` for site-wide admin access:** that token is per-result metadata, not an operator identity boundary.
- **Using `assessment_draft_sessions` as the source of truth for starts:** draft rows are deleted on completion and restart, so historical starts are lost.
- **Capturing `publicId`, referrer, IP, or user agent for v1 stats:** unnecessary privacy expansion and outside requirement scope.
- **Applying suppression only in the React component:** raw values can still leak through logs, JSON, or future consumers.

## Event / Aggregate Data Model

### Recommended New Table
```text
admin_stats_events
- id uuid pk
- event_type text not null
  - assessment_started
  - assessment_completed
  - assessment_restart_clicked
- occurred_at timestamptz not null
- assessment_version text null
- source_surface text null
  - public_result for restart clicks
```

### Why This Shape
- `assessment_started`: written only when `POST /api/assessment-session` creates a brand-new canonical draft
- `assessment_completed`: optional but recommended for symmetry; if omitted, use `assessment_results.created_at`
- `assessment_restart_clicked`: written only when shared-result restart succeeds on the server
- No `publicId`, no IP, no UA, no per-user key

### Existing Tables Still Used
- `assessment_results.created_at`: completion timeline
- `assessment_results.primary_type`: type distribution
- `assessment_results.wing_type`: wing distribution

### Data Gaps In Current Code
- Starts are **not** historically derivable: `assessment_draft_sessions` rows are deleted by `finalizeDraftSession()` and `deleteDraftSession()`.
- Restart clicks are **not** stored at all: the CTA does `DELETE /api/assessment-session` then redirects.
- `adminToken` exists on results but is unused for admin auth and should stay unrelated to Phase 05 auth.

## Privacy Threshold Handling

### Recommended Policy
- Use a centralized minimum display threshold of **`5`**.
- Any bucket `< 5` is returned as hidden, not numeric.
- For distributions, return:
  - visible rows with `count >= 5`
  - one `suppressed` bucket with hidden total count omitted from UI
- For daily series, days `< 5` should render as hidden or omitted, not exact counts.

### Why `5`
- It is a common small-cell suppression floor in privacy-sensitive aggregate reporting.
- It materially lowers casual re-identification risk without making the dashboard useless at MVP scale.
- Confidence: MEDIUM for the exact threshold, HIGH for needing a threshold at all.

### Important Detail
- Suppression must happen before the UI sees the data.
- If the UI also shows grand totals, ensure hidden cells cannot be trivially derived by subtraction. The simplest v1 answer is to suppress grand totals on views that contain hidden cells.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin session signing | Custom HMAC/JWT code | `jose` | Cookie crypto bugs are expensive and easy to get wrong |
| Start/restart analytics | Client click tracking | Server-side append-only event writes | Prevents dropped events during redirects/navigation |
| Daily bucketing | JS date math across records | PostgreSQL `date_trunc` / SQL grouping | Timezone and grouping bugs belong in the DB layer |
| Privacy policy | Ad hoc per-widget `if (count < n)` | Shared suppression function in admin stats domain | Keeps every chart/table consistent and auditable |

## Common Pitfalls

### Pitfall 1: Counting Starts From Draft Rows
**What goes wrong:** Historical starts look lower than reality.
**Why it happens:** Drafts are deleted on completion/restart.
**How to avoid:** Write `assessment_started` as an append-only event when a new draft is created.

### Pitfall 2: Losing Restart Clicks During Redirect
**What goes wrong:** Shared-result restart counts under-report.
**Why it happens:** Client navigation can win before telemetry lands.
**How to avoid:** Record the event inside the successful server delete/reset path, then redirect.

### Pitfall 3: Auth Only In The UI
**What goes wrong:** JSON routes or server functions can still expose stats.
**Why it happens:** Layout checks are mistaken for complete access control.
**How to avoid:** Require admin session in page loader and every admin repository/API boundary.

### Pitfall 4: Exposing Tiny Cells
**What goes wrong:** A low-volume day or rare type leaks sensitive operational detail.
**Why it happens:** Raw SQL counts are rendered directly.
**How to avoid:** Always pass results through the suppression layer before returning DTOs.

## Code Examples

### Admin Session Guard
```ts
// Source: Next.js cookies/authentication docs + jose docs
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const ADMIN_COOKIE = "admin_stats_session";

export async function requireAdminSession(secret: Uint8Array) {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) throw new Error("UNAUTHORIZED");
  await jwtVerify(value, secret);
}

export async function issueAdminSession(secret: Uint8Array) {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(secret);
}
```

### Daily Aggregate Query
```ts
// Source: existing Drizzle repository pattern + Drizzle aggregate docs
import { sql } from "drizzle-orm";

const day = sql<string>`date_trunc('day', ${events.occurredAt})::date`;
const total = sql<number>`count(*)::int`;

await db
  .select({ day, total })
  .from(events)
  .where(sql`${events.eventType} = 'assessment_started'`)
  .groupBy(day)
  .orderBy(day);
```

### Suppression At The DTO Boundary
```ts
export function suppressCount(count: number, threshold = 5) {
  return count < threshold ? { hidden: true } : { hidden: false, count };
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Client-side analytics beacons for every click | Server-owned event writes at mutation boundaries | More reliable counts and less leakage |
| Layout-only protection | Shared auth guard at page + API/DAL boundaries | Prevents accidental backend exposure |
| Raw dashboard counts | Privacy-aware DTOs with suppression | Aligns admin visibility with anonymous-product constraints |

## Open Questions

1. **Timezone for “daily” stats**
   - What we know: all persisted times are `timestamptz`.
   - What’s unclear: whether operators expect UTC or Korea time.
   - Recommendation: lock this in planning; default to `Asia/Seoul` for user-facing admin charts if the operator is Korea-based.

2. **Suppression floor `5` vs `10`**
   - What we know: some threshold is required.
   - What’s unclear: operator tolerance for hiding low-volume days.
   - Recommendation: ship `5` as default, but keep it configurable in server code.

3. **Completions from results table only vs mirrored event**
   - What we know: `assessment_results.created_at` already supports completion counts.
   - What’s unclear: whether the team wants a single event table for all timelines.
   - Recommendation: for implementation simplicity, query completions from `assessment_results` and use the event table only for starts/restarts.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | App/test runtime | ✓ with mismatch | `v22.22.0` | None; repo declares `>=24.0.0` |
| npm | Package install/scripts | ✓ | `10.9.4` | — |
| Vitest | Unit/server tests | ✓ | `3.2.4` | — |
| Playwright | Browser verification | ✓ | `1.58.2` | — |
| PostgreSQL CLI (`psql`) | Manual query verification | ✗ | — | Use Drizzle/in-memory tests only for local automation |
| PostgreSQL readiness tools (`pg_isready`) | Local DB availability checks | ✗ | — | Manual app-level verification only |

**Missing dependencies with no fallback:**
- None for planning. For full runtime-faithful execution, Node 24 should replace Node 22.

**Missing dependencies with fallback:**
- Local PostgreSQL CLI tools are absent; use repo tests and code review, but production-like aggregate verification remains weaker until a DB is available.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest `3.2.4` + Playwright `1.58.2` |
| Config file | package scripts only; no separate config detected |
| Quick run command | `npm test -- --run test/assessment` |
| Full suite command | `npm test && npm run test:e2e:mobile` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01 | Unauthenticated users cannot access admin stats; authenticated admins can | unit + e2e | `vitest run test/assessment/admin-auth.test.ts` and `playwright test test/e2e/admin-stats.spec.ts -g "protects admin stats"` | ❌ Wave 0 |
| STAT-02 | Daily starts/completions aggregate correctly | unit | `vitest run test/assessment/admin-stats-repository.test.ts -t "daily starts and completions"` | ❌ Wave 0 |
| STAT-03 | Primary type distribution is grouped and suppressed correctly | unit | `vitest run test/assessment/admin-stats-repository.test.ts -t "primary type distribution"` | ❌ Wave 0 |
| STAT-04 | Wing distribution is grouped and suppressed correctly | unit | `vitest run test/assessment/admin-stats-repository.test.ts -t "wing distribution"` | ❌ Wave 0 |
| STAT-05 | Shared-result restart writes an event and appears in stats | unit + e2e | `vitest run test/assessment/public-result-restart-metrics.test.ts` and `playwright test test/e2e/admin-stats.spec.ts -g "counts restart clicks"` | ❌ Wave 0 |
| STAT-06 | Counts below threshold are hidden before render | unit | `vitest run test/assessment/admin-stats-privacy.test.ts` | ❌ Wave 0 |

### Browser / Server Verification Requirements
- **Server verification**
  - Unit-test admin cookie issue/verify/expiry behavior
  - Unit-test `POST /api/assessment-session` only records `assessment_started` for a newly created draft, not when reusing an existing draft
  - Unit-test shared-result restart path records `assessment_restart_clicked` only after successful reset
  - Unit-test aggregate repository queries and suppression behavior with seeded rows
- **Browser verification**
  - Anonymous visit to `/admin` redirects or shows login gate
  - Valid admin login reaches protected stats page
  - Completing an assessment then clicking `검사해보기` from a result page increments restart stats after refresh
  - Suppressed cells render as hidden labels, not exact integers

### Wave 0 Gaps
- [ ] `test/assessment/admin-auth.test.ts`
- [ ] `test/assessment/admin-stats-repository.test.ts`
- [ ] `test/assessment/admin-stats-privacy.test.ts`
- [ ] `test/assessment/public-result-restart-metrics.test.ts`
- [ ] `test/e2e/admin-stats.spec.ts`

## Sources

### Primary (HIGH confidence)
- Existing codebase:
  - [`src/db/schema.ts`](/home/ubuntu/Project/Enneagram/src/db/schema.ts) - current result and draft-session schema
  - [`src/db/repositories/assessment-result-repository.ts`](/home/ubuntu/Project/Enneagram/src/db/repositories/assessment-result-repository.ts) - current result retrieval boundary
  - [`src/app/api/assessment-session/route.ts`](/home/ubuntu/Project/Enneagram/src/app/api/assessment-session/route.ts) - start/reset behavior
  - [`src/app/api/assessments/score/route.ts`](/home/ubuntu/Project/Enneagram/src/app/api/assessments/score/route.ts) - completion persistence path
  - [`src/app/results/[publicId]/public-result-restart-cta.tsx`](/home/ubuntu/Project/Enneagram/src/app/results/[publicId]/public-result-restart-cta.tsx) - restart-click client behavior
  - [`test/e2e/public-result.spec.ts`](/home/ubuntu/Project/Enneagram/test/e2e/public-result.spec.ts) - existing restart/share browser coverage
- Next.js docs:
  - https://nextjs.org/docs/15/app/api-reference/functions/cookies
  - https://nextjs.org/docs/15/app/guides/authentication
  - https://nextjs.org/docs/15/app/guides/data-security
- Drizzle docs:
  - https://orm.drizzle.team/docs/select
- Package registry checks via `npm view` on 2026-03-29

### Secondary (MEDIUM confidence)
- `jose` project docs: https://github.com/panva/jose
- Small-cell suppression as a privacy pattern from public-sector reporting guidance

### Tertiary (LOW confidence)
- Exact suppression threshold choice (`5` vs `10`) is policy judgment, not a framework requirement

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - phase fits the existing Next.js/Drizzle/PostgreSQL stack with only one likely new dependency (`jose`)
- Architecture: HIGH - current codepaths clearly show where starts/completions/restarts are created or lost
- Pitfalls: HIGH - directly verified against current schema and route behavior

**Research date:** 2026-03-29
**Valid until:** 2026-04-28
