# Optimix motion system

**Implementation review, 25 September 2026.** This extends the owner-selected variant **A — Operational Cinema**. The service claims, sample process, concept image and brand colors retain the provisional status described in `PHASE05_DESIGN_SYSTEM.md`.

## Project analysis

| Area | Current project |
| --- | --- |
| Framework and routing | Astro 7 static output; one EN route at `/`; no React or Next.js |
| TypeScript | Astro strict configuration; client scripts are processed by Astro/Vite |
| Styles | Global CSS with `tokens.css`, `global.css` and `home.css`; no Tailwind, CSS Modules or SCSS |
| Components | `BaseLayout.astro` and `index.astro`; the hero, navigation, seven content sections and footer are semantic HTML |
| Previous motion | CSS hover transitions and smooth anchor scroll; no JS animation, WebGL, 3D or scroll library |
| Main visual objects | Photographic hero A with a four-step procurement sequence and the detailed eight-step workflow with a human review branch |

The art direction now uses A's dark photographic opening, warm paper continuation, Onest typography, pale green signal and precise route notation. The photograph is a disclosed AI-generated design concept, not evidence of a client project. Motion emphasizes **handoff, sequence and accountable decisions**. All copy, roles and the exception path remain readable without JavaScript.

## Added

- `gsap@3.15.0` and its `ScrollTrigger` plugin for the coordinated entrance and one scroll-linked route.
- `lenis@1.3.26` for desktop wheel and anchor scrolling. Touch-sized layouts retain native scrolling.

SplitText is unnecessary because the two authored hero lines already provide stable masks. Three.js, React Three Fiber, Drei, Rive and Spline would add runtime and assets without explaining this text-led process more clearly, so they are not installed. There is no WebGL canvas or fallback to manage.

## Architecture

- `src/scripts/motion-entry.ts` checks `prefers-reduced-motion` before dynamically loading the motion bundle. It skips a late hero entrance if the bundle arrives after the visible page has settled.
- `src/scripts/home-motion.ts` owns GSAP, ScrollTrigger and the motion lifecycle. GSAP context and media-query scopes revert animations on preference changes and page exit.
- `src/lib/animation/lenis.ts` loads Lenis separately when a desktop-like pointer actually needs smooth scrolling.
- `src/lib/animation/motionConfig.ts` holds duration and easing values: fast 160 ms, UI 260 ms, content 580 ms, hero 1020 ms; restrained `power3.out` for entrances and linear progress for the route.
- `src/styles/home.css` adapts the A composition to the working page. CSS handles the desktop sticky introduction and mobile text/photo/sequence order; JavaScript animates only transform and opacity. The full HTML route is the fallback.

There is one desktop Lenis instance when the viewport is at least 48 rem and the pointer supports hover. `syncTouch` is disabled. The instance, ticker callback, ScrollTrigger instances, resize-sensitive media scopes and pointer listeners are removed when their scope ends. Native mobile scrolling and reduced-motion mode do not load Lenis.

## Modified components and motion decisions

1. **Hero A:** Three authored heading lines receive a mask reveal. One GSAP timeline then introduces the explanation, CTA and four-step footer sequence in reading order. On a wide fine-pointer screen, the concept photograph moves by less than one percent from the pointer; the text and sequence do not tilt. Mobile presents text, then a separate photograph, then the sequence. The image and disclosure remain visible without motion.
2. **Manual relay:** A single timeline reveals the heading and the five handoffs in order. The animation reinforces repeated transfer; it runs once and does not hide information when JavaScript is unavailable.
3. **Workflow:** A line traces progress through the eight existing steps. The active checkpoint updates a decorative `01 / 08` counter and a thin horizontal guide. On tall desktop viewports, the explanatory column stays in view with native CSS sticky positioning. Mobile uses the original linear reading order without a pinned panel or guide.

The background system is deliberately restrained: the dark workflow surface has a shallow tonal gradient, and its movable guide aligns with the active step. No particles, bloom, random sphere or full-screen shader has been introduced.

## Performance and accessibility

- The built entry script is about 1 KB gzip. The GSAP/ScrollTrigger chunk is about 45 KB gzip and loads only when motion is allowed. Lenis is a separate 5.5 KB gzip chunk requested only for a desktop-like pointer. CSS is about 6 KB gzip. These are local build sizes, not field transfer measurements.
- Reduced-motion visitors load only the small entry script; the hero, route, labels and actions stay visible. A live preference change tears down motion, restores the static state and can reinitialize safely.
- Wheel smoothing is limited to desktop-like pointers. Anchor hashes, keyboard-visible focus, native mobile navigation and semantic headings/lists are retained.
- The new concept image is 64,080 bytes as a local WebP source and is requested at high priority for the photographic first screen. It is provisional and must be rechecked with the final approved image. Transform/opacity animation and one scrubbed line avoid layout animation. The route highlight has a bounded number of triggers, one per meaningful step.

## Verification

Reproduce with `npm run check`, `npm run lint`, `npm run build` and `node experiments/verify-motion.mjs` while serving the built site at `http://127.0.0.1:4321/`. Results and visual captures are in `artifacts/motion-2026-09-25/`.

- Astro check: 0 errors, 0 warnings, 0 hints. ESLint with Astro, TypeScript and accessibility rules passes. Static build succeeds.
- Headless Chrome and Playwright WebKit: no console/page errors in the checked desktop and mobile states. WebKit is a useful engine check; it is not a test on Safari for macOS or iOS hardware.
- Chrome 1440/1280/768/390/320 px: no document overflow or clipped leaf text. At 200% text enlargement, those checked widths remain within the viewport; the A headline and wrapping mobile header were adjusted after the first check found overflow at 390/320 px. The final 320 px close-up was reviewed.
- Desktop workflow at step 04: counter and marker report 04 and the line has advanced. Resizing to 390 px removes Lenis and sticky positioning; reduced motion keeps content visible and unloads Lenis. Page-exit cleanup and back-forward restoration were exercised. Desktop and mobile anchor hashes resolve.
- Three local Chrome runs of variant A before screenshot-driven scroll: LCP approximately **0.27–0.75 s** and CLS approximately **0.0002–0.013**. After three live reduced-motion toggle cycles, Chrome reports identical event-listener counts on `window`, `document` and the hero (30/10/2 before and after). These are bounded local observations, not a heap-profile proof or field Core Web Vitals. INP and sustained 60 FPS on representative hardware were not measured.

## Further opportunities

If the real procurement demonstration becomes available, its verified states could replace the illustrative route and support richer interaction. A purposeful WebGL object, Spline scene or Rive state machine should be considered only with approved source material and a measured benefit over the current CSS/SVG-like route. Before publication, check physical Safari and mobile devices, gather field Core Web Vitals and test the final EN/RO/RU content and inquiry form.
