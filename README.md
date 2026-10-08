# Marginline

**Cross-workflow commercial preflight for Shopify operations.**

**Live interactive review demo:** https://marginline.vercel.app

Marginline demonstrates a shared pre-action control plane for an AI campaign planner, n8n, Make and Matrixify-style bulk catalog operations. This is a synthetic, read-only product-engineering proof of concept, not a live Shopify integration.

## The 90-second walkthrough

1. Open the [live demo](https://marginline.vercel.app). The original fictional six-action release contains **3 blocked / 2 review / 1 allowed**.
2. Select either glove campaign. Each 20-unit demand individually fits the 36-unit available-to-promise inventory, but the simultaneous total of 40 units exceeds that stock. Marginline spots the **cross-workflow collision**.
3. Select the Matrixify contract refresh. A proposed £26 overwrite of a clinic's negotiated £22 price is blocked.
4. Select the Make campaign to inspect the human-review spending policy, or the oral-care bundle to inspect stale inventory evidence.
5. Select **Generate safe draft**. The demo revises four inputs and re-evaluates the release. All six now clear the sample policy set.
6. In **Policy center**, change the merchant's thresholds. Run again and inspect **Decision history**, where JSON reports can be exported.

## Why it matters

Standard condition checks inside individual automations miss conflicting actions proposed by other tools. This proof of concept evaluates a *release of proposed changes*, including overlap-aware shared SKU stock commitments, wholesale contract protection, approval thresholds, margin floors and snapshot freshness.

## What this repository contains today

- `index.html`: an immediately deployable, dependency-free, responsive and interactive **review edition**, with deterministic browser-side simulation.
- `vercel.json`: static-site Vercel configuration.
- `PRODUCT-VALIDATION.md`: competitive framing and technical constraints.

The more extensive **Next.js implementation** (including API routes, TypeScript and tests) exists separately in the ChatGPT deliverable `Marginline_Enhanced_Preflight_Source.zip` and has **not yet been merged into this GitHub repository**. The static edition exists specifically to give the recipient a low-friction clickable experience.

## Scope boundaries

- All merchant data is fictional. No real prices, customers or Shopify connections.
- This product does not perform writes. An `allow` result is an evaluation, not a commercial transaction approval.
- A production solution would require authenticated connectors, authoritative data, transactional inventory reservations, live cost data, persistent audit records, role-based approvals and an idempotent execution gate.
- We cannot claim that a particular agency has not already implemented similar controls.

Built as a practical product-engineering demonstration.
