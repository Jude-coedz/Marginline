# Codex instructions — Marginline repository

The current product being developed is **Prospect v3**, a prospect-sourcing automation for MyDigital-Metrics, in `lead-engine/`. The root of this repository also contains an older, separate Marginline demo. **Do not overwrite, delete, or deploy over the root Marginline application.**

When working in `lead-engine/`, read `lead-engine/CODEX_HANDOFF.md` for product history, unfinished requirements, design library references and acceptance checks. Consult `lead-engine/DESIGN.md` for current design tokens and visual intent.

Keep these engineering requirements:
- Source real candidate business websites using Gemini Google Search grounding, then independently verify each candidate. Never fabricate leads, performance figures, contacts, or buying intent.
- Preserve server-only API keys; never commit .env files or expose secrets in frontend JavaScript.
- Build the user's intended **automation**, not an import form or a dashboard that requires manual prospect sourcing.
- Keep research observations separately identifiable from AI inference and unverified assumptions.
- Require human review before outreach; don't implement unsolicited mass emailing.
- Use Git branches/PRs for changes and avoid changing the live production domain until tests and visual review pass.
- Run `cd lead-engine && npm test && npm run build` after meaningful code changes. For API integration testing, use `vercel dev` or a correctly configured preview.
- Implement referenced design components in actual source code with dependencies, proper licenses, accessibility, responsiveness and reduced-motion handling. Reading design repos without integrating applicable assets does **not** meet the requirement.
