# Onest multilingual typography experiment

Standalone experiment: [`experiments/type-lab.html`](../../experiments/type-lab.html). Browser captures: `onest-1440.png`, `onest-768.png`, `onest-390.png`, `onest-320.png`, and `onest-mobile-emulation.png` in this folder. Machine observations: `validation.json`; font-face diagnostic: `font-diagnostic.json`.

## Scope and verdict

Onest Variable is a viable **prototype** family for Optimix. In Chrome on Windows it rendered the requested English, Romanian, and Russian strings at display, heading, body, navigation, form-label, workflow, and numeric sizes without missing glyphs or visibly discordant fallback. The Romanian comma-below characters `Ș ș Ț ț`, Romanian `Ă ă Â â Î î`, Russian `Ё ё`, arrows, euro and lei figures were inspected in screenshots. Its softer geometry still reads controlled and precise with restrained weights and spacing. There is no observed need to replace it with IBM Plex Sans or Inter at this stage.

## Browser evidence

Chrome rendered the page at 1440, 768, 390, and 320 CSS pixels; a separate 390-pixel touch/mobile emulation at 2× device scale matched the narrow render. Final `document.documentElement.scrollWidth` equalled the viewport at all four widths, with no browser console errors or failed HTTP responses. The rendered sample loaded four Onest WOFF2 subsets: Latin 33,760 bytes, symbols 18,168 bytes, Latin Extended 28,452 bytes, Cyrillic 15,860 bytes (96,240 response-body bytes in this combined EN/RO/RU page). This is an experiment payload, not a measurement of the eventual English homepage.

The first screenshot pass revealed horizontal overflow in the large currency/percentage examples at 390 and 320 pixels. The second pass reduced numeric scale on mobile and used a single figure column below 360 pixels. The final screenshots show no clipping or overflow. The long Romanian and Russian headlines wrap at meaningful phrase boundaries in mobile view.

The raw `document.fonts.check()` call returned `false` for `Ă/ă` and `→` in the first paint because Fontsource's `unicode-range` declarations overlap with unloaded Vietnamese and math subsets. This was **not** a visible fallback: the rendered glyph pixel hashes were different from Arial and identical before and after explicitly loading those extra subsets. `Ș/ș`, `Ț/ț`, and `Ё/ё` were already checked in loaded subsets. A simple `document.fonts.check()` boolean is therefore insufficient as a multilingual glyph-quality test with this CSS bundle.

## Limits for production

The lab does not establish final type sizes or final copy. Small all-caps specimen labels are 11px here; production labels should be tested at a more comfortable size. The lab was rendered in desktop Chrome and Chrome mobile emulation on Windows. Native Android Chrome, iOS Safari, and macOS rendering remain untested. The main homepage should verify its own font subset requests and wrapping after final copy and layouts are in place.
