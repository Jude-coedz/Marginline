# Prospect — product-specific design contract

## North star
A **calm research workbench** instead of an agency admin dashboard. The information is the work: a targeting brief, live run state, verifiable prospects and a review drawer. Premium means legible, precise, human-scaled, and useful.

## References and decisions
- Taste-skill `references/app-screens.md`: color goes on data not chrome; no dashboard-KPI tile grid; quiet borders, no fake metrics; one-click primary job.
- Hallmark `references/anti-patterns.md`: remove purple gradient hero, three equal feature cards, card-in-card, tinted icon tiles and invented statistics.
- Impeccable `distill.md`: progressive disclosure; a single primary action. Evidence and outreach editing only appear in the prospect drawer.
- Emil Kowalski motion-performance: animate opacity / transform, cap list staggering and respect reduced-motion.
- UI UX Pro Max: deliberate component roles, typography, accessibility, responsive grids.
- VoltAgent DESIGN.md patterns: Linear's information hierarchy and restrained accent, Mercury's less-angular controls. Not a pixel copy of either brand.
- React Bits / GSAP / Canvas UI: audited for expressive effects, but **not installed unnecessarily**. WebGL and decorative backgrounds undermine this high-utility workbench; Framer Motion is used for state changes instead.
- Open Design: clear reference lock, not template cloning.

## Tokens
- Canvas `#f8f8f5`; panel `#e9ede6`; ink `#222820`; muted `#71786e`; border `#dcdfd7`; primary action `#2a5f45`.
- Type: Manrope for headlines and action structure, DM Sans for reading, IBM Plex Mono for process metadata.
- Controls: 7px primary radius, modest optical hierarchy, green exclusively for active actions and verified signals.
- Motion: sheet spring transition, 200–450ms reveals, reduced-motion fallback. No animation on every statistic or constantly moving UI.
- Interaction hierarchy: **Run prospect search** is the primary CTA. Review list is the body. Configuration is a drawer, not the main page.

## Forbidden design tells
- No generic navbar of 6 features, multi-column KPI cards, gradient backgrounds, fake 92% scores, stock art, glassmorphism, glowing orbs, hard-to-read 11px primary UI, or nested decorative cards.
- No microanimations on idle and no motion that delays basic tasks.
- No fabricated testimonials, customer revenue figures or inaccurate AI-made business insights.

## Acceptance criteria
The first screen is usable at 1440px and 390px; the primary action is visible without scrolling on desktop; all setup failures are explanatory; run results represent real backend data and evidence; the user can inspect and edit a message without having to switch to another page.
