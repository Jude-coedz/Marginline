# Prospect rebuild validation — 22 October 2026

## What was actually exercised

- `npm ci --cache /workspace/.npm-cache`: clean installation from the new lockfile succeeded.
- `npm test`: **21 passed**, 0 failed, 0 skipped. Includes Gemini Google Search request/grounding contracts, no-grounding/quota/truncation failures, domain canonicalization, public-address checks and pinned DNS lookup, HTML byte cap, scoring, manual/persisted workflow outcomes, persistence failure, auth/method/JSON handling, CSV formula escaping, draft-preserving deduplication, and scheduled deadline propagation. Provider/database tests use test doubles.
- `npm run build`: production Vite build succeeded.
- `npm run test:browser`: **11 passed**, 0 failed, **1 intentionally skipped**. Desktop and 375px phone test discovery, evidence/source review, draft edit/save, approval, duplicate retention, filters/search, CSV download, persistence across reload, failed runs, incorrect access key, keyboard tabs and dialog focus restoration. The skipped desktop case is a phone-only brief interaction.
- Axe WCAG A/AA checks on the empty workspace and populated inspector returned no violations in both browser projects. This is scoped automation, not a full accessibility certification.
- Screenshots at 320, 375, 768, 1024, 1440 and 1920px showed no horizontal document overflow. Desktop, tablet, phone, populated fixture and inspector captures were inspected. Inspector uses separate top/action viewport captures; full-page composites behind a native dialog were replaced.
- `npm run preview -- --host 0.0.0.0 --port 4175 --strictPort`: built application rendered and opened Connections; its real local `/api/status` responds. Live processes are not durable environment configuration.
- Root application remained unchanged. `node --test tests/demo.test.cjs` at the repository root: **7 passed**.
- Shadcn MCP initialization and tool listing succeeded. UI UX Pro Max 2.15.0 is installed globally in `/workspace/.local`, with Codex skills initialized in this project. Taste, Impeccable and Hallmark are installed and applied; see THIRD_PARTY.md.
- OpenDesign frozen install and tool builds succeeded. `pnpm tools-dev run web` started its separate web/daemon processes; the web request returned HTTP 200. Optional CUDA and Electron downloads were omitted for its web workflow using documented flags.

## Fixes from code and screenshot review

Persisted-run errors now survive history refresh. Phone brief collapses to put results earlier. Manual and scheduled settings/discovery/database work inherit a shared 53-second deadline, with a separate bounded failure-record cleanup. Shopify totals derive from accepted records. Failed persistence is not reported as successful discovery. Inspector inputs cannot change during an asynchronous save, unsaved edits require an explicit discard, and focus returns to the originating row. Public website connections use a validated pinned DNS result with normal TLS verification; reserved address ranges, credentialed URLs, custom ports and cross-domain redirects are rejected.

All seven material findings from the independent review were addressed at that review's scope. This does not establish commercial production readiness or eliminate all application risk.

## Evidence and preview

Review board: `/workspace/artifacts/prospect/preview.html`.

- `after/desktop-built-preview.png`, `after/tablet-built-preview.png`, `after/mobile-built-preview.png`: built frontend with the **real unconfigured local backend**.
- `before/375.png`, `before/768.png`, `before/1440.png`: original interface.
- `after/*-synthetic-results.png`, `*-synthetic-failure.png`, `*-synthetic-inspector.png`, `*-synthetic-inspector-actions.png`: **synthetic automated QA only**, not real discovered prospects.
- Playwright HTML report: `/workspace/artifacts/prospect/playwright-report/index.html`.

## Not verified / external requirements

**No live Gemini sourcing run was performed.** This cloud machine has neither GEMINI_API_KEY nor APP_ACCESS_KEY injected. The user reports that those keys exist in Vercel; they should remain there and out of GitHub. This machine has no detected Vercel CLI authentication. The existing preview request failed at the network proxy with CONNECT 403, before an application response. That is not evidence of a bad Gemini key or a Vercel application failure.

The cloud configuration draft now includes additive access for `generativelanguage.googleapis.com` and the existing branch-preview hostname, plus tested installation/startup instructions. Draft saving does not apply runtime access or publish a deployment. The user must review/save and publish cloud-environment changes to activate them. Arbitrary prospect domains still require suitable deployment egress; the two domain additions alone do not enable all live website audits in a restricted cloud machine.

No production deployment or public preview deployment was performed. This work is on local branch `lead-engine-v3-gemini`, with changes available for review. Vercel preview deployment requires authenticated access to the existing `mydigital-lead-engine` project. Test one authenticated run there, retain the grounding/source and candidate-decision output, then assess actual precision. Supabase persistence and cron were tested with doubles, not a live database or scheduler. No email was sent.

Remaining commercial limitations include the existing shared-key/pilot auth model, lack of tenant isolation and budget/rate controls, heuristic scoring, and human confirmation of business category, location, ownership and actual need. This rebuild does not assert that website signals establish buying intent.

## Vercel access and provider follow-up — 23 October 2026

Vercel CLI authorization completed. The dedicated `mydigital-lead-engine` project's login protection was disabled as requested so its site is publicly viewable; research endpoints still require APP_ACCESS_KEY. Existing sensitive keys were preserved and their scope extended from Production to Production + Preview. Public page and status requests return HTTP 200; an unauthenticated research request returns HTTP 401.

A real provider check using the existing server binding returned HTTP 404 for gemini-2.5-flash: Google explicitly says it is unavailable to new users and recommends gemini-3.8-flash. The source default and GEMINI_MODEL setting now use that recommended model. Additional real checks of gemini-flash-latest and gemini-3.1-flash-lite returned HTTP 429 RESOURCE_EXHAUSTED. No billing changes were made. A configured deployment must not be described as successful live sourcing while Google rejects its quota. The error message now identifies the quota/billing recovery action instead of implying a smaller run will necessarily fix it.

## Workspace refinement — 23 October 2026

This section supersedes the earlier layout and access notes above. The public preview is accessible, Vercel authentication is available, and real provider requests were attempted. A full discovery request against gemini-3.8-flash returned HTTP 429 RESOURCE_EXHAUSTED; there are no real sourced leads to report.

The main workspace now has a horizontal research toolbar with Find prospects on the right. The configuration checklist moved to a settings dialog, provider badges were removed from the header, and Lock workspace moved into the account menu. Actual Canvas UI button/input/select components and Base UI menu/dialog primitives replace native-looking controls. Unused Manrope fonts and obsolete layout/decorative styles were removed. Unsaved edits use an accessible confirmation instead of a browser confirm box.

Validation: `npm test` **23 passed**; `npm run test:browser` **18 passed**, zero skipped; `npm run build` succeeded. Browser checks cover keyboard select menus, action placement, account menu locking, settings focus/accessibility, unsaved edit cancellation/discard, discovery/review/export workflows using explicitly synthetic fixtures, and protected storage verification. Axe checks on tested empty, settings and inspector states returned no violations. These tests do not establish successful live Gemini sourcing or live database persistence.

Fresh screenshots at 320, 375, 768, 1024, 1440 and 1920px have no horizontal document overflow; both research selectors remain 44px high. `after/{width}-final.png` records the empty real local backend. `after/{375,1440}-settings-final.png` records settings. Desktop and mobile captures were visually inspected.

The new protected GET `/api/storage` reads each required Supabase table and distinguishes missing bindings, inaccessible schema and verified read access. No credential values are returned. Unit and browser checks use doubles. No Supabase project or credentials are available in the Vercel project yet, so shared storage and daily automation are still unverified and unconnected. Applying schema.sql and validating real write/read persistence remain necessary after the user connects their project. No outreach was sent; the separate root Marginline application is unchanged.

Independent refinement review found a stale shared-storage refresh could repopulate rows after locking. Access generations now ignore late refresh, verification and review-save responses; shared records also require an active access key to render. The added desktop/mobile regression waits for the delayed response after lock. Missing server protection now has an inline explanation beside Unlock instead of requiring expanded technical details.
