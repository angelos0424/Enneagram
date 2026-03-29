---
phase: 04
slug: result-interpretation-share-loop
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-29
reviewed_at: 2026-03-29
---

# Phase 04 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated for Phase 04 planning.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | inline SVG only where needed |
| Font | existing app font stack from `src/app/layout.tsx` |

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Inline icon gaps, badge spacing |
| sm | 8px | Compact copy blocks, meta rows |
| md | 16px | Default card padding and element gaps |
| lg | 24px | Section padding and stacked layout gaps |
| xl | 32px | Hero-to-section breaks |
| 2xl | 48px | Major page section separation |
| 3xl | 64px | Top/bottom breathing room on long result pages |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 400 | 1.5 |
| Label | 14px | 600 | 1.4 |
| Heading | 20px | 600 | 1.25 |
| Display | 28px | 600 | 1.15 |

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#fcfbf7` | Page background and large surfaces |
| Secondary (30%) | `#efe6d4` | Cards, panels, supporting blocks |
| Accent (10%) | `#d97706` | Primary CTA, active score highlight, share affordance emphasis |
| Destructive | `#b91c1c` | Only for explicit destructive/reset confirmation copy if needed |

Accent reserved for: top `검사해보기` CTA, primary share action, active/highest score treatment, focus ring accents. Never use accent for every link or every card border.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | 검사해보기 |
| Empty state heading | 결과를 찾을 수 없어요 |
| Empty state body | 링크가 잘못되었거나 더 이상 사용할 수 없어요. 처음부터 검사를 시작해 보세요. |
| Error state | 공유 기능을 완료하지 못했어요. 다시 시도하거나 링크를 직접 복사해 주세요. |
| Destructive confirmation | 새 검사 시작: 현재 진행 중인 응답이 있다면 새 검사로 바뀔 수 있어요. 계속할까요? |

---

## Visual Hierarchy

- Primary focal point: result hero showing the saved primary type title and summary above every other element.
- Secondary focal points: wing/growth/stress summary row and the score distribution card.
- Tertiary elements: explanation cards, disclaimer, recommendation section, share controls.
- On shared result pages, the top `검사해보기` CTA must remain visible before the fold on mobile.

---

## Interaction Contract

- The public result page remains scroll-first; no tabs or hidden panes for core interpretation content.
- Share controls should expose one obvious primary action and one fallback path, not a crowded action bar.
- Recommendation section must include at least one clear next step that leads back into the assessment loop.
- If "start a new assessment" could overwrite or bypass an existing draft, the UI must communicate that the action intentionally starts fresh.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-29
