# Phase 05 technical browser QA

Tested the built Astro preview at `http://127.0.0.1:4321/` in headless Google Chrome with Playwright. Detailed values are in `technical-qa-results.json`; the reproducible script is `experiments/technical-qa.mjs`.

- At widths **1440, 1280, 768, 390, and 320 px**, every request returned HTTP 200. The document width equaled the viewport width; no clipped leaf text, browser console errors, or failed resource requests appeared. Onest reported loaded at each width.
- With the root font size increased from 16 to **32 px** (200% text resize), document width again equaled the viewport at all five widths and the clipped-text scan was empty. Full-page 390 and 320 px screenshots use the `technical-qa-resize200-*.png` names.
- Keyboard Tab revealed the skip link at 147 × 45 px with a 3 px outline. Enter navigated to `#main`; the next Tab reached the first link in main content. On mobile, Enter opened the native details menu; Tab reached the first link, and Enter navigated to `#workflow`. The menu stays open after anchor activation, which is native details behavior and did not prevent navigation.
- One H1, ordered H2/H3 levels, header/main/footer landmarks, and descriptive navigation labels were present. All internal anchors resolved. The smallest visible actionable target was the 44 px high wordmark.
- In reduced-motion mode, document scrolling computed to `auto` and button/footer transitions computed to 0.01 ms.
- Sample measured contrast ratios: body on paper 15.27:1; accent label on paper 8.28:1; button text 8.75:1; dark-scene detail 8.82:1; muted text on wash 5.66:1. A computed-color scan of visible leaf text found none below 4.5:1. This scan is a technical approximation, not a replacement for assistive-technology review.
- The page fetched approximately 5.5 KB encoded CSS and three Onest WOFF2 subsets totaling 77.4 KB. It fetched no image or JavaScript resources; DOM size was 246 elements. No obvious script or image-loading risk appeared. Field performance metrics were not measured.

This is a browser rendering and keyboard check. It does not constitute a screen-reader or physical-device audit.
