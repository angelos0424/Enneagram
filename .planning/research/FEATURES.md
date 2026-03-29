# Feature Landscape

**Domain:** Mobile-first enneagram assessment web app
**Project:** Anonymous Korean enneagram test with detailed results and shareable links
**Researched:** 2026-03-29
**Overall confidence:** MEDIUM

## Executive Summary

For this category, users expect to enter without friction, complete a reasonably short mobile-friendly assessment, and receive a result page that feels more specific than a single type label. A bare "you are Type 4" output is not competitive. The ecosystem norm is a richer interpretation layer: dominant type, nearby scores, wing, stress/growth direction, and readable explanation blocks.

For this project's stated scope, the real MVP is not "take test" alone. The minimum viable loop is: anonymous entry -> guided test -> detailed result -> permanent share link -> recipient can immediately retake. That loop matches both user expectation and the project's viral/recommendation intent.

What differentiates products in this space is usually not the test form itself. Differentiation shows up after results: personalized next-step guidance, practical recommendations, cleaner result storytelling, and lightweight share mechanics that make users want to send their result. Heavy community, login, coaching, journaling, and compatibility graphs exist in the market, but they are not needed for this MVP and would slow delivery.

## Table Stakes

Features users expect in this category. Missing these makes the product feel incomplete or low-trust.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Anonymous start, no signup | Personality tests convert best when users can start immediately | Low | Must be obvious on first screen; aligns with project scope |
| Mobile-first question flow | Most discovery and completion will happen on phones | Medium | Large tap targets, sticky progress/action area, fast page loads |
| Clear progress indicator | Long assessments feel risky without completion visibility | Low | Percentage or step count reduces drop-off |
| Single-question or short-batch answering | Modern assessment UX favors focused, thumb-friendly flows | Medium | Better on mobile than dense matrix forms |
| Resume-safe flow during a session | Mobile users get interrupted; accidental refreshes happen | Medium | Local persistence during the active session is enough for MVP |
| Credible result summary | Users expect a clear "main type" answer immediately | Low | Main type must appear above the fold on result page |
| Detailed result breakdown | Competing products rarely stop at one label | Medium | Include main type, score distribution, likely wing, stress/growth direction |
| Readable explanation cards | Users expect interpretation, not raw numbers | Medium | Strengths, blind spots, motivations, relationship/work style are standard content blocks |
| Shareable result link | Sharing is a core behavior for personality products | Medium | Permanent URL is a project requirement, not a nice-to-have |
| Retake CTA on shared result page | Shared results work best when recipients can try instantly | Low | Must be persistent and visible near the top |
| Basic trust/explanation copy | Users need to understand what the result means and how to read it | Low | Brief "how to interpret your scores" section prevents confusion |
| Result persistence by link | Shared content must remain stable over time | Medium | Required to support permanent sharing |

## Differentiators

Features that create competitive advantage, but are not required to validate the MVP.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Personalized recommendation flow after results | Converts curiosity into action; strongest fit for this product direction | Medium | Recommend next reads, adjacent types to compare, or growth suggestions based on scores |
| "Why this result?" explanation | Builds trust by showing how the result was derived | Medium | Explain top scoring patterns and close runner-up types without exposing overly technical scoring internals |
| Share-optimized result cards/images | Improves viral spread beyond plain URL sharing | Medium | Useful after core link sharing works; especially relevant for Kakao/social channels |
| Compare with adjacent types | Helps users who doubt a single result and reduces "this feels wrong" drop-off | Medium | Best when top 2-3 scores are close |
| Action-oriented growth suggestions | Makes the result feel useful rather than purely descriptive | Medium | Tie suggestions to stress/growth direction and dominant type |
| Recommendation branching by certainty | Better UX for ambiguous scores | Medium | High-confidence results get direct guidance; low-confidence results get compare/retake guidance |
| Lightweight retest or refinement flow | Lets uncertain users improve confidence without redoing everything | High | Could be a follow-up mini-question set for close scores |
| Result page tuned for social recipients | Improves share-to-retake conversion | Low | Strong headline, short description, visible "take the test" CTA, preview-friendly metadata |
| Admin analytics for funnel + type distribution | Helps operators improve completion and content performance | Medium | Relevant because project scope includes stats; not user-facing, but strategically useful |

## Anti-Features

Features to deliberately avoid in the MVP.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Account system and profiles | Adds friction and infrastructure before proving demand | Keep all flows anonymous and keyed by shareable result IDs |
| Social network / friend graph | High complexity, low validation value early | Use simple link sharing and recipient retake loop |
| In-app chat, coaching, or expert marketplace | Expands product category from assessment to service business | Focus on strong result interpretation and recommendations |
| Daily journaling / habit tracking | Ongoing engagement system is a separate product layer | Offer static growth suggestions first |
| Deep compatibility engine | Requires significant content and model surface area | Start with single-user results plus optional adjacent-type comparisons |
| Custom avatar builder / cosmetic personalization | Does not improve core assessment value | Invest in clear result storytelling and mobile UX |
| Overly long theory encyclopedia | Content-heavy and easy to defer | Keep concise explanation cards with optional "learn more later" hooks |
| Forced payment wall before core result | Breaks trust and completion for an unknown product | Deliver full core result for free; monetize later only if needed |
| Precision theater in scoring | Users misread false certainty as scientific accuracy | Show relative scores and confidence-oriented language |

## Feature Dependencies

Core dependencies for requirements and phase planning:

```text
Anonymous start -> mobile question flow -> progress indicator -> test completion -> result calculation

Result calculation -> main type summary
Result calculation -> score distribution
Score distribution -> likely wing
Main type summary + score distribution -> explanation cards
Main type summary + score distribution -> recommendation flow

Result persistence -> permanent result URL
Permanent result URL -> result sharing
Permanent result URL -> shared result page
Shared result page -> top-of-page retake CTA

Result calculation + event tracking -> admin analytics
```

## MVP Recommendation

Prioritize these first:

1. Anonymous mobile test flow with progress visibility
2. Detailed result page with main type, wing, score distribution, stress/growth direction, and explanation cards
3. Permanent shareable result links with a strong retake CTA on shared pages
4. Lightweight recommendation flow immediately below the result

Defer these until after validation:

- Share image generation: useful for growth, but plain URL sharing is enough to validate behavior
- Adjacent-type comparison mode: valuable when confidence is low, but not required for the first release
- Retest/refinement flow: useful only after observing real ambiguity/drop-off patterns
- Rich analytics dashboards: start with essential funnel/type metrics only

## Requirement Framing For Downstream Planning

Translate this feature set into requirements with these product rules:

| Requirement Area | Recommendation |
|------------------|----------------|
| Entry | User can start the test immediately without login |
| Assessment UX | User can answer comfortably on mobile and understand remaining progress |
| Result trust | Result page explains both the conclusion and the supporting score shape |
| Result richness | Result includes more than a single enneagram number |
| Sharing | Every completed result can be revisited by stable link |
| Virality | Shared page must invite the recipient to take the same test |
| Recommendation | Result page should answer "what should I do next?" without requiring another feature set |

## Sources

- Truity Enneagram test ecosystem pages and product positioning: https://www.truity.com/test/enneagram-personality-test
- Crystal Knows enneagram type and relationship content structure: https://www.crystalknows.com/enneagram
- Enneagram Universe result and invite patterns: https://enneagramuniverse.com/enneagram/test/complete-enneagram-test/
- 16Personalities mobile app positioning for modern personality-test expectations: https://play.google.com/store/apps/details?hl=en_US&id=com.neris.sixteenpersonalities
- Enneagram Personality Test mobile app listing for mobile assessment norms: https://play.google.com/store/apps/details?id=com.cct.enneagram

## Confidence Notes

- **Table stakes:** MEDIUM confidence. Strong pattern agreement across major enneagram/personality products, but consumer product pages do not always expose exact conversion-critical UX decisions.
- **Differentiators:** MEDIUM confidence. Market pattern is clear, but exact commercial impact varies by audience and distribution channel.
- **Anti-features:** HIGH confidence for this project context. These follow directly from the greenfield scope, anonymous-first constraint, and desire to validate the core share loop quickly.
