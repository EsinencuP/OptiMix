# Approved site-wide redesign

The owner approved the visual mockups on 2026-10-06 and requested that the homepage reproduce their composition 1:1. For all homepage work, treat the approved images as the visual source of truth:
- `docs/redesign-2026-10-06/mockups/optimix-desktop-full.png`
- `docs/redesign-2026-10-06/mockups/optimix-desktop-hero.png` (priority for the detailed first screen)
- `docs/redesign-2026-10-06/mockups/optimix-mobile-full-board.png` (three sequential scroll segments, not alternatives).

Read section 22 of `docs/redesign-2026-10-06/DESIGN_DOCUMENT.md` before changing the homepage. Preserve the approved composition, typography hierarchy, colors, interface scenes and mobile adaptation. Do not invent another design direction. Browser screenshots and visual comparison are required; a successful build alone does not prove fidelity. Record any genuinely missing asset, font, tool or service and name the concrete blocker to the owner.

Current homepage implementation: `HomePage.astro`, `HomeProcessScene.astro`, `RedesignIcon.astro`, `home-redesign.ts`, `home-redesign.css`. Roboto Variable is locally hosted and selected by visual comparison. All pages now use the approved Roboto, white/mint/emerald design. Internal templates extend the same system through site-pages.css. Preserve existing routes, locale switching and the old homepage anchors. Existing user edits must not be reverted. Latest visual verification: `design-qa.md`.

Demo gallery extension approved by the owner: `DemoProjectGallery.astro`, `DemoProjectPreview.astro`, `demo-projects.ts`, `demo-projects.css`; see design document section 23. Preserve the six named cards and their localized links. Previews are illustrative, with no invented client proof.

The owner explicitly authorized migration of the entire site, including every page and state. Read `docs/PROJECT_GUIDE.md` for current architecture, design tokens, routes and acceptance rules; section 24 of the design document records this scope. Reuse SiteHeader/SiteFooter and BaseLayout everywhere. Never reconnect legacy home.css, inner.css, portfolio.css or the old motion/visual scripts to active routes. Update the project guide after subsequent changes.
