import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const runtimeRequire = createRequire(require.resolve(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright'));
const { PNG } = runtimeRequire('pngjs');
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:4321';
const output = path.resolve('docs/portfolio-2026-10-20/erp-modules-cta-qa');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const results = { matrix: [], navigation: [], crmRegression: [], errors: [] };
const route = locale => `${base}${locale === 'en' ? '' : `/${locale}`}/portfolio/erp/`;
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) results.errors.push(`${response.status()} ${response.url()}`); });
  for (const locale of ['en', 'ru', 'ro']) {
    for (const width of [1440, 1280, 1024, 768, 390, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(route(locale));
      await page.waitForSelector('[data-hub-enhanced]');
      await page.evaluate(() => document.fonts.ready);
      const row = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('[data-erp-module]')];
        const cta = document.querySelector('.ox-erp-cta');
        const style = el => getComputedStyle(el);
        return {
          lang: document.documentElement.lang,
          landmarks: ['h1', 'main', 'header', 'footer'].map(selector => document.querySelectorAll(selector).length),
          ids: cards.map(el => el.dataset.erpModule),
          titles: cards.map(el => el.querySelector('h3').textContent),
          features: cards.map(el => el.querySelectorAll('li').length),
          descriptions: cards.every(el => el.querySelector('p').textContent.length > 20),
          columns: style(document.querySelector('.ox-erp-module-grid')).gridTemplateColumns.split(' ').length,
          wideCardFullWidth: Math.abs(cards.at(-1).getBoundingClientRect().width - document.querySelector('.ox-erp-module-grid').getBoundingClientRect().width) < 1,
          overflow: document.documentElement.scrollWidth > innerWidth,
          innerOverflow: [...document.querySelectorAll('main *')].filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.className),
          missingImages: [...document.images].filter(el => !el.complete || !el.naturalWidth).length,
          duplicateIds: [...document.querySelectorAll('[id]')].map(el => el.id).filter((id, index, all) => all.indexOf(id) !== index),
          ctaBackground: style(cta).backgroundColor,
          ctaTitleColor: style(cta.querySelector('h2')).color,
          links: [...cta.querySelectorAll('a')].map(el => ({ href: el.href, background: style(el).backgroundColor, color: style(el).color, iconFilter: style(el.querySelector('img')).filter })),
        };
      });
      assert.equal(response.status(), 200);
      assert.equal(row.lang, locale);
      assert.deepEqual(row.landmarks, [1, 1, 1, 1]);
      assert.deepEqual(row.ids, ['dashboard', 'finance', 'inventory', 'crm', 'expenses', 'team', 'settings']);
      assert.equal(new Set(row.titles).size, 7);
      assert.deepEqual(row.features, [4, 4, 4, 4, 3, 3, 3]);
      assert.equal(row.descriptions, true);
      assert.equal(row.columns, width > 960 ? 3 : width > 640 ? 2 : 1);
      assert.equal(row.wideCardFullWidth, true);
      assert.equal(row.overflow, false);
      assert.deepEqual(row.innerOverflow, []);
      assert.deepEqual(row.duplicateIds, []);
      assert.equal(row.missingImages, 0);
      assert.equal(row.ctaBackground, 'rgb(6, 52, 38)');
      assert.equal(row.ctaTitleColor, 'rgb(255, 255, 255)');
      assert.deepEqual(row.links.map(link => link.href), ['https://erp-xi-pink.vercel.app/', 'https://github.com/EsinencuP/ERP']);
      row.links.forEach(link => { assert.equal(link.background, 'rgb(255, 255, 255)'); assert.equal(link.color, 'rgb(6, 52, 38)'); assert.equal(link.iconFilter, 'none'); });
      results.matrix.push({ width, ...row });
      if ([1440, 375].includes(width) || (locale === 'ro' && width === 320)) {
        await page.screenshot({ path: path.join(output, `${locale}-erp-${width}.png`), fullPage: true });
        await page.locator('#erp-modules').screenshot({ path: path.join(output, `${locale}-modules-${width}.png`) });
        await page.locator('.ox-erp-cta').screenshot({ path: path.join(output, `${locale}-cta-${width}.png`) });
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route('en'));
  await page.waitForSelector('[data-hub-enhanced]');
  const ctaLink = page.locator('.ox-erp-cta a').first();
  await ctaLink.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  const focus = await ctaLink.evaluate(el => ({ visible: el.matches(':focus-visible'), color: getComputedStyle(el).outlineColor, width: getComputedStyle(el).outlineWidth }));
  assert.equal(focus.visible, true);
  assert.equal(focus.color, 'rgb(255, 255, 255)');
  assert.notEqual(focus.width, '0px');
  results.ctaKeyboardFocus = focus;
  for (let index = 0; index < 6; index++) {
    await page.locator('[data-hub-node]').nth(index).click();
    assert.equal(await page.locator('[data-hub-panel][open]').count(), 1);
    await page.locator('[data-hub-node]').nth(index).click();
    assert.equal(await page.locator('[data-hub-panel][open]').count(), 0);
  }
  await page.locator('[data-hub-node]').first().hover();
  await page.locator('[data-hub-tooltip]').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-hub-tooltip]').isVisible(), false);
  results.hubRegression = true;
  for (const locale of ['ru', 'ro', 'en']) {
    await page.locator(`header .ox-header-actions [data-locale-link][lang="${locale}"]`).click();
    await page.waitForFunction(lang => document.documentElement.lang === lang, locale);
    assert.equal(await page.locator('[data-erp-module]').count(), 7);
    assert.equal(new URL(page.url()).pathname, new URL(route(locale)).pathname);
    results.navigation.push({ locale, cards: 7 });
  }
  await page.locator('main > .ox-page-content a').click();
  await page.waitForURL(url => url.pathname === '/' && url.hash === '#demo-projects');
  await page.goBack();
  await page.waitForSelector('[data-hub-enhanced]');
  assert.equal(await page.locator('[data-erp-module]').count(), 7);
  results.astroBack = true;

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(route('en'));
  await page.locator('#erp-modules').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('[data-erp-module]').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1' && getComputedStyle(el).visibility === 'visible')), true);
  results.ordinaryMotionContentVisible = true;

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(route('ru'));
  assert.equal(await noJsPage.locator('[data-erp-module]').count(), 7);
  assert.equal(await noJsPage.locator('[data-erp-module] li').count(), 25);
  assert.equal(await noJsPage.locator('.ox-erp-cta a').count(), 2);
  assert.equal(await noJsPage.locator('[data-erp-module]').evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === '1')), true);
  await noJsPage.screenshot({ path: path.join(output, 'ru-erp-375-no-js.png'), fullPage: true });
  results.noJs = true;
  await noJs.close();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + '/portfolio/crm/');
    await page.evaluate(() => document.fonts.ready);
    const shot = await page.screenshot({ path: path.join(output, `crm-regression-${width}.png`), fullPage: true });
    const old = await fs.readFile(path.resolve(`docs/portfolio-2026-10-20/crm-modules-cta-qa/en-crm-${width}.png`));
    const current = PNG.sync.read(shot), previous = PNG.sync.read(old);
    assert.equal(current.width, previous.width);
    assert.equal(current.height, previous.height);
    let changedPixels = 0, maxChannelDelta = 0;
    for (let offset = 0; offset < current.data.length; offset += 4) {
      let changed = false;
      for (let channel = 0; channel < 3; channel++) {
        const delta = Math.abs(current.data[offset + channel] - previous.data[offset + channel]);
        if (delta) changed = true;
        maxChannelDelta = Math.max(maxChannelDelta, delta);
      }
      if (changed) changedPixels++;
    }
    const totalPixels = current.width * current.height;
    results.crmRegression.push({ width, changedPixels, maxChannelDelta, totalPixels });
    assert.ok(changedPixels <= totalPixels * .0001 && maxChannelDelta <= 5);
  }
  assert.deepEqual(results.errors, []);
  results.passed = true;
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ ...results, matrix: results.matrix.length }, null, 2));
