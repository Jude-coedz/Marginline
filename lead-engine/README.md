# MyDigital-Metrics Lead Engine

A **functional, human-approved lead-research and outreach workflow** for MyDigital-Metrics. This project is a separate prototype branch of the earlier Marginline repository and does not change its original live demo.

## What works

- **Discover** public business listings from OpenStreetMap (no API key) or Brave Search (requires `BRAVE_SEARCH_API_KEY`). The former discovers physical retailers and may be a poor fit for Shopify; both sources are explicitly unverified candidates.
- **Import** a batch of company domains manually, deduplicated by canonical hostname.
- **Audit** public homepages server-side; detect Shopify markers, product links, basic capture signals and simple SEO metadata. Every check records source URL and timestamp. Unobserved signals are never claimed as definitive problems.
- **Qualify** leads with a transparent, deterministic scoring model and evidence list.
- **Draft** a contextual first-touch email, revise it in the UI, and copy it. Sending is deliberately manual and approval-based.
- **Track** a local browser pipeline through contacted, replied, meeting and won; export CSV and JSON and reimport JSON.

## Deploy

Vercel supports static HTML plus the single Node serverless handler `api/research.js`. No build command or runtime npm dependencies are required. Deploy the branch `lead-engine-mvp`, or copy these files to a new Vercel project. Configure `BRAVE_SEARCH_API_KEY` if you want web-index discovery. Without that key, manual domain import and OpenStreetMap discovery remain available.

Local static preview: `python3 -m http.server 4173` (UI only; `/api/research` requires `vercel dev` or a deployment). Run `node --test tests/engine.test.cjs` for engine and scanner tests.

## Limits and compliance

- **This is research automation, not an email sender or a guarantee of sales.** It does not fetch private contacts or send messages.
- The browser stores pipeline data in `localStorage`; it is not shared across devices or staff and can be lost when site data is cleared. Use JSON export for backup. Production needs authenticated database and RBAC.
- Shopify markers are indicators, not proof of merchant revenue or willingness to buy.
- Absence of a newsletter form in fetched homepage HTML is **not** proof no lead-capture flow exists; visual verification is required.
- Public data usage must respect source terms and privacy/anti-spam rules, including GDPR/PECR (UK), CAN-SPAM (US) and CASL (Canada) as applicable. Human review is required before outreach.
- Discovery on public Overpass infrastructure is rate-limited by that service. Do not run intensive crawling; use a licensed data provider for production-scale search.
- API restricts scans to one public HTTPS homepage per domain and rejects direct private/localhost addresses; additional network-level egress policies and proper rate limiting are necessary before exposing the scanner broadly.

## Next production steps

1. Test with 10–15 real midmarket prospects; manually review each factual claim.
2. Validate Patricia's ideal customer profile and service offerings before changing scoring weights.
3. Add permitted business data provider, authenticated Postgres/Supabase storage, owner assignment, opt-out tracking and suppression lists.
4. Integrate a consent/compliance-reviewed sending system only after the lead quality and messaging are validated.

## Starter research set

`starter-domains.txt` includes ten public Shopify skincare-store examples referenced in a September 2026 independent roundup. Treat these as **scanner test candidates**, not claims that their teams need services or are qualified leads. The scanner will surface currently observable signals; check any possible opportunity manually.