# Prospect v3 — design contract

## Product experience
This is a prospect-sourcing workbench, not a CRM dashboard. The first usable action is **Find prospects**, with only industry and market inputs. The output is verified business websites and a review drawer. No fabricated progress, prospect lists, customer logos or vanity metrics.

## Primary style
- **Editorial utility:** natural-paper background, generous typographic contrast, crisp hairlines, flat lead tables.
- **One expressive canvas:** deep-green signal/radar diagram representing discovery → checking → review. Decorative motion only while a run is actually ongoing.
- **Color discipline:** `#f7f7f4` paper, `#18221f` text, `#284f43` active green, `#d2f99a` highlight on the dark canvas. No purple gradients, floating stock cards, glassmorphism or icon-badge grids.
- **Fonts:** Manrope display, DM Sans body, tabular aligned operational data.
- **Layout:** three clearly distinguished zones — brief, shortlist, lead inspector. The shortlist is the product, not a CTA teaser.

## Third-party implementation references actually used
- React Bits: adapted SpotlightCard on the action canvas, and StatusMark status glyph. See `src/components/SpotlightCard.jsx` and `src/components/StatusMark.jsx` (MIT). Source: DavidHDev/react-bits.
- Canvas UI: adapted IntersectionObserver Reveal pattern. See `src/components/Reveal.jsx` (MIT). Source: DavidHDev/canvas-ui.
- Framer Motion: panel overlays, transitions between results and run history, staggered lead rows; all respect reduced-motion.
- taste-skill / `references/app-screens.md`: colors on data, avoid generic KPI cards, no hero-size application headers or needless icons, use honest empty states.
- Impeccable `distill.md` and Hallmark anti-patterns: one primary action, less nesting, truthful copy, consistent tokens.
- Awesome Design MD: studied Linear and Mercury design systems; using restraint and component polish rather than copying their proprietary visual marks.

## Constraints
Be visually distinctive but easy for a sales operator to use. Animations must be purposeful, never prevent interaction or cause unwanted shifts. Re-check at 375, 768 and 1440 CSS pixels. Subsequent MD files supplied by the user will refine this contract.