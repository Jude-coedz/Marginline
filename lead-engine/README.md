# Prospect v3 · MyDigital-Metrics

A **real (human-reviewed) lead-research automation** built around Gemini 2.5 Flash with Google Search grounding. No Brave account or Brave credit card needed. A modern, restrained interface designed for sales operators rather than a generic dashboard.

## Workflow

1. Select industry and target market.
2. Press **Find prospects**. Server invokes Gemini with `google_search` enabled and requires grounding metadata proving Google searched.
3. Candidate *official domains* are deduplicated, DNS-checked, and fetched over HTTPS. Failed sites are not added.
4. Homepage evidence (Shopify technology marker, products, email capture, contact, search metadata) produces a transparent technical-fit score. No assertions about sales intent, revenue, market presence, or confirmed business need.
5. View evidence, edit a first-touch message, approve prospects for contact and export the shortlist. **No automatic outreach.**
6. Results persist in browser storage in pilot mode, or in Supabase when configured. With Supabase plus cron secret, runs repeat daily using the last manual brief.

## Required setup for a first test

Add **only two required server-side environment variables** in Vercel:

```
GEMINI_API_KEY=your_AI_Studio_key
APP_ACCESS_KEY=a_long_random_workspace_password
```

Redeploy and enter your workspace access key in **Settings**. `GEMINI_MODEL=gemini-2.5-flash` is the default; free-tier Google Search grounding for 2.5 Flash is documented by Google, with quota and geographic/account eligibility restrictions. Check the pricing page: https://ai.google.dev/gemini-api/docs/pricing

The Google search key is never placed in client JavaScript. The backend rejects ungrounded AI candidate lists. If a live search fails, the UI tells the operator why; it never replaces it with invented records.

## Optional production persistence and scheduling

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_server_side_service_role_key
CRON_SECRET=a_different_strong_random_secret
```

Run `schema.sql` in Supabase. The database preserves leads across devices; the cron job runs daily at 08:00 UTC. A manual test works **without Supabase**, storing results in this browser. Browser-local data is neither shared nor available to the scheduler. Enabling `CRON_SECRET` without Supabase does not activate daily runs.

## Run and verify

```
npm ci
npm run dev          # frontend + real local Vercel-compatible API handlers
npm test             # offline unit tests for grounded search parsing and workflow
npm run build        # production frontend build
npm run test:browser # desktop/phone workflow and accessibility checks
npm run preview      # built frontend + same local API handlers
vercel dev           # optional Vercel runner
```

## Limitations before selling

- Gemini Google Search is an AI-assisted discovery provider, **not** a conventional searchable business database. Results and citations vary. Candidate domains can be wrong or unavailable. Always inspect `checked`, `failed` and the evidence.
- Public homepages sometimes block bots or hide Shopify markers; absence of a signal does not prove absence of Shopify.
- Search geography is *requested context*, not verified company registration. A .com URL does not establish US presence.
- A website fit score measures observed commerce signals, not buying intent.
- For a real paid service: require proper user login, tenant isolation, row-level security, data minimization, unsubscribe/suppression logic, rate limits, budgets, scheduling and a paid/commercial hosting plan. Vercel Hobby is not suitable for commercial use.
- Sending emails is manual and approval-based. Do not scrape private contact details or send unsolicited mass messaging.

## Stack

React + Vite + Framer Motion + Lucide, Vercel functions, Gemini 2.5 Flash with Google Search grounding, optional Supabase + Vercel cron. Third-party design pattern attribution and visual rules are in `DESIGN.md`.

## Workbench rebuild and preview

The UI now centers the saved brief, shortlist, research provenance and human review. See `DESIGN.md`, `THIRD_PARTY.md` and `QA_REPORT.md`. `npm run dev` serves the app and `/api/*` through `dev/api-plugin.js`, which calls the actual serverless handlers. Ignored `.env.local` is read server-side only; do not prefix secret names with `VITE_`. Restart after changing server variables. Vercel deployments continue to use the original `api/` handlers.

**Keys already configured in Vercel are not automatically available in Codex Cloud. Never add them to GitHub.** Test deployed sourcing on an authenticated Vercel preview, or supply local server bindings securely. Browser tests use labeled synthetic `.test` fixtures; passing them does not prove provider access.

Browser tests expect Chromium at `/usr/bin/chromium` in this cloud image. Override `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for another installation. Run `npx playwright install chromium` on machines without a browser and point the override at the installed binary.

The shadcn MCP configuration is project-local in `.codex/config.toml`. UI UX Pro Max CLI is installed under `/workspace/.local`; use `PATH=/workspace/.local/bin:$PATH` in this cloud machine. Taste, Impeccable, Hallmark and UI UX Pro Max are installed in this project's `.agents/skills/`. Start Codex from `lead-engine/` to load the project configuration. OpenDesign is a separate development tool outside this checkout; it is not a Prospect runtime dependency.

To create a Vercel preview with deployment access, link this directory to the existing `mydigital-lead-engine` project, then run `vercel deploy` without `--prod`. Keep the root Marginline project and production domain untouched. No production deployment was performed during this rebuild.
