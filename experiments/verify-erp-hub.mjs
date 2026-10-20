import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const runtimeRequire = createRequire(require.resolve(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright'));
const { PNG } = runtimeRequire('pngjs');
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:4321';
const output = path.resolve('docs/portfolio-2026-10-20/erp-hero-hub-qa');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const results = { matrix: [], motion: {}, interaction: {}, navigation: [], crmRegression: [], errors: [] };
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) results.errors.push(`${response.status()} ${response.url()}`); });
  const route = locale => `${base}${locale === 'en' ? '' : `/${locale}`}/portfolio/erp/`;
  const nodes = page.locator('[data-hub-node]');
  const tooltip = page.locator('[data-hub-tooltip]');
  const map = page.locator('[data-hub-map]');
  const root = page.locator('[data-erp-hub]');
  for (const locale of ['en', 'ru', 'ro']) {
    for (const width of [1440, 1280, 1024, 768, 390, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(route(locale));
      await page.waitForSelector('[data-hub-enhanced]');
      await page.evaluate(() => document.fonts.ready);
      const row = await page.evaluate(() => {
        const nodeRects = [...document.querySelectorAll('[data-hub-node]')].map(el => el.getBoundingClientRect());
        const mapRect = document.querySelector('[data-hub-map]').getBoundingClientRect();
        const core = document.querySelector('.ox-erp-core').getBoundingClientRect();
        const intersects = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
        return {
          lang: document.documentElement.lang,
          landmarks: ['h1', 'main', 'header', 'footer'].map(selector => document.querySelectorAll(selector).length),
          nodes: nodeRects.length, paths: document.querySelectorAll('[data-hub-path]').length, dots: document.querySelectorAll('[data-hub-dot]').length,
          tags: [...document.querySelectorAll('.ox-erp-tags li')].map(el => el.textContent),
          links: [...document.querySelectorAll('.ox-erp-actions a')].map(el => el.href),
          overflow: document.documentElement.scrollWidth > innerWidth,
          innerOverflow: [...document.querySelectorAll('main *')].filter(el => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.className),
          nodesInsideMap: nodeRects.every(rect => rect.left >= mapRect.left - 1 && rect.right <= mapRect.right + 1 && rect.top >= mapRect.top - 1 && rect.bottom <= mapRect.bottom + 1),
          nodeOverlap: nodeRects.some((rect, index) => nodeRects.slice(index + 1).some(other => intersects(rect, other))),
          coreOverlap: nodeRects.some(rect => intersects(rect, core)),
          glow: getComputedStyle(document.querySelector('.ox-erp-core')).boxShadow,
          missingImages: [...document.images].filter(el => !el.complete || !el.naturalWidth).length,
        };
      });
      assert.equal(response.status(), 200);
      assert.equal(row.lang, locale);
      assert.deepEqual(row.landmarks, [1, 1, 1, 1]);
      assert.deepEqual([row.nodes, row.paths, row.dots], [6, 6, 6]);
      assert.deepEqual(row.tags, ['Next.js', 'PostgreSQL', 'Docker', 'Prisma']);
      assert.deepEqual(row.links, ['https://erp-xi-pink.vercel.app/', 'https://github.com/EsinencuP/ERP']);
      assert.equal(row.overflow, false);
      assert.deepEqual(row.innerOverflow, []);
      assert.equal(row.nodesInsideMap, true);
      assert.equal(row.nodeOverlap, false);
      assert.equal(row.coreOverlap, false);
      assert.equal(row.missingImages, 0);
      assert.ok(row.glow.includes('40px') && row.glow.includes('195, 239, 213'));
      for (let index = 0; index < 6; index++) {
        const node = nodes.nth(index);
        const id = await node.getAttribute('data-hub-node');
        await node.hover();
        await tooltip.waitFor({ state: 'visible' });
        assert.equal(await page.locator('[data-hub-tooltip-title]').innerText(), await node.getAttribute('data-hub-title'));
        const tooltipRect = await tooltip.boundingBox();
        const mapRect = await map.boundingBox();
        assert.ok(tooltipRect.x >= mapRect.x - 1 && tooltipRect.x + tooltipRect.width <= mapRect.x + mapRect.width + 1);
        assert.ok(tooltipRect.y >= mapRect.y - 1 && tooltipRect.y + tooltipRect.height <= mapRect.y + mapRect.height + 1);
        await node.click();
        assert.equal(await page.locator(`#erp-module-${id}`).evaluate(el => el.open), true);
        assert.equal(await page.locator('[data-hub-panel][open]').count(), 1);
        assert.equal(await node.getAttribute('aria-expanded'), 'true');
        await node.click();
        assert.equal(await page.locator('[data-hub-panel][open]').count(), 0);
      }
      await page.locator('[data-hub-panel]').first().locator('summary').click();
      await page.waitForFunction(() => document.querySelector('[data-hub-node]').getAttribute('aria-expanded') === 'true');
      await page.locator('[data-hub-panel]').first().locator('summary').click();
      await page.keyboard.press('Escape');
      results.matrix.push({ width, status: response.status(), ...row, sixHoverAndClickStatesPassed: true });
      if ([1440, 375].includes(width) || (locale === 'ro' && width === 320)) {
        await page.screenshot({ path: path.join(output, `${locale}-erp-${width}.png`), fullPage: true });
        await map.screenshot({ path: path.join(output, `${locale}-hub-${width}.png`) });
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(route('en'));
  await page.waitForSelector('[data-hub-enhanced]');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-erp-entrance]')].every(el => getComputedStyle(el).opacity === '1' && !el.style.transform));
  await map.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const transforms = () => page.locator('[data-hub-dot]').evaluateAll(elements => elements.map(el => el.getAttribute('transform')));
  const before = await transforms();
  await page.waitForTimeout(200);
  assert.notDeepEqual(await transforms(), before);
  results.motion.sixDotsMoving = (await transforms()).every((value, index) => value !== before[index]);
  assert.equal(results.motion.sixDotsMoving, true);
  const distances = () => page.evaluate(() => [...document.querySelectorAll('[data-hub-dot]')].map((dot, index) => {
    const rect = dot.getBoundingClientRect();
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    const path = document.querySelectorAll('[data-hub-path]')[index];
    let closest = Infinity;
    for (let sample = 0; sample <= 200; sample++) {
      const point = path.getPointAtLength(path.getTotalLength() * sample / 200).matrixTransform(path.getScreenCTM());
      closest = Math.min(closest, Math.hypot(x - point.x, y - point.y));
    }
    return closest;
  }));
  results.motion.desktopDistanceFromPathPx = await distances();
  assert.ok(results.motion.desktopDistanceFromPathPx.every(value => value < 8));
  const toggle = page.locator('[data-hub-flow-toggle]');
  await toggle.click();
  const paused = await transforms();
  await page.waitForTimeout(200);
  assert.deepEqual(await transforms(), paused);
  await toggle.click();
  await page.waitForTimeout(200);
  assert.notDeepEqual(await transforms(), paused);
  results.motion.pauseResume = true;

  await nodes.first().hover();
  await page.waitForTimeout(220);
  assert.ok(await nodes.first().evaluate(el => Math.abs(new DOMMatrix(getComputedStyle(el).transform).a - 1.05) < .01));
  await tooltip.hover();
  await page.waitForTimeout(300);
  assert.equal(await tooltip.isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await tooltip.isVisible(), false);
  results.interaction.hoverScaleAndHoverableEscapeTooltip = true;
  await nodes.nth(1).focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await tooltip.waitFor({ state: 'visible' });
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#erp-module-inventory').evaluate(el => el.open), true);
  await page.keyboard.press(' ');
  assert.equal(await page.locator('#erp-module-inventory').evaluate(el => el.open), false);
  results.interaction.keyboard = true;
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('[data-hub-map]').scrollIntoView({ behavior: 'instant', block: 'center' }); });
  await nodes.nth(2).hover();
  await tooltip.waitFor({ state: 'visible' });
  await page.waitForTimeout(220);
  assert.equal(await tooltip.isVisible(), true);
  await page.screenshot({ path: path.join(output, 'en-hub-tooltip-1440.png'), clip: await map.boundingBox() });

  await page.setViewportSize({ width: 375, height: 900 });
  await map.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  results.motion.mobileDistanceFromPathPx = await distances();
  assert.ok(results.motion.mobileDistanceFromPathPx.every(value => value < 8));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => [...document.querySelectorAll('[data-hub-dot]')].every(el => getComputedStyle(el).opacity === '0'));
  await nodes.first().hover();
  assert.equal(await nodes.first().evaluate(el => getComputedStyle(el).transform), 'none');
  results.motion.reducedMotion = true;
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await map.scrollIntoViewIfNeeded();
  await page.evaluate(() => { window.__oldHub = document.querySelector('[data-erp-hub]'); });
  await page.locator('main > .ox-page-content a').click();
  await page.waitForURL(url => url.pathname === '/' && url.hash === '#demo-projects');
  await page.waitForFunction(() => !window.__oldHub.isConnected);
  assert.equal(await page.evaluate(() => window.__oldHub.hasAttribute('data-hub-enhanced')), false);
  const oldTransforms = await page.evaluate(() => [...window.__oldHub.querySelectorAll('[data-hub-dot]')].map(el => el.getAttribute('transform')));
  await page.waitForTimeout(200);
  assert.deepEqual(await page.evaluate(() => [...window.__oldHub.querySelectorAll('[data-hub-dot]')].map(el => el.getAttribute('transform'))), oldTransforms);
  results.interaction.astroCleanup = true;
  await page.goBack();
  await page.waitForSelector('[data-hub-enhanced]');
  for (const locale of ['ru', 'ro', 'en']) {
    await page.locator(`header .ox-header-actions [data-locale-link][lang="${locale}"]`).click();
    await page.waitForFunction(lang => document.documentElement.lang === lang, locale);
    await page.waitForSelector('[data-hub-enhanced]');
    await nodes.first().click();
    assert.equal(await page.locator('[data-hub-panel][open]').count(), 1);
    results.navigation.push({ locale, onePanelPerClick: true });
  }

  const touch = await browser.newContext({ viewport: { width: 375, height: 900 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const touchPage = await touch.newPage();
  await touchPage.goto(route('ru'));
  await touchPage.waitForSelector('[data-hub-enhanced]');
  await touchPage.locator('[data-hub-node]').first().tap();
  assert.equal(await touchPage.locator('[data-hub-panel][open]').count(), 1);
  assert.equal(await touchPage.locator('[data-hub-tooltip]').isVisible(), false);
  results.interaction.emulatedTouchFirstTap = true;
  await touch.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const noJsPage = await noJs.newPage();
  await noJsPage.goto(route('ru'));
  await noJsPage.locator('[data-hub-node]').first().click();
  assert.equal(new URL(noJsPage.url()).hash, '#erp-module-finance');
  await noJsPage.locator('#erp-module-finance summary').focus();
  await noJsPage.keyboard.press('Enter');
  assert.equal(await noJsPage.locator('#erp-module-finance').evaluate(el => el.open), true);
  assert.equal(await noJsPage.locator('#erp-module-finance li').count(), 3);
  results.interaction.noJsNativeAccordion = true;
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
    results.crmRegression.push({ width, exactPixels: changedPixels === 0, changedPixels, maxChannelDelta, totalPixels });
    assert.ok(changedPixels <= totalPixels * .0001 && maxChannelDelta <= 5);
  }
  assert.deepEqual(results.errors, []);
  results.passed = true;
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ ...results, matrix: results.matrix.length }, null, 2));
