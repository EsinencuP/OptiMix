import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium, webkit } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output = path.resolve('artifacts/motion-2026-09-25');
await fs.mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });

await page.addInitScript(() => {
  window.__layoutShift = 0;
  window.__largestContentfulPaint = 0;
  window.__lcpCandidates = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.__layoutShift += entry.value;
    }
  }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__largestContentfulPaint = entry.startTime;
      window.__lcpCandidates.push({ time: entry.startTime, tag: entry.element?.tagName, text: entry.element?.textContent?.trim().slice(0, 60) });
    }
  }).observe({ type: 'largest-contentful-paint', buffered: true });
});

await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
await page.waitForTimeout(2300);

const desktopInitial = await page.evaluate(() => ({
  lenis: document.documentElement.classList.contains('lenis'),
  heading: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
  width: document.documentElement.scrollWidth,
  viewport: innerWidth,
  layoutShift: window.__layoutShift,
  largestContentfulPaint: window.__largestContentfulPaint,
  lcpCandidates: window.__lcpCandidates,
  loadedScripts: performance.getEntriesByType('resource').filter((entry) => entry.name.endsWith('.js')).map((entry) => entry.name.split('/').pop()),
}));
await page.locator('.hero').screenshot({ path: path.join(output, 'hero-1440.png') });

await page.locator('.recognition').scrollIntoViewIfNeeded();
await page.waitForTimeout(1700);
await page.locator('.recognition').screenshot({ path: path.join(output, 'recognition-1440.png') });

await page.evaluate(() => {
  const step = document.querySelectorAll('.workflow-step')[3];
  window.scrollTo({ top: step.getBoundingClientRect().top + scrollY - innerHeight * 0.52, behavior: 'instant' });
});
await page.waitForTimeout(500);
const workflow = await page.evaluate(() => ({
  position: document.querySelector('[data-route-position]')?.textContent,
  activeStep: [...document.querySelectorAll('.workflow-step')].findIndex((step) => step.classList.contains('is-current')) + 1,
  lineTransform: getComputedStyle(document.querySelector('.workflow-progress-line')).transform,
  stickyIntro: getComputedStyle(document.querySelector('.workflow-intro')).position,
}));
await page.locator('.workflow-scene').screenshot({ path: path.join(output, 'workflow-1440.png') });
await page.screenshot({ path: path.join(output, 'home-1440.png'), fullPage: true });

await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(350);
const resized = await page.evaluate(() => ({
  lenis: document.documentElement.classList.contains('lenis'),
  width: document.documentElement.scrollWidth,
  viewport: innerWidth,
  stickyIntro: getComputedStyle(document.querySelector('.workflow-intro')).position,
}));
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));

await page.emulateMedia({ reducedMotion: 'reduce' });
await page.waitForFunction(() => !document.documentElement.classList.contains('lenis'));
const liveReduced = await page.evaluate(() => ({
  lenis: document.documentElement.classList.contains('lenis'),
  headlineVisible: getComputedStyle(document.querySelector('.hero-title-line')).visibility,
  routeVisible: getComputedStyle(document.querySelector('.workflow-route')).visibility,
}));
await page.emulateMedia({ reducedMotion: 'no-preference' });
await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
const afterPagehide = await page.evaluate(() => document.documentElement.classList.contains('lenis'));
await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
const cdp = await page.context().newCDPSession(page);
await cdp.send('Runtime.enable');
const listenerCounts = async () => {
  const counts = {};
  for (const [name, expression] of [['window', 'window'], ['document', 'document'], ['hero', 'document.querySelector(".hero")']]) {
    const { result } = await cdp.send('Runtime.evaluate', { expression });
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
    counts[name] = listeners.length;
  }
  return counts;
};
const listenersBefore = await listenerCounts();
for (let cycle = 0; cycle < 3; cycle += 1) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.documentElement.classList.contains('lenis'));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'));
}
const listenersAfter = await listenerCounts();
const memoryLifecycle = { listenersBefore, listenersAfter };
await page.locator('.hero-actions .button-primary').click();
await page.waitForTimeout(1200);
const desktopAnchor = await page.evaluate(() => ({
  path: location.pathname,
  disabledForm: document.querySelector('form fieldset')?.disabled,
}));

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
mobile.on('pageerror', (error) => errors.push(`mobile: ${error.message}`));
await mobile.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await mobile.waitForTimeout(2300);
await mobile.locator('.hero').screenshot({ path: path.join(output, 'hero-390.png') });
await mobile.locator('.recognition').scrollIntoViewIfNeeded();
await mobile.waitForTimeout(1700);
await mobile.screenshot({ path: path.join(output, 'home-390.png'), fullPage: true });
const mobileData = await mobile.evaluate(() => ({
  lenis: document.documentElement.classList.contains('lenis'),
  width: document.documentElement.scrollWidth,
  viewport: innerWidth,
  heading: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
  loadedScripts: performance.getEntriesByType('resource').filter((entry) => entry.name.endsWith('.js')).map((entry) => entry.name.split('/').pop()),
}));
await mobile.locator('.mobile-menu summary').focus();
await mobile.keyboard.press('Enter');
const menuVisible = await mobile.locator('.mobile-menu nav').isVisible();
await mobile.keyboard.press('Tab');
const mobileFirstLink = await mobile.evaluate(() => document.activeElement?.getAttribute('href'));
await mobile.keyboard.press('Enter');
await mobile.waitForTimeout(900);
const mobileAnchor = await mobile.evaluate(() => ({
  hash: location.hash,
  workflowTop: Math.round(document.querySelector('#workflow').getBoundingClientRect().top),
}));
await mobile.close();

const responsive = [];
const zoom200 = [];
for (const width of [1280, 768, 390, 320]) {
  const check = await browser.newPage({ viewport: { width, height: 900 } });
  check.on('pageerror', (error) => errors.push(`${width}px: ${error.message}`));
  await check.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  responsive.push(await check.evaluate(() => ({
    width: innerWidth,
    documentWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
    clippedText: [...document.querySelectorAll('main *')].filter((node) => {
      if (node.children.length || getComputedStyle(node).display === 'none') return false;
      const rect = node.getBoundingClientRect();
      return rect.width && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map((node) => node.textContent?.trim()).filter(Boolean).slice(0, 5),
  })));
  await check.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  zoom200.push(await check.evaluate(() => ({
    width: innerWidth,
    documentWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
    headlineHeight: document.querySelector('h1').getBoundingClientRect().height,
    offscreen: [...document.querySelectorAll('body *')].filter((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
    }).slice(0, 8).map((node) => ({ tag: node.tagName, className: typeof node.className === 'string' ? node.className : '', text: node.textContent?.trim().slice(0, 32) })),
  })));
  if (width === 320) {
    await check.waitForTimeout(2300);
    await check.locator('.hero').screenshot({ path: path.join(output, 'hero-320-zoom200.png') });
  }
  await check.close();
}

const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
reduced.on('pageerror', (error) => errors.push(`reduced: ${error.message}`));
await reduced.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await reduced.locator('.hero').screenshot({ path: path.join(output, 'hero-390-reduced.png') });
const reducedData = await reduced.evaluate(() => ({
  lenis: document.documentElement.classList.contains('lenis'),
  headlineVisible: getComputedStyle(document.querySelector('.hero-title-line')).visibility,
  scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  loadedScripts: performance.getEntriesByType('resource').filter((entry) => entry.name.endsWith('.js')).map((entry) => entry.name.split('/').pop()),
}));
await reduced.close();

const keyboard = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await keyboard.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await keyboard.keyboard.press('Tab');
const skipFocused = await keyboard.evaluate(() => ({
  href: document.activeElement?.getAttribute('href'),
  visible: document.activeElement?.getBoundingClientRect().width > 0,
  outline: getComputedStyle(document.activeElement).outlineStyle,
}));
await keyboard.keyboard.press('Enter');
await keyboard.waitForTimeout(900);
const skipTarget = await keyboard.evaluate(() => ({ hash: location.hash, mainTop: Math.round(document.querySelector('main').getBoundingClientRect().top) }));
await keyboard.close();

const late = await browser.newPage({ viewport: { width: 1440, height: 900 } });
late.on('pageerror', (error) => errors.push(`late chunk: ${error.message}`));
await late.route('**/home-motion.*.js', async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 950));
  await route.continue();
});
await late.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
const lateMotion = await late.evaluate(() => ({
  headlineVisible: getComputedStyle(document.querySelector('.hero-title-line')).visibility,
  headlineTransform: getComputedStyle(document.querySelector('.hero-title-line')).transform,
  lenis: document.documentElement.classList.contains('lenis'),
}));
await late.close();

await page.close();
await browser.close();

const webkitBrowser = await webkit.launch({ headless: true });
const webkitData = [];
for (const [width, reducedMotion] of [[1440, 'no-preference'], [390, 'no-preference'], [390, 'reduce']]) {
  const check = await webkitBrowser.newPage({ viewport: { width, height: 900 }, reducedMotion });
  check.on('pageerror', (error) => errors.push(`WebKit ${width}px: ${error.message}`));
  check.on('console', (message) => { if (message.type() === 'error') errors.push(`WebKit ${width}px: ${message.text()}`); });
  const response = await check.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await check.waitForTimeout(2300);
  if (reducedMotion === 'no-preference') {
    await check.locator('.hero').screenshot({ path: path.join(output, `hero-${width}-webkit.png`) });
  }
  const data = await check.evaluate(({ status }) => ({
    width: innerWidth,
    status,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    documentWidth: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth),
    lenis: document.documentElement.classList.contains('lenis'),
    headlineVisible: getComputedStyle(document.querySelector('.hero-title-line')).visibility,
  }), { status: response?.status() });
  if (width === 1440) {
    await check.evaluate(() => {
      const step = document.querySelectorAll('.workflow-step')[3];
      window.scrollTo({ top: step.getBoundingClientRect().top + scrollY - innerHeight * 0.52, behavior: 'auto' });
    });
    await check.waitForTimeout(600);
    data.activeStep = await check.locator('[data-route-position]').textContent();
    await check.locator('.workflow-scene').screenshot({ path: path.join(output, 'workflow-1440-webkit.png') });
  }
  webkitData.push(data);
  await check.close();
}
await webkitBrowser.close();

const result = { errors, desktopInitial, workflow, resized, liveReduced, afterPagehide, memoryLifecycle, desktopAnchor, mobileData, menuVisible, mobileFirstLink, mobileAnchor, responsive, zoom200, reducedData, skipFocused, skipTarget, lateMotion, webkitData };
await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (errors.length || responsive.some((item) => item.documentWidth > item.width || item.clippedText.some(Boolean)) || zoom200.some((item) => item.documentWidth > item.width) || Object.keys(listenersBefore).some((key) => listenersAfter[key] > listenersBefore[key])) {
  process.exitCode = 1;
}
