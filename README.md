# Marginline

**A shared commercial preflight for automations that make independently reasonable but collectively unsafe decisions.**

**[Explore the working demo](https://marginline.vercel.app)**

This is a focused concept designed to show how product thinking and implementation can complement MyDigital-Metrics' Shopify commerce automations. It is an independent demonstration, not a client system or a claim that the agency lacks comparable controls.

## The demo

Two different workflows plan promotions for the same SKU.

- AI campaign planner forecasts **20 units**.
- n8n retargeting forecasts **20 units**.
- The fictional merchant has **36 units available to promise**.

Each workflow passes alone. When Marginline evaluates their overlapping demand as **one release**, the shared allocation reaches **40 units**, so the release is held before any external write.

The viewer can lower retargeting demand to **16 or fewer** and immediately see the preflight result change. The exported JSON decision record contains the actual recomputed figures and explicitly describes the outstanding approval/execution boundary.

## User journey

1. Start the interactive walkthrough, including from the above-fold hero link.
2. Check both proposals individually.
3. Combine the proposals into a shared-inventory preflight.
4. Adjust the second plan and inspect the changed verdict.
5. Export a machine-readable preflight record, or restart.

One page, one problem, one causal flow. No generic analytics dashboard, AI chat theater or fake operational connector.

## What it proves

- The independently valid actions can produce a failure at the level of a shared merchant invariant.
- The underlying decision is computed deterministically.
- A proposed correction changes the decision and the export.
- A product can be explained with one visually guided scenario rather than a large management console.

## Scope

This is a **synthetic, read-only browser demonstration**. Shopify, Matrixify, n8n and Make are not connected; no inventory is reserved, Shopify products are not edited and no campaigns are published.

A real product must use authenticated connectors, authoritative inventory and contracts, fresh costs, reservation semantics/locking, idempotent execution gates and human approval workflows.

The core collision shown here concerns shared inventory. Margin, wholesale-contract and approval rules are additional potential capabilities, not implemented in this focused review edition.

## Repository map

- `index.html` — single-page demonstration and accessible semantic structure.
- `styles.css` — responsive editorial design language and state-aware visual system.
- `demo.js` — guided stage model, deterministic policy evaluation, live remediation and JSON export.
- `tests/demo.test.cjs` — dependency-free interaction tests.
- `DESIGN.md` — sources and project-specific art-direction lock.
- `PRODUCT.md` — intended user job, assumptions, constraints and success criteria.
- `.github/workflows/verify.yml` — syntax and interaction smoke tests.
- `.github/workflows/visual-review.yml` — real Chromium/Playwright desktop/mobile captures and end-to-end verification.

## Local preview

```bash
python3 -m http.server 4173
# open http://localhost:4173
node --check demo.js
node --test tests/demo.test.cjs
```

No npm install or third-party runtime JavaScript libraries are required. Motion is implemented with browser-native Web Animations and CSS transitions, using `prefers-reduced-motion` as a fallback. Display/body fonts use Google Fonts with local fallbacks.

A more extensive, separate Next.js technical prototype was previously prepared, but **has not been merged**; the live Git repository intentionally contains the simpler, higher-clarity client review edition.

[Design reference / thinking](DESIGN.md) · [Product model](PRODUCT.md) · [Competitive boundaries](PRODUCT-VALIDATION.md)
