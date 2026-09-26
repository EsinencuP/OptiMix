import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseUrl = process.env.OPTIMIX_TEST_URL || 'http://127.0.0.1:4321';
const output = path.resolve('artifacts/creative-audit-2026-09-26');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = [];
const innerResults = [];
const zoomResults = [];
const errors = [];

for (const [locale, url] of [['en', '/'], ['ro', '/ro/'], ['ru', '/ru/']].filter(([name]) => !process.argv[2] || name === process.argv[2])) {
  for (const width of (process.argv[3] ? [Number(process.argv[3])] : [320, 390, 768, 1440])) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    page.on('pageerror', (error) => errors.push(`${locale}/${width}: ${error.message}`));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`${locale}/${width}: ${message.text()}`); });
    await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle' });
    await page.locator('.comparison-toggle label[for="compare-after"]').click();
    const afterVisible = await page.locator('.comparison-after').isVisible();
    await page.locator('.comparison-toggle label[for="compare-before"]').click();
    const beforeVisible = await page.locator('.comparison-before').isVisible();
    await page.locator('#compare-before').focus();
    await page.keyboard.press('ArrowRight');
    const keyboardToggle = await page.locator('.comparison-after').isVisible();
    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewport: innerWidth,
      quoteCount: document.querySelectorAll('.editorial-break blockquote').length,
      workflowDirection: getComputedStyle(document.querySelector('.workflow-steps')).display,
      relayOverflow: document.querySelector('.relay').scrollWidth > document.querySelector('.relay').clientWidth + 2,
      footerLanguageCount: document.querySelectorAll('.footer-languages a').length,
      overflowElements: document.documentElement.scrollWidth > innerWidth ? [...document.querySelectorAll('body *')].filter((node) => { const rect = node.getBoundingClientRect(); return rect.right > innerWidth + 1 && !node.closest('.relay, .workflow-route'); }).slice(0, 12).map((node) => ({ tag: node.tagName, className: node.className?.baseVal || node.className, right: Math.round(node.getBoundingClientRect().right) })) : [],
    }));
    if (locale === 'en' && (width === 390 || width === 1440)) {
      await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
      for (const selector of ['.hero', '.recognition', '.change', '.workflow-scene', '.value', '.approach', '.contact', '.site-footer']) {
        await page.locator(selector).screenshot({ path: path.join(output, `${selector.replace(/^[.#]/, '')}-${width}.png`) });
      }
    }
    const relayBefore = await page.locator('.relay').evaluate((node) => node.scrollLeft);
    if (layout.relayOverflow) await page.locator('[data-track="relay"][data-direction="1"]').click();
    const relayAfter = await page.locator('.relay').evaluate((node) => node.scrollLeft);
    let routeMoved = null;
    if (width === 1440) {
      const button = page.locator('[data-track="workflow-route"][data-direction="1"]');
      const before = await page.locator('.workflow-route').evaluate((node) => node.scrollLeft);
      await button.click();
      const after = await page.locator('.workflow-route').evaluate((node) => node.scrollLeft);
      routeMoved = after > before;
    }
    results.push({ locale, width, afterVisible, beforeVisible, keyboardToggle, ...layout, relayMoved: relayAfter > relayBefore, routeMoved });
    await page.close();
  }
}

for (const [locale, prefix] of [['en', ''], ['ro', '/ro'], ['ru', '/ru']]) {
  for (const kind of ['contact', 'privacy']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    page.on('pageerror', (error) => errors.push(`${locale}/${kind}: ${error.message}`));
    await page.goto(`${baseUrl}${prefix}/${kind}/`, { waitUntil: 'networkidle' });
    innerResults.push({ locale, kind, ...await page.evaluate((route) => ({
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      backTop: document.querySelector('.footer-top-link')?.getAttribute('href'),
      topExists: !!document.querySelector('#top'),
      localeTargets: [...document.querySelectorAll('.footer-languages a')].map((link) => link.getAttribute('href')),
      expectedTargets: ['', '/ro', '/ru'].map((prefix) => `${prefix}/${route}/`),
    }), kind) });
    await page.close();
  }
}

for (const [locale, url] of [['en', '/'], ['ro', '/ro/'], ['ru', '/ru/']]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  page.on('pageerror', (error) => errors.push(`${locale}/zoom: ${error.message}`));
  await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  zoomResults.push({ locale, ...await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: innerWidth })) });
  await page.close();
}

await browser.close();
await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ results, innerResults, zoomResults, errors }, null, 2));
console.log(JSON.stringify({ results, innerResults, zoomResults, errors }, null, 2));
if (errors.length || results.some((result) => result.documentWidth > result.viewport || !result.afterVisible || !result.beforeVisible || !result.keyboardToggle || result.quoteCount !== 3 || result.footerLanguageCount !== 3 || (result.relayOverflow && !result.relayMoved) || (result.width === 1440 && !result.routeMoved)) || innerResults.some((result) => result.width > result.viewport || result.backTop !== '#top' || !result.topExists || result.localeTargets.some((target, index) => target !== result.expectedTargets[index])) || zoomResults.some((result) => result.width > result.viewport)) process.exitCode = 1;
