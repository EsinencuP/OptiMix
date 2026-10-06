# Optimix website prototype

An Astro site in English, Romanian and Russian. The redesigned homepage presents business process automation across HR, documents, CRM, ERP, procurement, forecasting and analytics. It follows the approved desktop and mobile mockups in `docs/redesign-2026-10-06/mockups/`. One illustrative procurement request shows five handoffs. Each handoff opens a separate module page that explains the manual task, proposed mechanism, human responsibility, inputs, exception path and recorded result. A local interactive demo shows the normal route and a missing-budget-code exception.

## Run locally

Requires Node.js 22.12 or newer.

```powershell
npm install
npm run dev
```

For a static build:

```powershell
npm run check
npm run lint
npm run build
npm run preview
```

EN routes: `/`, `/projects/procurement/`, `/solutions/{intake,budget,approval,erp,visibility}/`, `/demo/procurement/`, `/contact/`, `/privacy/`. RO and RU use `/ro/` and `/ru/` prefixes. The 30 routes are currently `noindex`. Homepage copy is in `src/content/home-redesign.ts`; project, modules and demo copy is in `src/content/portfolio.ts`; contact and privacy copy remains in `src/content/en.ts`, `ro.ts` and `ru.ts`.

The procurement and other homepage UI scenes and the browser demo are illustrative. They are not verified client work, measured outcomes or live ERP integration. The browser demo does not submit data. The contact page downloads a local text draft of a process brief; it does not submit or store the entered fields. The privacy pages are placeholders until the legal operator and policy are confirmed. Keep `noindex` until those facts, a real inquiry channel and verified portfolio material are supplied.

Homepage styling is isolated in `src/styles/home-redesign.css`. The illustrations are editable UI in `HomeProcessScene.astro`; Phosphor icons and Roboto font are served locally with their licenses. Internal page styling is in `src/styles/portfolio.css` and `src/styles/home.css`. `predev`, `precheck` and `prebuild` regenerate the critical and deferred stylesheets from `home.css`; edit the source rather than the generated files. Earlier visual and motion exploration remains in `experiments/` and `docs/` as historical design material. Its browser scripts describe the previous page composition.

When a production origin is confirmed, set `PUBLIC_SITE_URL` to emit absolute language alternates.

Approved visual-fidelity rule: [AGENTS.md](./AGENTS.md), [design document](./docs/redesign-2026-10-06/DESIGN_DOCUMENT.md), [browser comparison report](./design-qa.md).

Демо-проекты главной: Cherryli, Budget, Aprobery, ERP, Steer и All-in-one CRM. Компоненты `DemoProjectGallery.astro` и `DemoProjectPreview.astro`, локализованные тексты `src/content/demo-projects.ts`, стили `src/styles/demo-projects.css`. Ссылки на `/demo/procurement/?step=<module>` открывают выбранный шаг локального сценария. Последняя проверка и скриншоты: `docs/redesign-2026-10-06/demo-projects/`.
