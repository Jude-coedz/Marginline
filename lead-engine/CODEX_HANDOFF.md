# Codex handoff — MyDigital-Metrics Prospect Automation
Updated 22 October 2026

## User goal (source of truth)
This is intended to become a **sellable prospect sourcing automation for Patricia Tawo's MyDigital-Metrics**, NOT another generic CRM, static demo, lead-import dashboard or portfolio toy. Patricia asked for automation that can **bring sales through lead generation**. The operator should specify an ideal customer profile once and have the system independently research, qualify and surface businesses that could plausibly need the agency's services. Commercial success = relevant, verified prospects and actionable outreach opportunities, not visual vanity counts or guarantees of revenue.

User feedback has been consistent: earlier versions did not actually source worthwhile leads and looked like generic 'AI slop'. Premium visual perception matters independently of the backend. The user is willing to provide additional .md design resources and expects implementation using actual components/assets from listed GitHub repositories, not just advice or inspiration.

## Current repository and deployment
- GitHub repo: https://github.com/Jude-coedz/Marginline
- Working branch: `lead-engine-v3-gemini`
- Application root: `lead-engine/` (Vite, React 18, Framer Motion, Lucide)
- Current Vercel project: `mydigital-lead-engine`
- Branch preview: `https://mydigital-lead-engine-git-lead-engine-v3-gemini-eeakede-9301.vercel.app/`
- **Do not assume that READY means the live search was tested.** Browser access to the protected preview previously returned 403 from Vercel; user must verify visually or configure authorized access.
- The original root Marginline demo is a separate product. Do not change `main`, root site, or production deployment as part of an initial fix.
- Main architecture and setup: `lead-engine/README.md`, `lead-engine/DESIGN.md`, `lead-engine/.env.example`.
- Commands in `lead-engine/`: `npm install`, `npm test`, `npm run build`, `npm run dev`; `vercel dev` for serverless endpoints.
- `GEMINI_API_KEY` and `APP_ACCESS_KEY` are required for a live manual research run. `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are optional for browser testing, required for durable scheduled operation.
- User explicitly does not want Brave Search signup/credit card. Current direction: Gemini 2.5 Flash with `google_search` grounding, careful candidate validation. Gemini is not an exhaustive company registry; check real discovery precision.

## Architecture / current v3 behaviors
1. User chooses business segment and region.
2. Server calls Gemini with Google Search grounding, rejecting ungrounded candidate lists.
3. Validate URLs and public storefronts, deduplicate websites, inspect available public HTML for Shopify/contact/product signals.
4. Separate observed signals, qualification heuristics and unsupported claims. Rank with transparent rationale; never imply a confirmed commercial need.
5. Offer an approval-based personalized outreach draft and export, not automatic unsolicited sending.
6. Manual pilot mode uses browser storage; shared cross-device and unattended daily runs need Supabase + scheduler.
7. Last reported 11 unit tests passing and Vercel build READY; a full live Gemini end-to-end test and visual browser QA are still outstanding.

## The ten GitHub resources the user asked to ACTUALLY integrate
Not all repositories contain installable Codex skills. Classify each by how it can be used; inspect SKILL.md, component dependencies, accessibility, license and examples. Install narrow applicable agent skills under repo-local `.agents/skills/` or within the Codex environment, and integrate real code/components from libraries where appropriate. Avoid bulk-cloning all repos into the application.

### Design / agent skills and systems
1. https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — skill-backed systematic UI/UX design.
2. https://github.com/VoltAgent/awesome-design-md — reference DESIGN.md systems (Linear, Mercury, etc.), NOT a drop-in component library.
3. https://github.com/nexu-io/open-design — broad design skills and tools; select relevant frontend/design-review capabilities only.
4. https://github.com/Leonxlnx/taste-skill — anti-generic design process and app-screen-specific guidance.
5. https://github.com/pbakaus/impeccable — design critique, simplify, polish, visual quality gates.
6. https://github.com/emilkowalski/skills — motion and design engineering.
7. https://github.com/Nutlope/hallmark — anti-AI-slop visual and structural quality checks.
8. https://github.com/greensock/gsap-skills — GSAP integration / performance / React motion techniques.

### Component / effect source libraries
9. https://github.com/DavidHDev/react-bits — use actual selected React components; v3 already has adapted `src/components/SpotlightCard.jsx` and `StatusMark.jsx`. Audit these adaptations and consider integrating further **purposeful** components into run state, lead transition, inspector or discovery visual, not random decoration. Verify MIT license and relevant attribution.
10. https://github.com/DavidHDev/canvas-ui — select meaningful UI animation / effects patterns; v3 `src/components/Reveal.jsx` is an adaptation of its reveal pattern. Investigate whether deeper asset integration serves usability. Do not copy entire gallery/framework into this application.

User also prefers Framer Motion, Webflow-level execution, https://refero.design and strong crafted interfaces (previously named details.so, designspells.com). Refero's connector previously returned NO_SUBSCRIPTION; don't claim its private assets were retrieved unless access becomes available. User may supply more .md design specs.

## Suggested next Codex development task
1. Audit actual v3 UI with screenshots at 375/768/1440 widths and check *why* it is perceived as generic. Do not pretend screenshots or a live search were verified if inaccessible.
2. Review the design repositories' implementation files, not just their README files. Use `SKILL.md` for genuine skills; integrate and run actual, licensed React Bits / Canvas UI components when relevant. If a repo is guidance-only, document how it changed concrete code and layouts instead of claiming it was 'implemented'.
3. Design a differentiated operator journey: **set ICP once → run/schedule research → see real businesses and evidence → approve messages → track responses**. The primary page should foreground the sourced shortlist and live workflow, not empty KPI panels.
4. Make sourcing trustworthy and demonstrable: Gemini-grounded discovery, fallback/error handling, domain verification, duplicate checks, run logs and explanations for rejected leads. Graceful empty states rather than sample leads disguised as real.
5. Add and run end-to-end tests, responsive/browser screenshot review and API contract checks. Record actual output, errors and what requires user secrets or consent.
6. Keep PR review clear: specific files changed, code/components added and their upstream licenses, before/after screenshots, genuine source/test evidence, deployment URL if verified, outstanding limitations.
7. Avoid adding paid search providers or making the user enter payment-card details. Add no external API credentials to source code. If credentials are required, guide entry via environment settings without exposing them.
8. Only promote to a production URL after the user reviews the preview.

## Acceptance checklist
- User can press one button to trigger **real discovery without pasting a list of URLs**.
- Unconfigured API key produces an honest, actionable error; grounded search and validation verified when configured.
- UI prominently shows found/validated/discarded candidates, evidence, and actionable next steps.
- No fabricated leads, sales figures, 'opportunity found' claims or successful emails.
- Production scheduling depends on persistent storage and correctly configured scheduler.
- Visual quality is evaluated with real screenshots, at desktop and phone dimensions. No generic sidebar plus four KPI tiles, meaningless hero gradients, decoration masquerading as state.
- Actual external components/skills demonstrably integrated with original licenses and clean imports.
- All tests/build checks green. Existing root Marginline app remains untouched.
