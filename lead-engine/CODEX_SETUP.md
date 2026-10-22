# Codex quickstart — Prospect v3

## Open the correct source
Repository: https://github.com/Jude-coedz/Marginline
Branch: `lead-engine-v3-gemini`
App directory: `lead-engine/`

Codex Cloud: create an environment containing this repo, allow network access to GitHub and package registries during setup, and choose/check out the branch above before editing. Cloud skills in the repo under `.agents/skills/` are available to Codex. You can also use the Codex desktop app, CLI or IDE extension against a local checkout.

Locally (Codex CLI), after cloning:
```bash
git checkout lead-engine-v3-gemini
cd lead-engine
npm install
npm test
npm run build
codex
```

## Verified skill installation patterns
These commands are for an authorized local Codex environment or a Codex Cloud setup with permitted network access. Review upstream skill instructions and trust boundary before installing third-party code.

```bash
# UI UX Pro Max documents its Codex installer:
npx ui-ux-pro-max-cli init --ai codex

# Taste Skill documents a focused skills installer:
npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend -a codex
```

Other skill repositories to inspect and selectively install when a relevant `SKILL.md` exists:
- https://github.com/pbakaus/impeccable
- https://github.com/Nutlope/hallmark
- https://github.com/emilkowalski/skills
- https://github.com/greensock/gsap-skills
- https://github.com/nexu-io/open-design

These are **NOT** agent skills to bulk-install as such:
- https://github.com/DavidHDev/react-bits — React component/effects source; copy/install selected components into the app with declared dependencies and notices.
- https://github.com/DavidHDev/canvas-ui — implementation examples/assets; integrate selected compatible components.
- https://github.com/VoltAgent/awesome-design-md — design-system reference collection; consult select DESIGN.md files.

Third-party skill installation may change `.agents/skills/`, inject instructions or execute scripts. Audit the upstream files and use reviewed versions; don't grant an untrusted skill access to environment secrets. Use a feature branch/PR.

## Good first Codex task
Read `AGENTS.md` and `lead-engine/CODEX_HANDOFF.md`. Review the running app and the ten linked design repositories. First, do an implementation and visual audit of the current React interface, grounded in real desktop and mobile screenshots. Install applicable project skills rather than merely referring to them; integrate concrete compatible React Bits and Canvas UI components with package dependencies and license notes, then rebuild into a distinctive operator workflow. Preserve the working Gemini `google_search` backend and test real sourcing with appropriately configured API credentials. Don't fabricate lead results and don't deploy to production. Show the code diff, real QA screenshots, test results and a preview.

## Credentials and commercial readiness
- Set `GEMINI_API_KEY` and `APP_ACCESS_KEY` in server environment only; NEVER commit them.
- Supabase and cron secrets are optional for manual pilot testing but required for shared/scheduled operation.
- Sourcing != guaranteed sales. Qualification must link to observable evidence. Outreach requires human approval.
- For the current build/test workflow, execute `npm test` and `npm run build` in `lead-engine/`. Use `vercel dev` for local serverless API checks.
