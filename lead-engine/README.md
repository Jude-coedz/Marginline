# Prospect · MyDigital-Metrics

**Prospect** is a small, client-facing discovery automation, deliberately not another CRM dashboard. It finds businesses through a live search provider, validates publicly observable commerce signals, ranks evidence and puts the results in a reviewable shortlist. It runs on demand or daily without manual website entry. It **does not automatically email people** or claim that detecting Shopify equals sales readiness.

## What changed from the previous demo

- Replaced the OpenStreetMap default (unsuitable for national Shopify prospecting) with actual web-wide search via the Brave Search API.
- Added a scheduled discovery worker, two web queries per run, canonical-domain dedupe, bounded parallel homepage audits, database persistence, and run audit logs.
- Removed the generic multi-page dashboard, fake decorative stats and imported example leads. The interface is one path: **search brief → run → shortlist → human-approved outreach**.
- Added a repeatable daily schedule. The most recent **manual run** saves the targeting brief; the scheduler uses that brief.
- Added protected endpoints and a connection-status page that clearly says when a service is missing.
- Added research limitations and provenance links. Scores represent website signals, not buying intent.

## Stack

Vite + React + Framer Motion + Lucide; Vercel Node.js Functions; Brave Search API; Supabase Postgres REST.

## Setup: 4 necessary credentials

1. **Brave Search API**: create an API key at https://api-dashboard.search.brave.com/ . Configure `BRAVE_SEARCH_API_KEY` in Vercel. The pricing page may require card verification; check current usage and pricing before selling the service.
2. **Supabase**: create a new project at https://supabase.com and run [`schema.sql`](./schema.sql) in SQL Editor. Set `SUPABASE_URL` and server-only `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Do **not** use the anon key here. The app's client never sees the service role key.
3. **Workspace access**: set a strong `APP_ACCESS_KEY` in Vercel. Enter the code once in the app's Configuration drawer. This is a single-user pilot mechanism, **not a production multi-tenant authentication system**.
4. **Scheduler**: set a strong `CRON_SECRET` in Vercel. Vercel invokes `GET /api/run` daily at 08:00 UTC with `Authorization: Bearer <CRON_SECRET>`. The app checks this before running. Hobby scheduling timing may be imprecise. The last manual run's sector and region are used as the daily defaults.

Then redeploy **the new `lead-engine-v2` branch** with the Vercel project's **root directory set to `lead-engine`**, framework Vite. Runtime secrets are only read by API functions. `/api/status` exposes availability flags, never secret values.

If credentials are missing, the app will not fabricate results. It displays setup guidance and descriptive errors.

### Environment variables

```
BRAVE_SEARCH_API_KEY=...
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
APP_ACCESS_KEY=...
CRON_SECRET=...
```

An AI API key is **not needed** for discovery. `GEMINI_API_KEY` is optional/reserved; this version relies on inspectable rules and editable templates. The interface will show it as optional, not a running feature.

### Start and tests

```
npm install
npm run dev         # Vite interface only; APIs require Vercel
npm test            # deterministic scanner, scoring and auth tests
vercel dev          # complete local API workflow (requires env vars)
```

## Actual workflow

1. Select a sector and target search market; click **Run prospect search**.
2. The server issues two web-index searches, retrieves up to 16 unique candidate business domains, audits their public HTML and stores observable evidence and qualification score.
3. Search results are deduplicated across runs by domain. Existing pipeline stages survive rescans.
4. Results show where signals were observed. A detected Shopify marker is **not** evidence of sales growth opportunity, company location or unmet needs.
5. The seller reviews sources, edits the outreach starter, chooses a pipeline stage and contacts prospects manually in their chosen compliant channel.
6. A scheduled Vercel job repeats that same brief daily and records outcome counts. It does not send mail.

## Commercial limitations and next iteration

- Website scanners sometimes encounter bot protection and redirect rules. Failed scans are logged; a storefront is not claimed to be Shopify when it cannot be verified.
- A search snippet or `.com` domain does not prove a company operates in the selected country. Target geography is **search context** and must be verified before outreach.
- The browser-held access code, server-only service-role database access, and daily cron are suitable for a limited **pilot**, not a resale-grade multi-tenant product. Before selling as a hosted service, add Supabase Auth/SSO, tenant-scoped row security, team roles, proper job queue and retries, strong rate limiting, provider usage budgets, tenant-specific schedules, and opt-out/suppression handling.
- Respect source terms, privacy laws, anti-spam rules and site access restrictions. Automated bulk emailing is intentionally disabled.
- **Vercel Hobby is personal/non-commercial only.** Use a commercial plan/provider for paid service deployment.
- Automated tests verify offline logic; actual end-to-end discovery **requires** configured Brave and Supabase credentials and a live test run. Do not report the source as production-ready until this is done.

## Design system

[`DESIGN.md`](./DESIGN.md) documents the reference-informed visual system: flat editorial workbench, typographic hierarchy, purposeful Framer Motion and no fictional performance metrics. Reference sources used include taste-skill app-screens, Hallmark's anti-pattern checks, Impeccable's distill rules, Emil Kowalski's motion-performance guidelines, UI UX Pro Max and the Linear / Mercury system analyses. The user-provided future design Markdown files should supersede these defaults.
