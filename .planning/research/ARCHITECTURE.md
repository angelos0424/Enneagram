# Architecture Patterns

**Domain:** Mobile-first enneagram assessment web app
**Researched:** 2026-03-29
**Overall confidence:** MEDIUM-HIGH

## Recommended Architecture

Use a **single web application + Postgres** architecture for v1.

This product does not need microservices. The core behaviors are deterministic scoring, persistent result snapshots, public result pages, and lightweight admin reporting. Those concerns fit cleanly inside one app codebase with a clear internal split between UI, API, scoring domain logic, and analytics queries.

Recommended runtime shape:

```text
Mobile Browser
  -> Web App (SSR pages + API handlers + scoring engine + admin UI)
    -> Postgres (results, scoring version, aggregates)
```

For Coolify, deploy:

1. `web` service
2. `postgres` service with persistent volume

Only the `web` service should be internet-facing. Postgres should stay on the internal Docker network.

## Why This Shape

- **Scoring is deterministic, not compute-heavy.** Keep it in-process as pure domain code.
- **Shared result pages require persistence.** Store an immutable result snapshot at submission time.
- **Admin stats are small-scope.** Querying the same database is simpler than introducing a warehouse.
- **Coolify favors simple container topologies.** One app container and one private database container map directly to its Docker Compose model.

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| Mobile Web UI | Question flow, progress UI, result view, share CTA, re-entry CTA | API layer |
| Content Catalog | Question text, answer options, score weights, type descriptions, wing/growth/stress lookup tables, scoring version | Scoring engine, result renderer |
| Scoring Engine | Convert answer set into type totals, top type, wing, growth/stress directions, normalized chart data | Content catalog, API layer |
| Submission API | Validate payload, invoke scoring, create immutable result snapshot, persist raw answers if desired, return share URL | Scoring engine, Postgres |
| Result Page Renderer | Load stored snapshot by public share ID, render stable public result page, expose "검사해보기" entry point | Postgres, metadata/OG layer |
| Share/Metadata Layer | Generate dynamic page metadata/Open Graph from stored result summary so shared links preview correctly | Result renderer |
| Admin Stats Module | Aggregate completion counts, type distribution, completion rate, daily trends, source/referrer breakdown if collected | Postgres |
| Postgres | Source of truth for results, scoring version, optional raw answers, and rollups | Submission API, result renderer, admin stats |
| Coolify Deployment Layer | Runs web and database containers, injects env vars, manages domain/SSL, persists DB volume | web, postgres |

## Internal Module Split

Inside the single web app, keep these code boundaries explicit:

### 1. Presentation Layer

- Mobile-first pages and components
- Assessment stepper
- Public result page
- Admin dashboard pages

This layer should not contain scoring rules.

### 2. Application Layer

- Submission orchestration
- Result retrieval
- Admin query orchestration
- Request validation

This layer coordinates work but should not own enneagram math.

### 3. Domain Layer

- Type scoring rules
- Wing resolution
- Growth/stress mapping
- Score normalization
- Scoring versioning

This should be pure code with fixture-based tests. No database calls.

### 4. Data Layer

- Result repository
- Optional answer repository
- Admin aggregate queries

This isolates SQL/ORM concerns from product logic.

## Data Model Direction

Prefer a **snapshot-first** persistence model.

### Core tables

| Table | Purpose | Notes |
|-------|---------|-------|
| `assessment_definitions` | Versioned definition of the questionnaire and scoring rules | Can start as seeded JSON mirrored into code or DB |
| `results` | Publicly shareable immutable result snapshot | Main table for result pages |
| `result_answers` | Optional per-question answer audit trail | Useful for analytics/debugging; can be deferred |
| `daily_result_stats` | Optional rollup table for admin performance | Add when admin queries become slow |
| `admin_users` | Admin access control if dashboard is protected in-app | Can be simple basic auth initially if operationally acceptable |

### `results` should store a full snapshot

Do not store only raw answers and recompute on every page load. Store:

- `share_id`
- `locale`
- `assessment_version`
- `primary_type`
- `wing`
- `type_scores`
- `normalized_scores`
- `growth_direction`
- `stress_direction`
- `summary_payload`
- `created_at`
- optional acquisition fields like `source`, `campaign`, `referrer_host`

This matters because public links are intended to be persistent. If scoring rules or copy change later, old shared links should still render the result the user originally got.

## Scoring Architecture

Use a **server-side authoritative scoring pipeline**:

```text
Answers from client
  -> schema validation
  -> scoring engine using assessment_version
  -> derived result object
  -> immutable snapshot persisted
  -> response returns share URL + result payload
```

### Recommended scoring rules structure

- Represent each question answer as weighted contributions to one or more enneagram types.
- Keep the scoring map in versioned configuration, not inline inside UI components.
- Resolve `primary_type` from highest total score.
- Resolve `wing` from the adjacent types of the winning type only.
- Resolve `growth/stress` from a fixed lookup table keyed by `primary_type`.
- Normalize chart values for rendering after raw totals are finalized.

### Why server-side scoring

- Prevents client drift if the app shell is cached.
- Prevents users from fabricating arbitrary result URLs without valid payloads.
- Makes analytics and result snapshots consistent.
- Keeps future scoring changes versionable.

## Public Result Page Pattern

Each completed assessment should produce a stable URL such as:

```text
/r/[share_id]
```

Recommended behavior:

- Result page is server-rendered for fast mobile loads and crawler-friendly sharing.
- Top of page always includes a primary CTA to restart the assessment.
- Metadata is generated from stored result summary for link previews.
- URL should use an opaque ID, not sequential IDs.

### Result page should render from snapshot, not live recomputation

That avoids:

- old links changing when scoring logic changes
- failures if questionnaire definitions are edited
- extra work on each page request

## Sharing Entry Points

Sharing is not a separate subsystem. It is a thin layer on top of stored result pages.

Recommended entry points:

1. Native mobile share action on the result page
2. Copy-link fallback
3. Persistent "검사해보기" CTA at the top of every public result page
4. Optional source tagging on CTA clicks so admin can measure re-entry from shared links

Track these separately:

- assessment starts
- assessment completions
- result page views
- restart clicks from shared result pages

## Admin Stats Architecture

Start with **read-only operational stats**, not a full BI system.

### Minimum dashboard slices

- completions per day
- starts vs completions
- primary type distribution
- wing distribution
- top result pages by views
- share-page restart clicks

### Query strategy

- Query directly from `results` first
- Add `daily_result_stats` rollups only after query latency becomes noticeable
- Keep admin queries isolated from public page handlers

### Access pattern

For v1, one of these is sufficient:

- app-level admin auth with a protected route
- Coolify/edge-level basic auth in front of `/admin`

Prefer app-level protection if admin features will grow beyond simple charts.

## Explicit Data Flow

### 1. Assessment completion flow

```text
User answers questions on mobile
  -> client stores transient progress locally
  -> submit answers to server
  -> server validates payload and assessment version
  -> scoring engine computes result
  -> server writes immutable result snapshot
  -> server returns result payload + share URL
  -> client navigates to public result page
```

### 2. Shared result page flow

```text
Recipient opens /r/[share_id]
  -> server loads stored snapshot from Postgres
  -> server renders result page and metadata
  -> recipient sees result + prominent "검사해보기" CTA
  -> CTA starts a new anonymous assessment session
```

### 3. Admin stats flow

```text
Admin opens dashboard
  -> server verifies admin access
  -> server runs aggregate queries on results data
  -> dashboard renders summary cards and charts
```

## Suggested Build Order

This should drive roadmap sequencing.

### Phase 1: Domain model and scoring core

Build first:

- assessment definition structure
- pure scoring engine
- fixtures for known scoring outcomes
- result snapshot schema

Reason: everything else depends on stable scoring output.

### Phase 2: Persistence and result pages

Build second:

- `results` table
- submission API
- public result route `/r/[share_id]`
- immutable snapshot rendering

Reason: persistent result pages are a core product promise and unlock sharing.

### Phase 3: Mobile assessment flow

Build third:

- question UI
- progress/resume within single session
- submission wiring
- direct navigation to saved result page

Reason: once the backend contract exists, the UI can target a stable API/result shape.

### Phase 4: Sharing and preview quality

Build fourth:

- native share/copy link actions
- dynamic metadata/Open Graph
- restart attribution from shared links

Reason: this converts stored results into a growth loop.

### Phase 5: Admin stats

Build fifth:

- protected admin route
- aggregate queries
- trend and distribution charts

Reason: it depends on real traffic and persisted results.

### Phase 6: Coolify production hardening

Build/finish before launch:

- Dockerfile / Compose
- env var wiring
- domain/SSL configuration
- Postgres volume and backup process
- health checks

Reason: deployment should be simple, but data durability cannot be an afterthought because result links are meant to persist.

## Coolify Deployment Pattern

Recommended deployment shape:

```text
Coolify Project
  -> web service (public domain, SSL)
  -> postgres service (private network, persistent volume)
```

### Deployment rules

- Expose only the web container through Coolify's proxy/domain settings.
- Keep Postgres unexposed and reachable only by service name on the private network.
- Define runtime env vars in the Compose file so Coolify can surface them in the UI.
- Treat database storage and backups as separate from Coolify instance backup.

### Practical implication

Because shared result links are intended to be permanent, database durability matters more than stateless app redeploy convenience. Losing the DB means losing the product's shared artifact layer.

## Patterns to Follow

### Pattern 1: Immutable result snapshots

**What:** Persist the computed result payload at submission time.

**When:** Always, for any shared/public result page.

**Why:** Shared URLs must stay stable across copy changes and scoring revisions.

### Pattern 2: Versioned scoring definitions

**What:** Attach an `assessment_version` to every submission and result.

**When:** From the first release.

**Why:** It prevents silent corruption when questions or weights change later.

### Pattern 3: Thin admin reporting on production tables

**What:** Read aggregates from `results` first; add rollups later.

**When:** Early-stage product with modest traffic.

**Why:** Lower complexity and faster roadmap delivery.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Recomputing shared results from current rules

**What:** Load raw answers and re-run the newest scoring logic for old links.

**Why bad:** Old URLs drift, analytics become inconsistent, and edits to definitions can break historical results.

**Instead:** Save an immutable result snapshot plus scoring version.

### Anti-Pattern 2: Putting scoring logic in the client UI

**What:** Derive the final type entirely in frontend code.

**Why bad:** Harder to version, easier to tamper with, and difficult to keep analytics authoritative.

**Instead:** Client collects answers; server computes the canonical result.

### Anti-Pattern 3: Introducing separate services too early

**What:** Split scoring, admin analytics, and result rendering into multiple deployables in v1.

**Why bad:** More operational surface area without meaningful product gain.

**Instead:** Keep a monolith with strict internal module boundaries.

## Scalability Notes

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Scoring compute | In-process sync scoring | Still fine in-process | Consider background-heavy only if adding expensive personalization |
| Result reads | Direct DB reads | Add indexes on `share_id` and `created_at` | Add caching/CDN for public result pages |
| Admin stats | Direct aggregate queries | Add rollup table/materialized summaries | Separate analytics pipeline if needed |
| Deployment | Single web + Postgres | Same shape with stronger backups | Split read replicas/analytics only when justified |

## Build Order Implications for Roadmap

- Roadmap should start with **scoring contract and result schema**, not UI polish.
- **Persistent result pages** should land before advanced sharing work.
- **Admin stats** should be a later phase because they depend on accumulated result data.
- **Coolify deployment hardening** must be planned before launch, especially backup and volume handling.

## Sources

- Coolify Docker Compose docs: https://coolify.io/docs/knowledge-base/docker/compose
  - Confidence: HIGH for deployment/network/env-var behavior
- Coolify backup/restore docs: https://coolify.io/docs/knowledge-base/how-to/backup-restore-coolify
  - Confidence: HIGH for warning that instance backup does not include application volume data
- Next.js `generateMetadata` docs: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  - Confidence: HIGH for dynamic metadata support on public result pages

## Confidence Notes

- **HIGH:** Coolify deployment shape, env var handling, volume/backup caveat, dynamic metadata support
- **MEDIUM-HIGH:** Monolith + Postgres recommendation for this product scope
- **MEDIUM:** Detailed enneagram scoring rule structure, since exact questionnaire methodology is still a product decision
