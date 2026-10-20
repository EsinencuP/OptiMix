import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:4321';
const output = path.resolve('docs/portfolio-2026-10-20/crm-modules-cta-qa');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const result = { matrix: [], clipboard: [], navigation: [], regression: {}, errors: [] };

try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base });
  await context.addInitScript(() => {
    window.__copyWrites = [];
    window.__nativeCopy = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = text => { window.__copyWrites.push(text); return window.__nativeCopy(text); };
  });
  const page = await context.newPage();
  page.on('pageerror', error => result.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) result.errors.push(`${response.status()} ${response.url()}`); });
  const copy = field => page.locator(`[data-demo-copy="${field}"]`);
  const route = locale => `${base}${locale === 'en' ? '' : `/${locale}`}/portfolio/crm/`;

  for (const locale of ['en', 'ru', 'ro']) {
    for (const width of [1440, 1280, 1024, 768, 390, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(route(locale));
      await page.waitForSelector('[data-demo-copy]:not([hidden])');
      await page.evaluate(() => document.fonts.ready);
      const row = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        h1: document.querySelectorAll('h1').length,
        modules: document.querySelectorAll('.ox-crm-module-card').length,
        columns: getComputedStyle(document.querySelector('.ox-crm-module-grid')).gridTemplateColumns.split(' ').length,
        features: document.querySelectorAll('.ox-feature-card').length,
        credentials: [...document.querySelectorAll('[data-demo-value]')].map(el => ({ value: el.value, readonly: el.readOnly })),
        overflow: document.documentElement.scrollWidth > innerWidth,
        innerOverflow: [...document.querySelectorAll('main *')].filter(el => !el.classList.contains('sr-only') && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.className),
        missingImages: [...document.images].filter(el => !el.complete || !el.naturalWidth).length,
        ctaBackground: getComputedStyle(document.querySelector('.ox-crm-cta')).backgroundColor,
        ctaButtons: [...document.querySelectorAll('.ox-crm-cta .ox-button')].map(el => ({ href: el.href, background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color, iconFilter: getComputedStyle(el.querySelector('img')).filter })),
      }));
      assert.equal(response.status(), 200);
      assert.equal(row.lang, locale);
      assert.equal(row.h1, 1);
      assert.equal(row.modules, 6);
      assert.equal(row.features, 6);
      assert.equal(row.columns, width > 960 ? 3 : width > 640 ? 2 : 1);
      assert.deepEqual(row.credentials, [{ value: 'admin@demo.com', readonly: true }, { value: 'admin123', readonly: true }]);
      assert.equal(row.overflow, false);
      assert.deepEqual(row.innerOverflow, []);
      assert.equal(row.missingImages, 0);
      assert.equal(row.ctaBackground, 'rgb(6, 52, 38)');
      assert.deepEqual(row.ctaButtons.map(button => button.href), ['https://crm-portfolio-omega.vercel.app/', 'https://github.com/EsinencuP/crm-portfolio']);
      assert.ok(row.ctaButtons.every(button => button.background === 'rgb(255, 255, 255)' && button.color === 'rgb(6, 52, 38)' && button.iconFilter === 'none'));
      result.matrix.push({ width, status: response.status(), ...row });
      if ([1440, 375].includes(width) || (locale === 'ro' && width === 320)) {
        await page.screenshot({ path: path.join(output, `${locale}-crm-${width}.png`), fullPage: true });
        await page.locator('[data-crm-demo-access]').screenshot({ path: path.join(output, `${locale}-access-${width}.png`) });
        await page.locator('.ox-crm-cta').screenshot({ path: path.join(output, `${locale}-cta-${width}.png`) });
        if (width === 1440) await page.locator('.ox-crm-modules').screenshot({ path: path.join(output, `${locale}-modules-${width}.png`) });
      }
    }
    for (const [field, value] of [['email', 'admin@demo.com'], ['password', 'admin123']]) {
      await copy(field).click();
      await page.waitForSelector('[data-copy-state="success"]');
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), value);
      assert.equal(await copy(field).evaluate(el => el === document.activeElement), true);
      result.clipboard.push({ locale, field, realClipboardMatches: true, status: await page.locator('[data-copy-status]').innerText() });
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route('en'));
  for (let index = 0; index < 5; index++) {
    await page.locator('[data-workflow-tab]').nth(index).click();
    assert.equal(await page.locator('[data-workflow-panel]:not([hidden])').count(), 1);
    assert.equal(await page.locator('[data-demo-value="email"]').inputValue(), 'admin@demo.com');
  }
  result.regression.workflowAndCredentials = true;
  for (const locale of ['ru', 'ro', 'en']) {
    const before = await page.evaluate(() => window.__copyWrites.length);
    await page.locator(`header .ox-header-actions [data-locale-link][lang="${locale}"]`).click();
    await page.waitForFunction(lang => document.documentElement.lang === lang, locale);
    await page.waitForSelector('[data-demo-copy]:not([hidden])');
    await copy('email').click();
    await page.waitForSelector('[data-copy-state="success"]');
    assert.equal(await page.evaluate(() => window.__copyWrites.length), before + 1);
    result.navigation.push({ locale, oneWritePerClick: true });
  }

  await page.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new DOMException('Denied', 'NotAllowedError')); });
  await copy('password').click();
  await page.waitForSelector('[data-copy-state="manual"]');
  const fallback = await page.locator('[data-demo-value="password"]').evaluate(el => ({ focused: el === document.activeElement, selected: el.value.slice(el.selectionStart, el.selectionEnd) }));
  assert.deepEqual(fallback, { focused: true, selected: 'admin123' });
  assert.equal(await copy('password').isEnabled(), true);
  result.regression.permissionDeniedFallback = true;
  await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }); });
  await copy('email').click();
  assert.equal(await page.locator('[data-demo-value="email"]').evaluate(el => el.value.slice(el.selectionStart, el.selectionEnd)), 'admin@demo.com');
  result.regression.unavailableClipboardFallback = true;

  await page.goto(route('en'));
  await page.evaluate(() => {
    window.__oldAccess = document.querySelector('[data-crm-demo-access]');
    navigator.clipboard.writeText = () => new Promise(resolve => { window.__resolveCopy = resolve; });
  });
  await copy('email').click();
  assert.equal(await copy('email').isDisabled(), true);
  await page.locator('header .ox-header-actions [lang="ru"]').click();
  await page.waitForFunction(() => document.documentElement.lang === 'ru' && !window.__oldAccess.isConnected);
  await page.waitForSelector('[data-demo-copy]:not([hidden])');
  await page.evaluate(() => window.__resolveCopy());
  assert.equal(await page.locator('[data-copy-status]').innerText(), '');
  assert.equal(await page.evaluate(() => window.__oldAccess.querySelector('[data-copy-status]').textContent), '');
  assert.equal(await page.evaluate(() => [...window.__oldAccess.querySelectorAll('[data-demo-copy]')].every(el => el.hidden)), true);
  result.regression.pendingWriteAstroCleanup = true;

  await page.goto(route('en'));
  await copy('password').focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-copy-state="success"]');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'admin123');
  const ctaLink = page.locator('.ox-crm-cta .ox-button').first();
  await ctaLink.focus();
  assert.equal(await ctaLink.evaluate(el => getComputedStyle(el).outlineColor), 'rgb(255, 255, 255)');
  result.regression.keyboardCopyAndCtaFocus = true;

  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(route('ru'));
  assert.equal(await noJsPage.locator('[data-demo-copy]:visible').count(), 0);
  assert.equal(await noJsPage.locator('[data-demo-value]:visible').count(), 2);
  assert.equal(await noJsPage.locator('.ox-crm-module-card:visible').count(), 6);
  await noJsPage.locator('[data-demo-value="email"]').click();
  await noJsPage.keyboard.press('ControlOrMeta+A');
  assert.equal(await noJsPage.locator('[data-demo-value="email"]').evaluate(el => el.value.slice(el.selectionStart, el.selectionEnd)), 'admin@demo.com');
  result.regression.noJsManualSelection = true;
  await noJsPage.screenshot({ path: path.join(output, 'ru-crm-375-no-js.png'), fullPage: true });
  await noJsContext.close();
  assert.deepEqual(result.errors, []);
  result.passed = true;
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ ...result, matrix: result.matrix.length }, null, 2));
