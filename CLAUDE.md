# CLAUDE.md

Context for Claude Code working in this project.

## What this is

The ultimate.am homepage, redesigned as an immersive scroll-driven 3D experience called "Ascent". It is an enhancement of the existing ultimate.am site, not a new brand: keep its identity, colors, copy and functionality.

## Design system rules (from the existing site, do not change without asking)

- **Colors:** the ultimate.am teal range only. Tokens live in `@theme` in `app/globals.css` (`teal-900` #042227 … `teal-100` #D9EFEE, `ink`, `muted`, `paper`, `on`, `onmuted`). Do not introduce blues or purples from external references.
- **Heading gradient:** light sections use `.grad` (#12959D → #0F5157 → #12959D, matches the original site). Dark sections use `.grad-dark`.
- **Fonts:** Poppins only, everywhere (client request). Editorial accents in headings (`.serif`) are Poppins light italic; labels and HUD (`.mono`) are small uppercase Poppins.
- **Logo:** use the original logo files as they are. White version (`logo-am-white.png`, `logo-team-white.png`) on dark backgrounds, teal version (`logo-am-teal.png`, `logo-team-teal.png`) on light backgrounds. Never redraw or recolor it in other ways.
- **Ornament:** the animated sky ribbon band (`components/ui/Skyband.tsx`: ribbons, auspicious clouds, single kawung batik motifs, a small rocket on the main ribbon). The client rejected the sliding batik motion and then the full batik background, so `public/images/batik-band.png` is kept as the original asset but is no longer shown.
- **No bullet dots next to labels or chips.** The client explicitly asked to remove them everywhere.
- **Spacing:** generous. Section padding `var(--sec)`, side gutter `var(--gx)`. Sections alternate light and dark with curved horizon dividers (`.curve`).
- **Copy:** all copy comes from the existing site (`lib/content.ts`). Do not rewrite it without asking.

## 3D and motion are a layer on top of the design system

- 3D lives only in `components/ascent/`. It reads `flight` (`lib/flight.ts`), a mutable store written by ScrollTrigger and pointer events. Do not put per-frame values in React state.
- `AscentScene.tsx` renders manually in a priority-1 `useFrame` (background pass, then scene) and pauses (`frameloop: never`) while the hero is off screen. Keep it that way for performance.
- The rocket is built once in `components/ascent/rocket.ts` and shared by the hero and `PortfolioOrb.tsx` (the 03 Portfolio orbit: a pinned slide show where the brand planets move only with the visitor's scroll, arrow keys or nav buttons, never on their own; only the active brand is labelled).
- Page-wide motion lives in `components/Motion.tsx`: reveals (`data-reveal`, `data-mask`, diagonal `data-reveal="img"`) and scroll parallax (`data-parallax`, applied through the CSS `translate` property). Floating shards come from `Shards` in `components/ui/Decor.tsx`.
- Custom shaders write sRGB values directly; their color uniforms are created with `raw()` (no linear conversion). Built-in materials use normal color management.
- Avoid animated `filter: blur()` and live SVG `feTurbulence` on large areas; they drop frame rates badly. Use gradients and the static `noise.png`.
- Always respect `prefers-reduced-motion` (see the end of `globals.css` and `flight.reduced`).

## Commands

- `npm run dev` start the dev server
- `npm run build` production build
- `npm run typecheck` TypeScript only
