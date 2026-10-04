# Optimix website — evolving site prototype

This repository contains an evolving multilingual site based on the owner-selected visual **variant A — Operational Cinema**. Its photographic hero and process sequence remain the design foundation. The site is not published or production complete. The IA's hybrid variant C refers to page structure, not the visual variant.

## Run locally

Requires Node.js 22.12 or newer.

```powershell
npm install
npm run dev
```

Open the local address printed by Astro. To check the static build:

```powershell
npm run check
npm run lint
npm run build
npm run preview
```

Current routes: EN `/`, `/contact/`, `/privacy/`; RO `/ro/`, `/ro/contact/`, `/ro/privacy/`; RU `/ru/`, `/ru/contact/`, `/ru/privacy/`. All pages are currently `noindex`. EN, RO and RU copy is edited in `src/content/`. The three standalone hero explorations and the EN/RO/RU typography test are in `experiments/`. Design decisions and validation evidence are in `docs/PHASE05_DESIGN_SYSTEM.md` and `docs/PHASE05_VALIDATION.md`.

The procurement route is illustrative and has not been verified against the existing demonstration. The hero image is a disclosed AI-generated design concept, not client evidence. The contact page lets visitors create and download a local text draft of their process brief; it does not submit or store the entered fields. No delivery address or data operator has been chosen. The privacy pages are explicit placeholders, not legal notices. The deep procurement page awaits verified demonstration material.

## Motion prototype

The homepage now uses a small entry script to load GSAP and ScrollTrigger only when motion is allowed. Lenis loads separately for desktop-like pointers. The motion rationale, architecture and browser checks are documented in [`docs/MOTION_SYSTEM.md`](docs/MOTION_SYSTEM.md). With the built preview running at `http://127.0.0.1:4321/`, reproduce the Chrome and WebKit checks with `node experiments/verify-motion.mjs`.

For route, language, menu and responsive checks run `node experiments/verify-ia.mjs` against the same preview.

The guidebook changes and verification results are recorded in [`docs/GUIDEBOOK_IMPLEMENTATION.md`](docs/GUIDEBOOK_IMPLEMENTATION.md). Run `node experiments/verify-guidebook.mjs` for visibility, popover, sticky-header, touch-target and metadata checks. The visual header and hero stay on variant A.

Homepage CSS is authored in `src/styles/home.css`. The `predev`, `precheck`, and `prebuild` scripts generate an inlined stylesheet for the header, hero and first content section plus an asynchronously loaded stylesheet for the remaining sections. Edit the source file, not the generated CSS files.

Run `node experiments/audit-hero-contrast.mjs` to sample header contrast over the hero photograph at seven widths in all three languages. Run `node experiments/verify-css-delivery.mjs` to check the first content section and hash navigation with a simulated three-second delay of the deferred stylesheet.

For a local interaction-latency proxy, run `node experiments/measure-interactions.mjs`; it is not a substitute for field INP data.

When a production origin is confirmed, build with `PUBLIC_SITE_URL` set to that absolute origin to emit valid language alternates. Without it, the prototype omits `hreflang` links. All routes remain `noindex` until a real inquiry channel, legal notice and release requirements are completed.

## Animate UI registry in Codex

This project keeps the Animate UI registry configuration in `components.json` for future exploration. The unused shadcn CLI is not installed in this prototype. Choose a component and its target section before adding the CLI or the React, Tailwind CSS and Motion runtime that Animate UI components require.
