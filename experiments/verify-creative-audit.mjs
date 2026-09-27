import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseUrl = process.env.OPTIMIX_TEST_URL || 'http://127.0.0.1:4321';
const output = path.resolve(process.env.OPTIMIX_TEST_OUTPUT || 'artifacts/creative-audit-2026-09-26');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = [];
const innerResults = [];
const zoomResults = [];
let motionResult;
const errors = [];

for (const [locale, url] of [['en', '/'], ['ro', '/ro/'], ['ru', '/ru/']].filter(([name]) => !process.argv[2] || name === process.argv[2])) {
  for (const width of (process.argv[3] ? [Number(process.argv[3])] : [320, 390, 768, 1440])) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    page.on('pageerror', (error) => errors.push(`${locale}/${width}: ${error.message}`));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`${locale}/${width}: ${message.text()}`); });
    await page.goto(`${baseUrl}${url}`, { waitUntil: 'networkidle' });
    const beforeVisible = await page.locator('.comparison-before').isVisible();
    const afterVisible = await page.locator('.comparison-after').isVisible();
    const workflowSummary = page.locator('.workflow-step summary').nth(1);
    await workflowSummary.focus();
    await page.keyboard.press('Enter');
    const workflowKeyboardExpanded = await page.locator('.workflow-step details').nth(1).evaluate((node) => node.open);
    await workflowSummary.press('Enter');
    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewport: innerWidth,
      quoteCount: document.querySelectorAll('.editorial-break blockquote').length,
      workflowDirection: getComputedStyle(document.querySelector('.workflow-steps')).display,
      workflowColumns: getComputedStyle(document.querySelector('.workflow-steps')).gridTemplateColumns.split(' ').length,
      workflowOverflow: document.querySelector('.workflow-map').scrollWidth > document.querySelector('.workflow-map').clientWidth + 2,
      routeCurves: (document.querySelector('.workflow-map-track').getAttribute('d')?.match(/ C /g) ?? []).length,
      workflowArrowCount: document.querySelectorAll('.workflow-open').length,
      comparisonItemCounts: [...document.querySelectorAll('.comparison-path ol')].map((list) => list.children.length),
      comparisonNumberCount: document.querySelectorAll('.comparison-path li .mono-number').length,
      valueFormulaSymbols: (document.querySelector('.value-canvas').textContent.match(/[×+]/g) ?? []).length,
      relayOverflow: document.querySelector('.relay').scrollWidth > document.querySelector('.relay').clientWidth + 2,
      footerLanguageCount: document.querySelectorAll('.footer-languages a').length,
      eyebrowCount: document.querySelectorAll('.eyebrow, .hero-eyebrow, .route-preview-label').length,
      relayNumberCount: document.querySelectorAll('.relay-number').length,
      relayIllustrationCount: document.querySelectorAll('.relay-illustration').length,
      overflowElements: document.documentElement.scrollWidth > innerWidth ? [...document.querySelectorAll('body *')].filter((node) => { const rect = node.getBoundingClientRect(); return rect.right > innerWidth + 1 && !node.closest('.relay'); }).slice(0, 12).map((node) => ({ tag: node.tagName, className: node.className?.baseVal || node.className, right: Math.round(node.getBoundingClientRect().right) })) : [],
    }));
    if (locale === 'en' && (width === 390 || width === 1440)) {
      await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
      for (const selector of ['.hero', '.recognition', '.change', '.workflow-scene', '.value', '.approach', '.contact', '.site-footer']) {
        await page.locator(selector).screenshot({ path: path.join(output, `${selector.replace(/^[.#]/, '')}-${width}.png`) });
      }
    }
    const firstRelay = page.locator('.relay-card').first();
    await firstRelay.locator('summary').click();
    const relayExpanded = await firstRelay.evaluate((node) => node.open && node.querySelector('.relay-expanded')?.getBoundingClientRect().height > 0);
    if (locale === 'en' && (width === 390 || width === 1440)) await page.locator('.recognition').screenshot({ path: path.join(output, `recognition-open-${width}.png`) });
    await firstRelay.locator('summary').click();
    const relayBefore = await page.locator('.relay').evaluate((node) => node.scrollLeft);
    if (layout.relayOverflow) await page.locator('[data-track="relay"][data-direction="1"]').click();
    const relayAfter = await page.locator('.relay').evaluate((node) => node.scrollLeft);
    results.push({ locale, width, afterVisible, beforeVisible, workflowKeyboardExpanded, relayExpanded, ...layout, relayMoved: relayAfter > relayBefore });
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
      eyebrowCount: document.querySelectorAll('.eyebrow').length,
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
  zoomResults.push({ locale, ...await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
    overflowElements: [...document.querySelectorAll('body *')].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width && rect.right > innerWidth + .2 && getComputedStyle(element).position !== 'fixed';
    }).slice(0, 12).map((element) => ({ tag: element.tagName, className: typeof element.className === 'string' ? element.className : '', right: Math.round(element.getBoundingClientRect().right * 10) / 10 })),
  })) });
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  page.on('pageerror', (error) => errors.push(`motion: ${error.message}`));
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('.relay-item-2 .relay-card').hover();
  await page.waitForTimeout(650);
  motionResult = await page.evaluate(() => ({
    illustrationMoved: getComputedStyle(document.querySelector('.relay-item-2 .scene-sheet')).transform !== 'none',
    cardStationary: getComputedStyle(document.querySelector('.relay-item-2')).transform === 'none',
  }));
  motionResult.relayExit = [];
  for (const [index, selector] of ['.scene-badge', '.scene-sheet', '.scene-clock-hand', '.scene-mark', '.scene-dot-middle'].entries()) {
    const card = page.locator(`.relay-item-${index + 1} .relay-card`);
    const part = card.locator(selector);
    const position = () => part.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return { x: rect.x, y: rect.y, origin: style.transformOrigin, transform: style.transform };
    });
    await card.scrollIntoViewIfNeeded();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(260);
    const rest = await position();
    await card.hover();
    await page.waitForTimeout(260);
    const hover = await position();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(35);
    const exit = await position();
    await page.waitForTimeout(260);
    const settled = await position();
    motionResult.relayExit.push({
      card: index + 1,
      originStable: rest.origin === hover.origin && hover.origin === exit.origin,
      exitInRange: Math.abs(exit.x - rest.x) < Math.abs(hover.x - rest.x) + 6 && Math.abs(exit.y - rest.y) < Math.abs(hover.y - rest.y) + 6,
      returned: Math.abs(settled.x - rest.x) < 1 && Math.abs(settled.y - rest.y) < 1 && settled.transform === 'none',
    });
  }
  await page.locator('.workflow-step').first().hover();
  await page.waitForTimeout(400);
  motionResult.workflowIconMoved = await page.locator('.workflow-step .workflow-icon').first().evaluate((node) => getComputedStyle(node).transform !== 'none');
  await page.locator('.value-canvas').hover({ position: { x: 80, y: 70 } });
  motionResult.valuePointerResponded = await page.locator('.value-canvas').evaluate((node) => node.style.getPropertyValue('--pointer-x').endsWith('px'));
  await page.locator('.relay-item-2 summary').focus();
  await page.keyboard.press('Enter');
  motionResult.keyboardExpanded = await page.locator('.relay-item-2 .relay-card').evaluate((node) => node.open);
  await page.close();
}

await browser.close();
await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ results, innerResults, zoomResults, motionResult, errors }, null, 2));
console.log(JSON.stringify({ results, innerResults, zoomResults, motionResult, errors }, null, 2));
if (errors.length || !motionResult.illustrationMoved || !motionResult.cardStationary || !motionResult.keyboardExpanded || !motionResult.workflowIconMoved || !motionResult.valuePointerResponded || motionResult.relayExit.some(({ originStable, exitInRange, returned }) => !originStable || !exitInRange || !returned) || results.some((result) => result.documentWidth > result.viewport || !result.afterVisible || !result.beforeVisible || !result.workflowKeyboardExpanded || !result.relayExpanded || result.quoteCount !== 3 || result.footerLanguageCount !== 3 || result.eyebrowCount !== 0 || result.relayNumberCount !== 0 || result.relayIllustrationCount !== 5 || result.workflowArrowCount !== 0 || result.workflowDirection !== 'grid' || result.workflowOverflow || result.routeCurves !== (result.workflowColumns === 4 ? 9 : 7) || result.comparisonItemCounts[0] !== 5 || result.comparisonItemCounts[1] !== 6 || result.comparisonNumberCount !== 0 || result.valueFormulaSymbols !== 0 || (result.relayOverflow && !result.relayMoved)) || innerResults.some((result) => result.width > result.viewport || result.eyebrowCount !== 0 || result.backTop !== '#top' || !result.topExists || result.localeTargets.some((target, index) => target !== result.expectedTargets[index])) || zoomResults.some((result) => result.width > result.viewport)) process.exitCode = 1;
