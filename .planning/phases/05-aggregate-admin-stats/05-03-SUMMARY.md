---
phase: 05-aggregate-admin-stats
plan: 03
subsystem: admin-stats-read-model
tags: [drizzle, privacy, aggregation, vitest]
provides:
  - aggregate admin stats repository
  - centralized small-cell suppression contract
  - dashboard-ready DTOs for daily metrics and distributions
completed: 2026-03-29
---

# Phase 05 Plan 03 Summary

- Added admin-stats domain types, suppression helpers, and the server-facing view-model boundary.
- Implemented the aggregate repository for daily starts, completions, restart clicks, primary types, and wing distributions.
- Applied the privacy rule centrally: buckets under `5` are hidden, and exact totals disappear whenever hidden buckets exist.
- Added repository tests for Asia/Seoul day bucketing and hidden-total semantics.
