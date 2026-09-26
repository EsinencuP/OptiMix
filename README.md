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

The procurement route is illustrative and has not been verified against the existing demonstration. The hero image is a disclosed AI-generated design concept, not client evidence. The contact form is visibly disabled: no delivery address or data operator has been chosen. The privacy pages are explicit placeholders, not legal notices. No data is submitted. The deep procurement page awaits verified demonstration material.

## Motion prototype

The homepage now uses a small entry script to load GSAP and ScrollTrigger only when motion is allowed. Lenis loads separately for desktop-like pointers. The motion rationale, architecture and browser checks are documented in [`docs/MOTION_SYSTEM.md`](docs/MOTION_SYSTEM.md). With the built preview running at `http://127.0.0.1:4321/`, reproduce the Chrome and WebKit checks with `node experiments/verify-motion.mjs`.

For route, language, menu and responsive checks run `node experiments/verify-ia.mjs` against the same preview.

## Animate UI registry in Codex

This project exposes the Animate UI registry as `@animate-ui` in `components.json` and includes the shadcn CLI as a development dependency. In Codex, install the shadcn MCP server once:

```powershell
codex mcp add shadcn -- npx.cmd -y shadcn@4.21.0 mcp
```

Restart Codex after adding the server. You can then ask Codex to search `@animate-ui`, inspect a component and its examples, and check its dependencies before adding it. From this directory, a direct registry check is:

```powershell
npx shadcn search @animate-ui --query button --limit 3
```

The homepage is currently static Astro. Animate UI components use React, Tailwind CSS and Motion, which are not installed in this prototype. Choose a component and its target section before adding that runtime and adapting the design.
