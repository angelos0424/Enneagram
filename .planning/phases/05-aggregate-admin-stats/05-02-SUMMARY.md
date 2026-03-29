---
phase: 05-aggregate-admin-stats
plan: 02
subsystem: admin-stats-events
tags: [drizzle, analytics, nextjs, playwright]
provides:
  - append-only admin stats event table
  - brand-new draft start instrumentation
  - dedicated shared-result restart instrumentation
completed: 2026-03-29
---

# Phase 05 Plan 02 Summary

- Added the `admin_stats_events` schema plus checked-in Drizzle migration artifacts.
- Recorded `assessment_started` only when `POST /api/assessment-session` creates a new draft.
- Added `DELETE /api/admin-stats/restart` so shared-result restart clicks are counted through a dedicated boundary.
- Updated the public-result restart CTA and browser coverage to follow the new route.
