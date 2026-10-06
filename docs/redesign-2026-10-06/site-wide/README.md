# Полный перенос сайта — доказательства

Текущий гид: ../../PROJECT_GUIDE.md. Общее заключение: ../../../design-qa.md.

- route-manifest.json — 33 HTML-страницы сборки.
- routes-desktop.json, routes-mobile.json, routes-320.json — 99 браузерных проверок.
- routes-intermediate.json — 22 проверки 768/1024px.
- static-design-audit.json — новый font/favicon и общие компоненты всех 33 страниц.
- contrast.json — восемь фактических пар цветов.
- cli-checks.json — Astro check, ESLint, build.
- Снимки desktop/mobile: бриф, пять модулей, проект, демо, конфиденциальность и 404.
- Снимки состояний: сообщение брифа, popover, остановка и завершение демо.

На desktop-главной выступающие стрелки в промежутках шагов отмечены в raw DOM-измерениях как inner overflow; это ожидаемая композиция. Текст не обрезан, overflow страницы отсутствует. Проблемные русские подписи мобильной главной исправлены и перепроверены.
