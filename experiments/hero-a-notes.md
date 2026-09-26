# Hero A — Operational Cinema

> **Current status, 25 September 2026:** The owner selected A as the target visual foundation. Its composition has moved into `src/pages/index.astro`; the standalone HTML remains the source study. The structure and interaction are expected to evolve. The AI-generated photograph is still a provisional, visibly disclosed concept and cannot represent client work.

## Concept and role

A photographic editorial first screen. It treats the procurement handoff as a human and operational event, not as an equipment catalogue or imaginary software product. The headline, explanatory sentence and action carry the meaning without the image. A four-step illustrative sequence follows the image, with a person explicitly responsible for approval.

This standalone experiment is the source study for the selected direction, not a production page. It contains a brief continuation so reviewers can judge the transition from the dark hero to the light editorial system. Its `Discuss a process` links scroll to an informational section; there is no working lead form in this study. The working homepage uses the more accurate action label `Prepare a process brief`.

## Asset provenance

- `assets/hero-a/procurement-concept.webp` is a temporary **AI-generated concept image** created with OpenAI `image_gen` for this experiment on 2026-09-24. Original: `C:\Users\User.DESKTOP\.codex\generated_images\01a0d505-7335-77d2-8bc4-44f3d5aed08c\exec-9b05aa16-7f09-4124-b770-64dff2637144.png`. Converted from 1672 × 941 PNG to WebP at quality 86 (64,080 bytes) without editing its contents. It is visibly identified in the prototype as a concept image, not client work. Replace it with an approved real or licensed image before any production use.
- `assets/hero-a/Onest-VF.ttf` was copied from the local shared experiment asset and is accompanied by the original `assets/hero-a/OFL.txt` (SIL Open Font License 1.1; The Onest Project Authors, https://github.com/googlefonts/onest). The font is stored locally so the experiment opens without a font CDN.
- The five user reference JPGs in `ref/` were **not** used as assets.

## Render evidence and iteration

Rendered in headless Chrome through Playwright with an actual 1440 × 900 desktop viewport and 390 × 844 mobile viewport. Screenshots: `../artifacts/hero-experiments/a-desktop.png`, `../artifacts/hero-experiments/a-mobile.png`, `../artifacts/hero-experiments/a-mobile-full.png`. The initial review found an orphaned “work” line and a cramped two-column process sequence on mobile. The final version joins “work forward.” and makes the four steps a vertical list. The closing section's prototype-only form wording was removed. Both final screenshots were inspected. The document width equals the viewport at 1440, 390 and 320 px, and the local font and image loaded.

## Strengths

- The real-world operation feels immediate and serious, with a legible left-to-right focal order on desktop.
- The proposition states recurring handoffs, controlled workflows and human approvals/exceptions without fabricated outcomes.
- The mobile composition is deliberately text-first, then image, then sequence. It does not rely on a desktop photo crop behind text.
- No video, motion library, fake metrics, dashboards, client logos or invented client story.

## Weaknesses and selection risk

- The generated desk photograph is generic; it cannot build distinct Optimix trust by itself and has no evidentiary value.
- The photographic hero gives less space to the actual workflow than a process-led direction. The small sequence is only an orientation device.
- The full-bleed image has a sharper media and maintenance cost than a type/process-led alternative. Production should recheck responsive crops, format and LCP with the final approved image.
- The page is English-only because it is a hero experiment. The selected prototype must test EN/RO/RU copy, functional navigation and the real contact path.

## Mobile behavior

At 390 px, the header retains the primary action, the heading and explanation appear before the image, the photo displays as its own 280 px field, and the sequence becomes four separated rows. At 320 px, there is no horizontal overflow. The concept photo and illustration label remain visible in document flow.

## Status

Selected as the visual foundation and transferred to the working homepage. The photograph is temporary and must not be promoted to a claim about a customer or Optimix delivery.
