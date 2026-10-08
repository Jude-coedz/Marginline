# Marginline · PRODUCT.md

## User and context
A founder or builder at a Shopify/commerce automation agency evaluating whether the author can design and implement useful extensions around their real client workflows. The reader arrives cold, with no intention to learn a new admin product and only a short amount of time.

## Job to be done
Show, rather than assert, that independently valid automation actions can conflict at the level of a shared merchant constraint; make the repair understandable and interactive.

## Core truth
Two overlapping promotions on the same fictional Shopify SKU each forecast 20 units; only 36 units are available to promise. They each pass if compared alone. In aggregate they consume 40 units, so a combined preflight must hold the release. Reducing one forecast to 16 or fewer fits the shared capacity.

## Non-goals
- No actual Shopify connection or checkout behavior.
- No inventory reservation/transactional enforcement.
- No actual AI model calls (not needed for deterministic stock checks).
- No production-grade access control, real merchant pricing or real agency data.
- No claim that MyDigital-Metrics lacks a similar system.

## Walkthrough, not dashboard
**Trigger:** two proposals exist.
**Individual checks:** both pass.
**Conflict revealed:** combined commitment exceeds common availability.
**Correction:** user adjusts retargeting demand with live recomputation.
**Completion:** explain the evaluated result and export evidence.
**Integration boundary:** existing workflow → shared preflight → calling workflow handles release, approvals and stock reservations.

## Assumptions and limitations
Both workflows are deliberately configured in the demo for the same SKU and overlapping schedule. Real production integration must obtain authoritative, fresh merchant state and perform atomic inventory holds to prevent race conditions. An ALLOW is only the preflight opinion, not an authorization to execute.

## Success criteria
- A first-time viewer understands the problem without reading a PRD.
- Primary demonstration achievable in 4 interactions or fewer.
- Changing the amount changes the actual verdict and exported numbers.
- The demo is understandable on 1366×768 and on mobile.
- Keyboard and reduced-motion operation remain possible.
