# ultimate.am — Ascent

The ultimate.am homepage redesigned as an immersive, scroll-driven 3D experience: a rocket launch journey ("Ascent") that leads into the existing site content.

**Stack:** Next.js 16 (App Router) · React 19 · React Three Fiber + three.js · GSAP ScrollTrigger · Lenis · Tailwind CSS v4 · TypeScript

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Fonts are self-hosted through `@fontsource`, so the build does not need network access to Google Fonts.

## What is where

```
app/
  layout.tsx            fonts, metadata
  page.tsx              page composition
  globals.css           design tokens (@theme) and all component styles
components/
  Motion.tsx            Lenis smooth scroll + ScrollTrigger sync, reveals, tilt, magnet, cursor
  Nav.tsx               floating nav, white logo on dark / teal logo on light
  ascent/AscentHero.tsx sticky stage, scroll progress, HUD, chapter copy
  ascent/AscentScene.tsx R3F scene: rocket, exhaust, smoke, clouds, stars, earth, camera rig
  sections/*            Record, Ecosystem, Brands, Studios, Work, Contact, Footer
  ui/                   icons and decorative ornaments
lib/
  flight.ts             shared flight state, sky palette, altitude and camera keyframes
  content.ts            all copy and data, taken from the existing site
public/images/          photos, institution logos, ultimate.am logos, filigree band, noise
```

## Tuning the journey

Everything about the flight is driven by one number, the scroll progress `p` (0 to 1) through the hero.

- Hero length: `.ascent { height }` in `globals.css` (3600px desktop, 3000px tablet, 2600px mobile).
- Sky colors per stage: `SKY_TOP` / `SKY_BOTTOM` in `lib/flight.ts`.
- Rocket climb and slow-motion separation: `altitude()` in `lib/flight.ts`.
- Camera path: `CAM_KEYS` in `lib/flight.ts` (offset from the rocket and look-at point per progress value).
- Chapter copy and timing: `CHAPTERS` in `components/ascent/AscentHero.tsx`.

## Accessibility and fallbacks

- `prefers-reduced-motion`: no smooth scroll, no scroll-scrubbed flight; the hero becomes one static scene with the original hero copy.
- No WebGL: the hero keeps the HUD and chapter copy over a scroll-driven sky gradient.
- Mobile: lower particle counts, capped pixel ratio, simplified HUD; the 3D scene pauses whenever the hero is off screen.

## Open items

- **Logo files:** the logos in `public/images/logo-*.png` were extracted from design screenshots. Replace them with the original SVG or high resolution PNG for sharp rendering on retina screens.
- **Contact form:** validates on the client only. Connect `components/sections/Contact.tsx` (see the TODO) to the real form endpoint.
- **Links:** nav items point to sections on this page. Point them to the real routes once the other pages exist.
