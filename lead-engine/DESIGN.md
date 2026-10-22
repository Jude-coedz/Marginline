# Prospect — evidence-first research workbench

The operator's question is: which businesses deserve a human review, and what supports that decision? The core artifact is the shortlist, not an overview dashboard.

The fixed brief sits beside a flat research queue on desktop. Discovery, website checks and human review are an explanatory protocol, never simulated live progress. Workspace tabs switch between shortlist, run provenance and configuration. The prospect inspector keeps website observations separate from Gemini suggestions and the operator's outreach draft.

On phones, the saved brief collapses to segment, market and the research action. Edit reveals native select controls; the protocol is hidden unless a run needs attention. Tabs, filters and company rows use the full width. Review opens a native modal dialog with focus containment, Escape, focus restoration and an unsaved-edit warning. Save locks its editable fields until completion.

Paper `#f7f7f4`, white surfaces, ink `#18221f`, green `#284f43`, muted text `#626c65`. Green identifies actions and positive evidence; amber means configuration/verification is pending, red identifies failures. Keep surfaces flat with fine borders. No marketing hero, navigation sidebar, vanity KPI tiles, fake radar signals or decorative motion. The shortlist is visible from the first desktop viewport.

Manrope 500/600 for titles, DM Sans 400–700 for controls/data. Fonts ship locally. Tokens are in `src/tokens.css`; content/control typography stays fixed in rem units. Motion is limited to state feedback; reduced motion disables transitions and the Spotlight response. Native controls retain visible focus. CSV values are escaped against spreadsheet formulas.

Actual React Bits SpotlightCard and Canvas UI/Base UI tabs are integrated. Their dependencies, exact upstream revisions and current licenses are documented in THIRD_PARTY.md. Skills inform design decisions; they are not described as runtime component dependencies.

Visual evidence is in `/workspace/artifacts/prospect/after/`. Empty states use the real unconfigured local backend. Populated and failure captures are labeled synthetic automated QA. Neither source nor screenshots contain invented prospects presented as live results.
