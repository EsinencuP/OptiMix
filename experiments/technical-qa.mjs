import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseUrl = 'http://127.0.0.1:4321/';
const outDir = path.resolve('artifacts/phase05');
await fs.mkdir(outDir, { recursive: true });

function rgba(value) {
  const numbers = value.match(/[\d.]+/g)?.map(Number) ?? [];
  return [...numbers.slice(0, 3), numbers[3] ?? 1];
}
function linear(value) { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; }
function luminance(rgb) { return .2126 * linear(rgb[0]) + .7152 * linear(rgb[1]) + .0722 * linear(rgb[2]); }
function composite(front, back) {
  const a = front[3];
  return [0, 1, 2].map(i => front[i] * a + back[i] * (1 - a));
}
function contrast(fore, back) {
  const [a, b] = [luminance(fore), luminance(back)].sort((x, y) => y - x);
  return +((a + .05) / (b + .05)).toFixed(2);
}

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = { timestamp: new Date().toISOString(), baseUrl, viewports: [], keyboard: {}, semantics: {}, reducedMotion: {}, resize200: {}, contrast: [], lowContrast: [], resources: {} };

for (const width of [1440, 1280, 768, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const viewport = await page.evaluate(() => {
    const e = document.documentElement;
    const body = document.body;
    const interactive = [...document.querySelectorAll('a[href], button, summary')].filter(n => getComputedStyle(n).display !== 'none' && n.getClientRects().length).map(n => {
      const r = n.getBoundingClientRect();
      return { text: n.textContent?.trim().slice(0, 70), tag: n.tagName, width: +r.width.toFixed(1), height: +r.height.toFixed(1), x: +r.x.toFixed(1), y: +r.y.toFixed(1) };
    });
    const clipped = [...document.querySelectorAll('main *')].filter(n => {
      if (n.children.length || getComputedStyle(n).display === 'none') return false;
      const r = n.getBoundingClientRect();
      return r.width && (r.left < -1 || r.right > innerWidth + 1);
    }).slice(0, 20).map(n => ({ tag: n.tagName, text: n.textContent?.trim().slice(0, 60), x: +n.getBoundingClientRect().left.toFixed(1), right: +n.getBoundingClientRect().right.toFixed(1) }));
    return { viewportWidth: innerWidth, docWidth: Math.max(e.scrollWidth, body.scrollWidth), onest: document.fonts.check('16px "Onest Variable"'), fontFamily: getComputedStyle(body).fontFamily, interactive, clipped };
  });
  results.viewports.push({ width, status: response?.status(), errors, ...viewport });
  if (width === 1440) {
    results.semantics = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll('h1').length,
      headings: [...document.querySelectorAll('h1,h2,h3')].map(n => ({ tag: n.tagName, text: n.textContent?.trim() })),
      landmarks: { header: document.querySelectorAll('body > header').length, main: document.querySelectorAll('main').length, footer: document.querySelectorAll('body > footer').length, nav: document.querySelectorAll('nav').length },
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(n => !document.querySelector(n.getAttribute('href'))).map(n => n.outerHTML),
      nonDescriptiveLinks: [...document.querySelectorAll('a')].filter(n => !n.textContent?.trim() && !n.getAttribute('aria-label')).map(n => n.outerHTML),
    }));
    results.resources = await page.evaluate(() => ({
      entries: performance.getEntriesByType('resource').map(r => ({ name: r.name, initiatorType: r.initiatorType, transferSize: r.transferSize, encodedBodySize: r.encodedBodySize, decodedBodySize: r.decodedBodySize, duration: +r.duration.toFixed(1) })),
      domNodes: document.querySelectorAll('*').length,
      images: document.images.length,
      scripts: document.scripts.length,
    }));
    results.contrast = await page.evaluate(() => {
      const pairs = [
        ['body on paper', 'body', 'body'],
        ['muted on paper', '.hero .body-large', 'body'],
        ['accent eyebrow on paper', '.hero .eyebrow', 'body'],
        ['button text on accent', '.button-primary', '.button-primary'],
        ['dark scene intro', '.workflow-intro .body-large', '.workflow-scene'],
        ['dark scene muted disclosure', '.workflow-disclosure', '.workflow-scene'],
        ['dark scene step detail', '.workflow-step > p', '.workflow-scene'],
        ['exception text', '.exception-route p', '.exception-route'],
        ['muted on wash', '.recognition .muted', '.recognition'],
        ['nav contact on paper', '.nav-contact', '.site-header'],
      ];
      return pairs.map(([label, fg, bg]) => ({ label, fore: getComputedStyle(document.querySelector(fg)).color, back: getComputedStyle(document.querySelector(bg)).backgroundColor, fontSize: getComputedStyle(document.querySelector(fg)).fontSize, fontWeight: getComputedStyle(document.querySelector(fg)).fontWeight }));
    });
    results.lowContrast = await page.evaluate(() => {
      const candidates = [...document.querySelectorAll('body *')].filter(n => n.children.length === 0 && n.textContent?.trim() && n.getClientRects().length);
      const shown = [];
      for (const n of candidates) {
        let parent = n;
        let back = 'rgb(248, 249, 246)';
        while (parent) {
          const bg = getComputedStyle(parent).backgroundColor;
          if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') { back = bg; break; }
          parent = parent.parentElement;
        }
        const s = getComputedStyle(n);
        shown.push({ tag: n.tagName, text: n.textContent.trim().slice(0, 60), fore: s.color, back, fontSize: s.fontSize, fontWeight: s.fontWeight });
      }
      return shown;
    });
  }
  await page.close();
}

for (const c of results.contrast) {
  const foreground = rgba(c.fore), background = rgba(c.back);
  c.ratio = contrast(composite(foreground, background), background);
}
results.lowContrast = results.lowContrast.map(c => {
  const f = rgba(c.fore), b = rgba(c.back);
  return { ...c, ratio: contrast(composite(f, b), b) };
}).filter(c => c.ratio < 4.5).sort((a, b) => a.ratio - b.ratio);

const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await desktop.goto(baseUrl, { waitUntil: 'networkidle' });
await desktop.keyboard.press('Tab');
results.keyboard.skipBefore = await desktop.evaluate(() => {
  const n = document.activeElement, r = n.getBoundingClientRect(), s = getComputedStyle(n);
  return { text: n.textContent?.trim(), href: n.getAttribute('href'), x: r.x, y: r.y, width: r.width, height: r.height, outline: s.outline, visible: r.width > 0 && r.height > 0 };
});
await desktop.keyboard.press('Enter');
results.keyboard.skipAfter = await desktop.evaluate(() => ({ hash: location.hash, activeTag: document.activeElement?.tagName, activeId: document.activeElement?.id, mainTop: document.querySelector('main').getBoundingClientRect().top }));
await desktop.keyboard.press('Tab');
results.keyboard.afterSkipTab = await desktop.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), outline: getComputedStyle(document.activeElement).outline }));
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(baseUrl, { waitUntil: 'networkidle' });
const summary = mobile.locator('.mobile-menu summary');
await summary.focus();
results.keyboard.mobileSummaryFocus = await mobile.evaluate(() => ({ tag: document.activeElement.tagName, outline: getComputedStyle(document.activeElement).outline }));
await mobile.keyboard.press('Enter');
results.keyboard.mobileMenuOpened = await mobile.locator('.mobile-menu').evaluate(n => n.open);
await mobile.keyboard.press('Tab');
results.keyboard.mobileFirstLink = await mobile.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href'), outline: getComputedStyle(document.activeElement).outline }));
await mobile.keyboard.press('Enter');
await mobile.waitForTimeout(700);
results.keyboard.mobileNavAfterEnter = await mobile.evaluate(() => ({ hash: location.hash, workflowTop: document.querySelector('#workflow').getBoundingClientRect().top, menuStillOpen: document.querySelector('.mobile-menu').open }));
await mobile.close();

const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await reduced.goto(baseUrl, { waitUntil: 'networkidle' });
results.reducedMotion = await reduced.evaluate(() => ({ matches: matchMedia('(prefers-reduced-motion: reduce)').matches, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, buttonTransition: getComputedStyle(document.querySelector('.button-primary')).transitionDuration, navTransition: getComputedStyle(document.querySelector('.site-footer a')).transitionDuration }));
await reduced.close();

for (const width of [1440, 1280, 768, 390, 320]) {
  const resize = await browser.newPage({ viewport: { width, height: 844 } });
  await resize.goto(baseUrl, { waitUntil: 'networkidle' });
  await resize.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await resize.evaluate(() => document.fonts.ready);
  if (width === 390 || width === 320) await resize.screenshot({ path: path.join(outDir, `technical-qa-resize200-${width}.png`), fullPage: true });
  results.resize200[width] = await resize.evaluate(() => {
    const html = document.documentElement, body = document.body;
    const overflowing = [...document.querySelectorAll('body *')].filter(n => {
      if (n.children.length || getComputedStyle(n).display === 'none') return false;
      const r = n.getBoundingClientRect();
      return r.width && (r.left < -1 || r.right > innerWidth + 1);
    }).slice(0, 25).map(n => ({ tag: n.tagName, text: n.textContent?.trim().slice(0, 55), x: +n.getBoundingClientRect().left.toFixed(1), right: +n.getBoundingClientRect().right.toFixed(1) }));
    const grids = ['.header-inner', '.hero', '.change', '.approach-grid', '.contact-inner'].map(selector => {
      const n = document.querySelector(selector), r = n.getBoundingClientRect();
      return { selector, x: +r.x.toFixed(1), width: +r.width.toFixed(1), right: +r.right.toFixed(1), columns: getComputedStyle(n).gridTemplateColumns };
    });
    return { viewportWidth: innerWidth, docWidth: Math.max(html.scrollWidth, body.scrollWidth), rootFontSize: getComputedStyle(html).fontSize, grids, overflowing };
  });
  await resize.close();
}

await browser.close();
await fs.writeFile(path.join(outDir, 'technical-qa-results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ viewports: results.viewports.map(({ width, status, errors, docWidth, viewportWidth, onest, clipped, interactive }) => ({ width, status, errors, docWidth, viewportWidth, onest, clipped, smallTargets: interactive.filter(n => n.width < 24 || n.height < 24) })), semantics: results.semantics, keyboard: results.keyboard, reducedMotion: results.reducedMotion, contrast: results.contrast, lowContrast: results.lowContrast, resize200: results.resize200, resources: results.resources }, null, 2));
