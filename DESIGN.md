# Marginline · DESIGN.md

## Purpose
A *client-facing product demonstration* of cross-workflow commercial preflight. It is not an operations dashboard, not a monitoring console, and not a data-rich admin app.

## Reference lock
- **Primary interaction model:** the guided causality of Journey Watchdog. One visible causal chain, progressive manual reveal, no autoplay.
- **Primary visual model:** Linear's calm, quiet structure and restrained detail; see https://linear.app/now/behind-the-latest-design-refresh
- **Editorial composition:** Attio's spacious product storytelling and confident typography; see https://attio.com
- **Anti-pattern screening:** pbakaus/impeccable and VoltAgent/awesome-design-md; see https://github.com/pbakaus/impeccable and https://github.com/voltagent/awesome-design-md
- **Microinteraction basis:** Motion's state-to-motion principles, implemented with native Web Animations for a dependency-free review build; see https://motion.dev/docs/react-animation
- **User's operating system:** MASTER_SAAS_PRODUCT_BUILD_SYSTEM.md (shared in conversation on 2026-10-08)

Refero research was attempted but the account returned NO_SUBSCRIPTION; no claim is made to have consulted its private screen library.

## Art direction
**Personality:** confident, editorial, precise, tactful, trustworthy.

**Visual thesis:** a tiny operating system for preventing one bad commercial decision. The dark instrument is the hero; the surrounding warm paper reduces interference.

**Primary composition:** restrained editorial introduction → single immersive three-part causal instrument (automation proposals → common stock → pre-execution verdict) → direct adjustment → clear rationale → integration boundary.

**Typography:** DM Sans for UI/functional body. Instrument Serif reserved for two short editorial emphases. Body text predominantly >=13–15px; tiny uppercase reserved for instrumentation, never essential instructions.

**Palette:** warm paper (#f7f7f3), graphite/forest (#191f1c), soft chartreuse (#d6e6a7), muted brick (#f1a392) only for harmful outcome, functional green on validated outcome. Avoid gradients except near-invisible stage depth and never use gratuitous purple glow.

**Surfaces:** one substantial dark canvas, tight meaningful input nodes inside it. No sidebars, metric-card grid, or nested dashboards.

**Motion:** short state transitions from proposed actions to combined interpretation, animated connection paths that visualize causality, stock fill driven by computation. Browser-native WAAPI + CSS with reduced-motion fallback. No fake processing time, no autoplay, no decorative animation loop.

**Responsive:** at 1366px source and inventory remain in a horizontal causal chain; on mobile stack source → shared reality → consequence rather than shrinking the desktop interface.

## What we removed
- Sidebar navigation
- Six-item result table
- Four dashboard metric cards
- Repetitive management panels
- Generic 'AI says ...' marketing phrases

## Signature demo
1. Two proposals each demand 20 units.
2. Both individually pass against 36 available.
3. Together they promise 40 units; release held, shortage 4.
4. Reviewer reduces second demand to <=16 and sees the release clear.
5. Report export contains actual recomputed values and clearly states no external execution.

## Anti-slop / QA questions
- Can the viewer explain the problem after the second click?
- Does the illustration visually show both paths converging on one stock constraint?
- Is there only one primary action at any moment?
- Does every button have an honest effect?
- At mobile widths, does the story preserve cause → shared state → effect?
- Does the interface distinguish preflight clearance from a Shopify write?
