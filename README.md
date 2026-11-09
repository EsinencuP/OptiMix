# Optimix — React + Next.js

React 19.3.1 + Next.js 16.4.5 App Router site in English, Romanian and Russian. The approved graphite/teal/olive palette, hosted Roboto, hero composition, six-product portfolio and illustrative procurement simulator are preserved. See [the current project guide](docs/PROJECT_GUIDE.md) and [migration report](docs/next-migration-2026-11-09/REPORT.md).

## Run locally

Requires Node.js **24.x**. Local address: `http://127.0.0.1:4322/ru/`; other languages: `/en/`, `/ro/`.

```powershell
npm ci
npm run dev
```

For a production build and preview:

```powershell
npm run check
npm run lint
npm run build
npm run start
```

Run `npm run test:site` in a second terminal against the production preview (Google Chrome required; SITE_QA_URL overrides the server). The suite covers all 72 localized pages at five widths and their interactive flows. All languages use `/en`, `/ro` or `/ru`; old English addresses permanently redirect to `/en`. The route manifest and metadata are in `src/lib/routes.ts`; page rendering is in `src/app/[locale]/[[...segments]]/page.tsx`. Canonical/hreflang include locale prefixes; noindex is preserved.

The procurement and other homepage UI scenes and the browser demo are illustrative. They are not verified client work, measured outcomes or live ERP integration. The browser demo does not submit data. The contact page downloads a local text draft of a process brief; it does not submit or store the entered fields. The privacy pages are placeholders until the legal operator and policy are confirmed. Keep `noindex` until those facts, a real inquiry channel and verified portfolio material are supplied.

Most components render on the server. BaseLayout.tsx, SiteHeader.tsx and SiteFooter.tsx share the graphite visual system. Radix owns Services/FAQ, Motion owns hero/step effects, Lucide supplies common icons and native React ViewTransition handles page changes. Complex CRM/ERP diagrams retain isolated GSAP. SiteRuntime effects mount and dispose route-specific enhancements; no Astro runtime remains. `src/app/site.css` defines the active stylesheet order. Legacy home.css/inner.css/portfolio.css remain inactive historical sources.

When a production origin is confirmed, set `PUBLIC_SITE_URL` to emit absolute language alternates.

Approved visual-fidelity rule: [AGENTS.md](./AGENTS.md), [design document](./docs/redesign-2026-10-06/DESIGN_DOCUMENT.md), [browser comparison report](./design-qa.md).

Портфолио: AI PDF Editor, Evo ERP, Commerce Operations, Founder Workspace, Recruiting Workspace, CRM Portfolio; canonical demo/GitHub URL — в portfolio-catalog.ts. Примеры на главной и страницах услуг — заглушки до README, без прежнего сопоставления проектов направлениям. Опубликованных реквизитов нет; отдельным демо передано [требование беспарольного выбора ролей](docs/revision-2026-11-09/DEMO_PLATFORM_HANDOFF.md). vercel.json фиксирует preset nextjs поверх прежней настройки Astro, сохраняя домен.
