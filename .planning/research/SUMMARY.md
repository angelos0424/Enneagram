# Project Research Summary

**Project:** 에니어그램 모바일 테스트 사이트
**Domain:** Mobile-first anonymous enneagram assessment web app
**Researched:** 2026-03-29
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project is a Korean, mobile-first personality assessment product whose real MVP is not just "take a test" but a complete viral loop: anonymous entry, low-friction question flow, detailed result interpretation, a permanent shareable result page, and a clear retake CTA for the next visitor. Experts build this kind of product as a simple web app, not a native app or a service mesh. The recommended baseline is a single Next.js full-stack app on Coolify with PostgreSQL, server-side scoring, and immutable stored result snapshots.

The strongest recommendation across the research is to treat scoring and stored results as the product core, not the UI shell. Build a pure scoring engine, version the questionnaire and scoring rules from day one, persist a stable result snapshot for each completion, and render public result pages from that snapshot. This keeps shared links durable, keeps analytics coherent, and prevents result drift when copy or scoring changes later.

The biggest risks are not scaling or infrastructure complexity. They are product integrity and trust: weak Korean item adaptation, desktop-style survey UX on mobile, overconfident result language, privacy leaks from "public" share links, and under-secured admin stats. The roadmap should therefore front-load scoring contract, content/versioning, privacy-aware persistence, and mobile UX discipline before it spends time on advanced share mechanics or analytics polish.

## Key Findings

### Recommended Stack

The stack research is directionally clear: keep the system boring and integrated. A single Next.js 15 app with React 19 and TypeScript fits the anonymous test flow, public result rendering, dynamic metadata, and small admin surface without introducing a separate backend service. PostgreSQL 16 is the right persistence default because results, answers, versions, and admin stats are naturally relational and aggregate-heavy. Drizzle is the recommended ORM because the admin side will likely need explicit SQL-shaped queries rather than heavy ORM abstraction.

Coolify is a deployment constraint, so the app should ship as a Dockerfile-based Node 24 LTS service plus a separate managed PostgreSQL service with backups. Avoid Redis, Supabase, MongoDB, and microservices in v1 unless the product scope changes materially.

**Core technologies:**
- `Next.js 15`: Full-stack app shell, SSR result pages, route handlers, metadata, and OG support in one runtime.
- `React 19`: Current stable UI runtime aligned with Next.js 15.
- `TypeScript 5`: Keeps questionnaire schema, scoring logic, result payloads, and DB models aligned.
- `Node.js 24 LTS`: Lowest-risk current LTS runtime for Coolify container deploys.
- `Tailwind CSS 4`: Fast mobile-first UI delivery without heavy UI framework lock-in.
- `PostgreSQL 16`: Durable relational store for results, answers, versions, and admin aggregates.
- `Drizzle ORM` + `drizzle-kit` + `pg`: Type-safe DB access and reviewable migrations with SQL-friendly ergonomics.
- `Zod`: Validation for submissions, filters, and environment config.
- `nanoid`: Opaque public result IDs to avoid exposing sequential identifiers.
- `next/og`: Dynamic preview metadata and OG image support for shared result pages.

### Expected Features

Feature research says users will judge this product on result quality and shareability more than on the raw questionnaire UI. A minimal product still needs anonymous start, mobile-safe progress, a detailed result above the fold, stable share links, and an obvious retake path on shared pages. The recommended differentiator is lightweight, useful post-result guidance, not community features or account systems.

**Must have (table stakes):**
- Anonymous start with no signup friction.
- Mobile-first question flow with large tap targets.
- Visible progress indicator and interruption-safe in-session resume.
- Detailed result with primary type, wing, score distribution, and growth/stress direction.
- Explanation cards that translate scores into readable meaning.
- Permanent shareable result URL with stable persistence.
- Shared result page with a prominent `검사해보기` CTA near the top.
- Basic trust copy explaining how to read the result and its limits.

**Should have (competitive):**
- Lightweight recommendation flow immediately under the result.
- "Why this result?" explanation using top-score shape and runner-up context.
- Result page optimized for recipients who arrived from a shared link.
- Admin analytics for funnel and type-distribution visibility.
- Share-oriented metadata and preview quality once core link sharing works.

**Defer (v2+):**
- Account system or saved user profiles.
- Social graph, chat, coaching, or compatibility engine.
- Retest/refinement mini-flow for ambiguous results.
- Rich BI-style analytics dashboards or raw event export.
- Cosmetic personalization or heavy theory encyclopedia content.

### Architecture Approach

Architecture research strongly supports a monolith with explicit internal boundaries. Keep presentation, application orchestration, scoring domain logic, and data access separate inside one Next.js app. The scoring engine should remain pure and server-authoritative; the client collects answers, but the server validates, computes, versions, stores, and returns the canonical result. Public result pages should render from immutable stored snapshots at `/r/[share_id]`, not by recomputing raw answers on request.

**Major components:**
1. Mobile Web UI — assessment flow, progress, result page, share and retake affordances.
2. Content Catalog — questionnaire content, score weights, type copy, and versioned lookup tables.
3. Scoring Engine — deterministic calculation of primary type, wing, directions, and normalized score payloads.
4. Submission API — validates payloads, invokes scoring, persists immutable result snapshots, and returns share URLs.
5. Result Page Renderer — loads snapshots by opaque share ID and server-renders stable public pages.
6. Share/Metadata Layer — generates metadata and optionally OG assets from stored result summaries.
7. Admin Stats Module — read-only aggregate queries for starts, completions, distributions, and restart loops.
8. Postgres — source of truth for results, versions, optional answers, and aggregate data.

### Critical Pitfalls

1. **Overstating the result as diagnosis or fixed identity** — Use probabilistic language, show score distribution and close types, and add interpretation-limit copy on both entry and result screens.
2. **Treating Korean localization as translation only** — Validate items with adaptation workflow, cognitive testing, and mobile pilot data before trusting the scoring output.
3. **Importing desktop survey UX into a mobile product** — Keep one-question or short-batch screens, large controls, visible progress, and local draft recovery.
4. **Treating permanent share links as private content** — Use long random IDs, `noindex`, strict `Referrer-Policy`, minimal third-party resources, and consider delete/private-management tokens early.
5. **Changing scoring rules or result content without versioning** — Store raw totals, derived results, questionnaire version, and algorithm/content version in immutable result snapshots.
6. **Collecting too much operational data in an "anonymous" service** — Define a minimum-collection policy, prefer aggregate metrics, and avoid long-lived raw identifiers.
7. **Under-securing admin stats** — Enforce server-side authz, rate limits, and audit logging; do not rely on client-only route guards.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Assessment Contract And Scoring Core
**Rationale:** Everything else depends on a stable questionnaire definition and canonical result shape. Without this, UI, persistence, and analytics will all churn.
**Delivers:** Versioned assessment definition, scoring engine, result schema, fixtures for known outcomes, and content/version model.
**Addresses:** Detailed result quality, trust, and the minimum viable result richness expected by users.
**Avoids:** Unversioned scoring drift, weak content structure, and fake precision from a poorly designed item set.

### Phase 2: Result Persistence And Public Snapshot Pages
**Rationale:** Permanent shareable results are a core product promise and the backbone of the viral loop.
**Delivers:** `results` schema, submission API, opaque share IDs, immutable stored snapshots, `/r/[share_id]` route, privacy headers, and `noindex`.
**Uses:** PostgreSQL, Drizzle migrations, server-side scoring, `nanoid`, Next.js SSR and metadata primitives.
**Avoids:** Recomputing old results, guessable URLs, broken persistence, and privacy leakage from public pages.

### Phase 3: Mobile Assessment Flow
**Rationale:** Once the scoring and persistence contracts are stable, the user-facing flow can be built against real backend boundaries instead of placeholders.
**Delivers:** Anonymous start flow, mobile-first question UI, progress indicator, local draft recovery, submission wiring, and navigation into the stored result page.
**Implements:** Mobile Web UI, Submission API integration, and presentation/application boundary.
**Avoids:** Desktop-style survey UX, poor mobile completion, and session loss on refresh/interruption.

### Phase 4: Result Interpretation And Sharing Loop
**Rationale:** This phase turns a functional test into a product people will understand and share.
**Delivers:** Explanation cards, recommendation module, top-of-page `검사해보기` CTA, copy-link/native-share actions, preview metadata, and attribution for restart clicks.
**Addresses:** Table-stakes interpretation depth plus the main differentiators identified in feature research.
**Avoids:** Overly certain result framing, CTA clutter that buries the result, and shallow "you are Type X" output.

### Phase 5: Admin Stats And Data Governance
**Rationale:** Admin visibility matters, but only after results and share flows exist to generate meaningful data.
**Delivers:** Protected admin route, aggregate queries for starts/completions/type distribution/restart loop, minimum-cell-size rules, and low-PII logging policies.
**Uses:** Thin aggregate queries on production tables first; optional rollups later if needed.
**Avoids:** Premature BI work, re-identification through rare slices, and over-collection of raw event data.

### Phase 6: Launch Hardening And Coolify Operations
**Rationale:** The product promise includes permanent links, so deployment hardening and backups cannot be left to the last minute.
**Delivers:** Dockerfile-based Coolify deploy, env wiring, health checks, internal-only Postgres network exposure, scheduled backups, admin auth hardening, and launch QA for mobile/share channels.
**Implements:** Coolify deployment layer, security controls, and operational recovery baseline.
**Avoids:** Fragile deploys, public DB exposure, backup gaps, and weak admin protection at launch.

### Phase Ordering Rationale

- Start with the scoring contract because it defines the payload every later phase consumes.
- Land persistence before sharing polish because the share loop depends on stable result URLs, not just button UI.
- Build the mobile test flow after backend contracts exist so the front end targets real APIs and snapshot semantics.
- Delay admin work until there is meaningful data, but do not delay privacy and auth boundaries for that admin surface.
- Treat operational hardening as a release gate, not cleanup work, because shared-result durability is part of the product itself.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Questionnaire adaptation and scoring methodology need focused validation because Korean item wording quality will strongly affect result trust.
- **Phase 4:** Share-channel behavior, especially Korean preview/rendering across messaging apps, likely needs targeted testing and channel-specific validation.
- **Phase 5:** Data governance thresholds for admin slices may need explicit policy decisions if campaign/referrer tracking expands.
- **Phase 6:** If admin auth requirements become stricter than a small internal dashboard, the exact auth model may need separate security review.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Snapshot persistence, opaque IDs, SSR public pages, and metadata generation are well-documented patterns.
- **Phase 3:** Anonymous cookie/session flow, mobile stepper UX, and server-side submission architecture are standard implementation work.
- **Phase 6:** Coolify web-plus-Postgres deployment with Dockerfile and backups is a documented operational path.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core app, runtime, deployment, and database choices are supported by official platform docs and fit the scope cleanly. |
| Features | MEDIUM | User expectations are consistent across market examples, but exact conversion impact of differentiators still needs product validation. |
| Architecture | MEDIUM-HIGH | Monolith + Postgres + server-authoritative scoring is a strong fit; exact scoring-rule structure remains partly product-defined. |
| Pitfalls | HIGH | Privacy, security, localization, and versioning risks are well-supported by OWASP, legal, and test-adaptation sources. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Questionnaire quality:** The research does not validate a specific enneagram item bank. Planning should include a content-adaptation and pilot-testing step before treating scores as production-ready.
- **Scoring methodology:** Wing and direction logic are structurally defined, but exact weighting and ambiguity handling still need explicit product decisions and fixtures.
- **Share-channel specifics:** Kakao and other Korean messaging preview behavior were inferred as important, but need device-level QA once metadata is implemented.
- **Privacy policy alignment:** Logging and analytics schema must be checked against the actual data captured during implementation, not just intended policy.
- **Admin auth scope:** If the admin surface grows beyond simple operational metrics, the initial protection model may need to be upgraded early.

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` — stack recommendation, deployment shape, persistence model
- `.planning/research/ARCHITECTURE.md` — system boundaries, data flow, build order
- `.planning/research/PITFALLS.md` — privacy, security, localization, and versioning risks
- Next.js documentation — App Router, `cookies()`, metadata and OG patterns
- Coolify documentation — Dockerfile/Compose deployment, PostgreSQL setup, backup model
- OWASP cheat sheets — IDOR, authentication, authorization guidance
- Google Search Central and MDN — `noindex` and referrer policy controls
- International Test Commission / WHO guidance — test adaptation and localization process

### Secondary (MEDIUM confidence)
- `.planning/research/FEATURES.md` — market-informed table stakes, differentiators, and anti-features
- SurveyMonkey mobile survey guidance — mobile survey interaction norms
- Truity, Crystal, Enneagram Universe, and mobile app listings — result-depth and sharing expectations in category patterns

### Tertiary (LOW confidence)
- None called out separately; the main uncertainty is not source quality but unresolved product decisions around questionnaire design and scoring calibration.

---
*Research completed: 2026-03-29*
*Ready for roadmap: yes*
