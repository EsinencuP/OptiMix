import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const cycle = process.argv[2] || 'cycle-1';
const base = path.resolve('artifacts/phase05', cycle);
await fs.mkdir(base, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});

const widths = [1440, 1280, 768, 390, 320];
const results = [];

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(base, `home-${width}.png`), fullPage: true });
  if (width === 1440 || width === 390) {
    await page.locator('.hero').screenshot({ path: path.join(base, `hero-${width}.png`) });
    await page.locator('.workflow-scene').screenshot({ path: path.join(base, `workflow-${width}.png`) });
    for (const section of ['recognition', 'change', 'value', 'approach', 'contact']) {
      await page.locator(`.${section}`).screenshot({ path: path.join(base, `${section}-${width}.png`) });
    }
  }
  const data = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    const headings = [...document.querySelectorAll('h1,h2,h3')].map(el => ({ level: el.tagName, text: el.textContent?.trim() }));
    const links = [...document.querySelectorAll('a[href^="#"]')].map(link => ({ href: link.getAttribute('href'), exists: !!document.querySelector(link.getAttribute('href')) }));
    return {
      documentWidth: Math.max(body.scrollWidth, html.scrollWidth),
      viewportWidth: innerWidth,
      fontFamily: getComputedStyle(body).fontFamily,
      onestLoaded: document.fonts.check('16px "Onest Variable"'),
      headings,
      links,
      rootFontSize: getComputedStyle(html).fontSize,
    };
  });
  results.push({ width, status: response?.status(), errors, ...data });
  await page.close();
}

const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await reduced.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
await reduced.evaluate(() => document.fonts.ready);
await reduced.screenshot({ path: path.join(base, 'home-390-reduced.png'), fullPage: true });
const reducedData = await reduced.evaluate(() => ({
  scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  buttonTransition: getComputedStyle(document.querySelector('.button-primary')).transitionDuration,
  routeVisible: !!document.querySelector('.exception-route')?.getClientRects().length,
}));
await reduced.close();
await browser.close();

await fs.writeFile(path.join(base, 'browser-results.json'), JSON.stringify({ results, reducedData }, null, 2));
console.log(JSON.stringify({ results: results.map(({ width, status, errors, documentWidth, viewportWidth, onestLoaded, links }) => ({ width, status, errors, documentWidth, viewportWidth, onestLoaded, brokenAnchors: links.filter(link => !link.exists) })), reducedData }, null, 2));
