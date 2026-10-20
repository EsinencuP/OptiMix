import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const output = path.resolve('docs/portfolio-2026-10-20/crm-hero-grid-qa');
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:4321';
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const results = { matrix: [], motion: {}, navigation: [], regression: [], errors: [] };

try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) results.errors.push(`${response.status()} ${response.url()}`); });

  for (const locale of ['en', 'ru', 'ro']) {
    const route = `${locale === 'en' ? '' : `/${locale}`}/portfolio/crm/`;
    for (const width of [1440, 1280, 1024, 768, 390, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(base + route);
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        h1: document.querySelectorAll('h1').length,
        main: document.querySelectorAll('main').length,
        header: document.querySelectorAll('header').length,
        footer: document.querySelectorAll('footer').length,
        cards: document.querySelectorAll('.ox-feature-card').length,
        tags: [...document.querySelectorAll('.ox-crm-tags li')].map(el => el.textContent),
        links: [...document.querySelectorAll('.ox-crm-actions a')].map(el => el.href),
        overflow: document.documentElement.scrollWidth > innerWidth,
        innerOverflow: [...document.querySelectorAll('main *')].filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.className),
        brokenImages: [...document.images].filter(el => !el.complete || !el.naturalWidth).map(el => el.src),
        hiddenContent: [...document.querySelectorAll('[data-crm-entrance], [data-crm-feature]')].filter(el => getComputedStyle(el).opacity !== '1').length,
        font: getComputedStyle(document.querySelector('h1')).fontFamily,
        columns: getComputedStyle(document.querySelector('.ox-crm-feature-grid')).gridTemplateColumns.split(' ').length,
      }));
      const row = { route, width, status: response.status(), ...metrics };
      results.matrix.push(row);
      assert.equal(row.status, 200);
      assert.equal(row.lang, locale);
      for (const landmark of ['h1', 'main', 'header', 'footer']) assert.equal(row[landmark], 1);
      assert.equal(row.cards, 6);
      assert.deepEqual(row.tags, ['Next.js', 'Prisma', 'PostgreSQL', 'AI']);
      assert.deepEqual(row.links, ['https://crm-portfolio-omega.vercel.app/', 'https://github.com/EsinencuP/crm-portfolio']);
      assert.equal(row.overflow, false);
      assert.deepEqual(row.innerOverflow, []);
      assert.deepEqual(row.brokenImages, []);
      assert.equal(row.hiddenContent, 0);
      if ([1440, 375].includes(width) || (locale === 'ro' && width === 320)) {
        await page.screenshot({ path: path.join(output, `${locale}-crm-${width}.png`), fullPage: true });
      }
    }
  }

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/portfolio/erp/');
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.screenshot({ path: path.join(output, `erp-regression-${width}.png`), fullPage: true });
    const baseline = await fs.readFile(path.resolve(`docs/portfolio-2026-10-20/scaffold-qa/en-erp-${width}.png`));
    results.regression.push({ width, screenshotIdentical: shot.equals(baseline), crmCards: await page.locator('.ox-feature-card').count() });
    assert.equal(await page.locator('.ox-feature-card').count(), 0);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    window.__crmEntranceFrames = [];
    new MutationObserver(records => {
      for (const record of records) {
        const el = record.target;
        if (el instanceof HTMLElement && el.matches('[data-crm-entrance]') && el.style.opacity) {
          window.__crmEntranceFrames.push({ opacity: Number(el.style.opacity), transform: el.style.transform });
        }
      }
    }).observe(document, { attributes: true, attributeFilter: ['style'], subtree: true });
  });
  await page.goto(base + '/portfolio/crm/');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-crm-entrance]')].every(el => getComputedStyle(el).opacity === '1' && !el.style.transform));
  const entranceFrames = await page.evaluate(() => window.__crmEntranceFrames);
  assert.ok(entranceFrames.some(frame => frame.opacity > 0 && frame.opacity < 1));
  results.motion.entrance = { frameCount: entranceFrames.length, first: entranceFrames[0], middle: entranceFrames[Math.floor(entranceFrames.length / 2)], last: entranceFrames.at(-1) };
  results.motion.cards = [];
  for (const card of await page.locator('.ox-feature-card').all()) {
    await card.scrollIntoViewIfNeeded();
    await page.waitForFunction(el => getComputedStyle(el).opacity === '1' && !el.style.transform, await card.elementHandle());
    results.motion.cards.push(await card.locator('h3').innerText());
  }
  assert.equal(results.motion.cards.length, 6);
  await page.screenshot({ path: path.join(output, 'en-crm-1440-motion-complete.png'), fullPage: true });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  results.motion.reducedMotionResetsStyles = await page.locator('[data-crm-entrance], [data-crm-feature]').evaluateAll(elements => elements.every(el => !el.style.opacity && !el.style.transform));
  assert.equal(results.motion.reducedMotionResetsStyles, true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  for (const locale of ['ru', 'ro', 'en']) {
    const pathname = `${locale === 'en' ? '' : `/${locale}`}/portfolio/crm/`;
    await page.locator(`header .ox-header-actions [data-locale-link][lang="${locale}"]`).click();
    await page.waitForURL(url => url.pathname === pathname);
    await page.waitForFunction(lang => document.documentElement.lang === lang, locale);
    results.navigation.push({ locale, pathname: new URL(page.url()).pathname, cards: await page.locator('.ox-feature-card').count() });
    assert.equal(await page.locator('.ox-feature-card').count(), 6);
  }
  await page.evaluate(() => { window.__crmPreviousRoot = document.querySelector('[data-crm-page]'); });
  await page.locator('main > .ox-page-content a').click();
  await page.waitForURL(url => url.pathname === '/' && url.hash === '#demo-projects');
  await page.waitForFunction(() => !window.__crmPreviousRoot.isConnected);
  results.motion.departedPageStylesReverted = await page.evaluate(() => [...window.__crmPreviousRoot.querySelectorAll('[data-crm-entrance], [data-crm-feature]')].every(el => !el.style.opacity && !el.style.transform));
  assert.equal(results.motion.departedPageStylesReverted, true);
  await page.goBack();
  await page.waitForURL(url => url.pathname === '/portfolio/crm/');
  await page.waitForFunction(() => document.querySelectorAll('.ox-feature-card').length === 6);
  assert.equal(await page.locator('.ox-feature-card').count(), 6);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(base + '/portfolio/crm/');
  await page.locator('.ox-menu-trigger').click();
  await page.locator('#ox-mobile-nav [lang="ru"]').click();
  await page.waitForURL(url => url.pathname === '/ru/portfolio/crm/');
  assert.equal(await page.locator('#ox-mobile-nav').evaluate(el => el.matches(':popover-open')), false);
  await page.locator('.ox-menu-trigger').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#ox-mobile-nav').evaluate(el => el.matches(':popover-open')), false);
  results.navigation.push({ mobile: true, locale: 'ru', menuClosedAfterNavigationAndEscape: true });

  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(base + '/ru/portfolio/crm/');
  results.motion.noJsReadable = await noJsPage.locator('[data-crm-entrance], [data-crm-feature]').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1'));
  assert.equal(await noJsPage.locator('.ox-feature-card').count(), 6);
  assert.equal(results.motion.noJsReadable, true);
  await noJsPage.screenshot({ path: path.join(output, 'ru-crm-375-no-js.png'), fullPage: true });
  await noJsContext.close();

  assert.deepEqual(results.errors, []);
  results.passed = true;
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}

console.log(JSON.stringify({ passed: results.passed, cases: results.matrix.length, motion: results.motion, navigation: results.navigation, regression: results.regression, errors: results.errors }, null, 2));
