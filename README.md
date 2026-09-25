# Optimix website — Phase 05 prototype

This repository currently contains a browser-ready **homepage visual prototype**. It tests the controlled-workflow design direction from `docs/VISUAL_DIRECTION.md`; it is not a published or complete website.

## Run locally

Requires Node.js 22.12 or newer.

```powershell
npm install
npm run dev
```

Open the local address printed by Astro. To check the static build:

```powershell
npm run check
npm run build
npm run preview
```

The prototype has one EN page at `/`. The three standalone hero explorations and the EN/RO/RU typography test are in `experiments/`. Design decisions and validation evidence are in `docs/PHASE05_DESIGN_SYSTEM.md` and `docs/PHASE05_VALIDATION.md`.

The procurement route is illustrative and has not been verified against the existing demonstration. The page has no live inquiry form, client claims, or analytics. RO/RU pages and the real contact flow belong to later phases.
