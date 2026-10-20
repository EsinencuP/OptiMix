import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:4321';
const output = path.resolve('docs/portfolio-2026-10-20/crm-workflow-qa');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const results = { matrix: [], interaction: {}, motion: {}, navigation: [], errors: [] };

try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) results.errors.push(`${response.status()} ${response.url()}`); });
  await page.addInitScript(() => {
    window.__workflowIntervals = new Map();
    window.__workflowTicks = [];
    const originalSet = window.setInterval.bind(window);
    const originalClear = window.clearInterval.bind(window);
    window.setInterval = (callback, delay, ...args) => {
      const started = performance.now();
      const id = originalSet(() => {
        if (delay === 4000) window.__workflowTicks.push(performance.now() - started);
        callback(...args);
      }, delay);
      if (delay === 4000) window.__workflowIntervals.set(id, started);
      return id;
    };
    window.clearInterval = id => { window.__workflowIntervals.delete(id); originalClear(id); };
    window.__lineFrames = [];
    window.__panelFrames = [];
    new MutationObserver(records => records.forEach(({ target }) => {
      if (target instanceof SVGElement && target.matches('[data-workflow-route]') && target.style.strokeDashoffset) window.__lineFrames.push(parseFloat(target.style.strokeDashoffset));
      if (target instanceof HTMLElement && target.matches('[data-workflow-panel]') && target.style.opacity) window.__panelFrames.push(Number(target.style.opacity));
    })).observe(document, { subtree: true, attributes: true, attributeFilter: ['style'] });
  });

  const tabs = page.locator('[data-workflow-tab]');
  const root = page.locator('[data-crm-workflow]');
  for (const locale of ['en', 'ru', 'ro']) {
    for (const width of [1440, 1280, 1024, 768, 390, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(`${base}${locale === 'en' ? '' : `/${locale}`}/portfolio/crm/`);
      await page.waitForSelector('[data-workflow-enhanced]');
      await page.evaluate(() => document.fonts.ready);
      const row = await root.evaluate(el => ({
        lang: document.documentElement.lang,
        tabs: el.querySelectorAll('[role=tab]').length,
        visiblePanels: [...el.querySelectorAll('[role=tabpanel]')].filter(panel => !panel.hidden).length,
        orientation: el.querySelector('[role=tablist]').getAttribute('aria-orientation'),
        overflow: document.documentElement.scrollWidth > innerWidth,
        innerOverflow: [...el.querySelectorAll('*')].filter(node => !node.classList.contains('sr-only') && node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1).map(node => node.className),
        missingImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).length,
        featureCards: document.querySelectorAll('.ox-feature-card').length,
      }));
      assert.equal(response.status(), 200);
      assert.equal(row.lang, locale);
      assert.equal(row.tabs, 5);
      assert.equal(row.visiblePanels, 1);
      assert.equal(row.orientation, width <= 640 ? 'vertical' : 'horizontal');
      assert.equal(row.overflow, false);
      assert.deepEqual(row.innerOverflow, []);
      assert.equal(row.missingImages, 0);
      assert.equal(row.featureCards, 6);
      for (let index = 0; index < 5; index++) {
        await tabs.nth(index).click();
        assert.equal(await root.getAttribute('data-active-step'), String(index));
        assert.equal(await tabs.nth(index).getAttribute('aria-selected'), 'true');
        assert.equal(await page.locator('[data-workflow-panel]:not([hidden])').count(), 1);
      }
      results.matrix.push({ width, status: response.status(), ...row, allFiveTabsPassed: true });
      if ([1440, 375].includes(width) || (locale === 'ro' && width === 320)) {
        await tabs.first().click();
        await root.screenshot({ path: path.join(output, `${locale}-workflow-${width}.png`) });
      }
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base + '/portfolio/crm/');
  await page.waitForSelector('[data-workflow-enhanced]');
  await root.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__lineFrames.some(value => value > 0 && value < window.__lineFrames[0]));
  await page.waitForFunction(() => [...document.querySelectorAll('[data-workflow-route]')].every(el => !el.style.strokeDashoffset));
  results.motion.line = await page.evaluate(() => ({ first: window.__lineFrames[0], intermediate: window.__lineFrames.find(value => value > 0 && value < window.__lineFrames[0]), clearedAfterCompletion: [...document.querySelectorAll('[data-workflow-route]')].every(el => !el.style.strokeDashoffset) }));
  await page.waitForFunction(() => document.querySelector('[data-crm-workflow]').dataset.activeStep === '1', null, { timeout: 5000 });
  results.interaction.autoAdvanced = true;
  await page.waitForTimeout(3300);
  await tabs.nth(3).click();
  await page.waitForTimeout(1000);
  assert.equal(await root.getAttribute('data-active-step'), '3');
  await page.waitForFunction(() => document.querySelector('[data-crm-workflow]').dataset.activeStep === '4', null, { timeout: 3500 });
  results.interaction.clickResetFourSecondTimer = true;
  await page.waitForFunction(() => document.querySelector('[data-crm-workflow]').dataset.activeStep === '0', null, { timeout: 4500 });
  results.interaction.wrapsToFirst = true;
  const toggle = page.locator('[data-workflow-toggle]');
  await toggle.click();
  await page.waitForTimeout(4200);
  assert.equal(await root.getAttribute('data-active-step'), '0');
  assert.equal(await page.evaluate(() => window.__workflowIntervals.size), 0);
  results.interaction.pause = true;
  await toggle.click();
  await page.waitForFunction(() => document.querySelector('[data-crm-workflow]').dataset.activeStep === '1', null, { timeout: 4500 });
  results.interaction.resume = true;
  results.interaction.tickElapsedMs = await page.evaluate(() => window.__workflowTicks);
  results.motion.panelFadeObserved = await page.evaluate(() => window.__panelFrames.some(value => value > 0 && value < 1));
  assert.equal(results.motion.panelFadeObserved, true);

  await tabs.nth(2).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await root.getAttribute('data-active-step'), '3');
  assert.equal(await tabs.nth(3).evaluate(el => el === document.activeElement), true);
  assert.equal(await page.evaluate(() => window.__workflowIntervals.size), 0);
  await page.keyboard.press('Home');
  assert.equal(await root.getAttribute('data-active-step'), '0');
  await page.keyboard.press('End');
  assert.equal(await root.getAttribute('data-active-step'), '4');
  await page.keyboard.press(' ');
  assert.equal(await root.getAttribute('data-active-step'), '4');
  results.interaction.keyboard = true;
  await page.waitForFunction(() => [...document.querySelectorAll('[data-workflow-segment]')].every(el => parseFloat(el.style.strokeDashoffset) === 0));
  await root.screenshot({ path: path.join(output, 'en-workflow-step-05.png') });

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => window.__workflowIntervals.size === 0);
  await tabs.nth(2).click();
  assert.equal(await page.locator('[data-workflow-panel]:not([hidden])').evaluate(el => getComputedStyle(el).opacity), '1');
  assert.equal(await toggle.isVisible(), false);
  results.interaction.reducedMotionManualOnly = true;
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.ox-crm-hero-copy').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__workflowIntervals.size === 0);
  results.interaction.offscreenPaused = true;
  await root.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__workflowIntervals.size === 1);
  await page.evaluate(() => { window.__previousWorkflow = document.querySelector('[data-crm-workflow]'); });
  await page.locator('main > .ox-page-content a').click();
  await page.waitForURL(url => url.pathname === '/' && url.hash === '#demo-projects');
  await page.waitForFunction(() => !window.__previousWorkflow.isConnected);
  assert.equal(await page.evaluate(() => window.__workflowIntervals.size), 0);
  assert.equal(await page.evaluate(() => window.__previousWorkflow.hasAttribute('data-workflow-enhanced')), false);
  results.interaction.astroCleanup = true;
  await page.goBack();
  await page.waitForSelector('[data-workflow-enhanced]');
  await root.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => window.__workflowIntervals.size === 1);

  for (const locale of ['ru', 'ro', 'en']) {
    await page.locator(`header .ox-header-actions [data-locale-link][lang="${locale}"]`).click();
    await page.waitForFunction(lang => document.documentElement.lang === lang, locale);
    await page.waitForSelector('[data-workflow-enhanced]');
    await root.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => window.__workflowIntervals.size === 1);
    results.navigation.push({ locale, tabs: await tabs.count(), timers: await page.evaluate(() => window.__workflowIntervals.size) });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 900 });
  await tabs.first().focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await root.getAttribute('data-active-step'), '1');
  results.interaction.mobileKeyboard = true;

  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(base + '/ru/portfolio/crm/');
  assert.equal(await noJsPage.locator('[data-workflow-panel]:visible').count(), 5);
  await noJsPage.locator('[data-workflow-tab]').last().click();
  assert.equal(new URL(noJsPage.url()).hash, '#crm-workflow-panel-4');
  results.interaction.noJsAllStagesAccessible = true;
  await noJsPage.screenshot({ path: path.join(output, 'ru-workflow-375-no-js.png'), fullPage: true });
  await noJsContext.close();
  assert.deepEqual(results.errors, []);
  results.passed = true;
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ ...results, matrix: results.matrix.length }, null, 2));
