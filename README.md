# Marginline

Commercial preflight for cross-workflow Shopify operations.

This repository has been initialized. The application source has been prepared and tested locally, but the full source has **not yet been published to this repository** due to the execution environment's GitHub network restrictions.

## Why this idea evolved
Shopify Flow already supports condition checks, Shopify offers margin guardrails, and Matrixify offers import dry runs. Marginline's differentiator is evaluating a planned **batch of proposed actions from independent automations** as one commercial release.

Two campaigns can each pass an individual stock check while collectively exceeding inventory. The prototype also evaluates wholesale contract pricing, spend approvals, input freshness, duplicate action IDs and overlapping release windows.

The complete Next.js source archive is available in the accompanying ChatGPT conversation. It is not live on Vercel and does not modify Shopify.

## Build after source files are uploaded
```bash
npm install
npm test
npm run typecheck
npm run build
```

A Git-linked Vercel project should use the Next.js preset. No AI key is required for the synthetic demonstration.

See [PRODUCT-VALIDATION.md](PRODUCT-VALIDATION.md) for the competitive analysis and product boundaries.
