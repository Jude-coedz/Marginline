# Prospect — evidence-first research workbench

The operator chooses a segment and market, runs discovery, then reviews the shortlist and its evidence. The research toolbar spans the workspace with the primary Find prospects action on the right. There is no left sidebar or setup checklist in the working view. Shortlist and Run log are the only main tabs.

Workspace settings opens a focused dialog from the header. Access, shared storage verification and collapsed service details belong there. Lock workspace lives in the account menu. Provider configuration badges and raw environment variable names do not occupy the main screen. Configuration presence is distinct from verified provider or database access.

Paper `#f5f5f7`, white surfaces, ink `#1d1d1f`, green `#285244`. System typography uses Apple/Segoe fonts with locally shipped DM Sans as fallback. Shared tokens define control sizes, borders, radii, focus rings and muted text. Unused Manrope assets and decorative protocol elements were removed. Thin scrollbars preserve native scrolling.

Actual Canvas UI button, input, select and tabs source is adapted to React 18/Base UI and Prospect CSS. The custom menus support keyboard selection, focus and consistent selected states. React Bits SpotlightCard provides a restrained toolbar pointer response. Licenses and exact revisions are in THIRD_PARTY.md. Reduced motion disables transitions and effects.

At phone widths the two selectors share a row; the action sits below, aligned right. Selection labels truncate consistently without changing control height. Settings, account menu, dropdowns and the review inspector share the same control system. Unsaved review edits open an accessible in-app discard confirmation; cancel preserves edits. Saving disables editable fields until completion.

The prospect inspector separates website observations, Gemini suggestions and human outreach drafts. No fabricated records or simulated research progress appear. Visual evidence lives in `/workspace/artifacts/prospect/after/`; populated test captures are explicitly synthetic QA.
