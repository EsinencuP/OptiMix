import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const runtimeRequire = createRequire(require.resolve(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright'));
const { PNG } = runtimeRequire('pngjs');
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:4321';
const site = process.env.PUBLIC_SITE_URL || 'https://opti-mix-three.vercel.app';
const output = path.resolve('docs/portfolio-2026-10-20/final-qa');
const baseline = process.argv.includes('--baseline');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const results = { pages: [], home: [], errors: [] };
const prefix = locale => locale === 'en' ? '' : `/${locale}`;
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => results.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) results.errors.push(`${response.status()} ${response.url()}`); });
  for (const locale of ['en', 'ru', 'ro']) {
    for (const width of [1280, 375]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${base}${prefix(locale)}/`);
      await page.waitForSelector('[data-demo-deck].is-ready');
      await page.evaluate(() => document.fonts.ready);
      const shotPath = path.join(output, `${locale}-home-${width}${baseline ? '-before' : ''}.png`);
      const shot = await page.screenshot({ path: shotPath, fullPage: true });
      if (baseline) continue;
      const old = PNG.sync.read(await fs.readFile(path.join(output, `${locale}-home-${width}-before.png`)));
      const current = PNG.sync.read(shot);
      assert.equal(current.width, old.width); assert.equal(current.height, old.height);
      let changedPixels = 0, maxChannelDelta = 0;
      for (let offset = 0; offset < current.data.length; offset += 4) {
        let changed = false;
        for (let channel = 0; channel < 3; channel++) {
          const delta = Math.abs(current.data[offset + channel] - old.data[offset + channel]);
          if (delta) changed = true;
          maxChannelDelta = Math.max(maxChannelDelta, delta);
        }
        if (changed) changedPixels++;
      }
      assert.ok(changedPixels <= current.width * current.height * .0001 && maxChannelDelta <= 5);
      const homeData = await page.evaluate(() => ({
        names: [...document.querySelectorAll('#demo-projects h3')].map(el => el.textContent),
        projects: [...document.querySelectorAll('.ox-deck-links .ox-button-secondary')].map(el => el.getAttribute('href')),
        demos: [...document.querySelectorAll('.ox-deck-links .ox-button:not(.ox-button-secondary)')].map(el => el.getAttribute('href')),
        crm: document.querySelector('.ox-project-all a').getAttribute('href'),
        layers: [...document.querySelectorAll('[data-deck-card]')].map(el => getComputedStyle(el).zIndex),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      assert.deepEqual(homeData.names, ['Cherryli', 'Budget', 'Aprobery', 'ERP', 'Steer', 'All-in-one CRM']);
      assert.deepEqual(homeData.layers, ['1', '2', '3', '4', '5']);
      assert.equal(homeData.overflow, false);
      assert.deepEqual(homeData.projects, ['intake', 'budget', 'approval', 'erp', 'visibility'].map(slug => `${prefix(locale)}/${slug === 'erp' ? 'portfolio' : 'solutions'}/${slug}/`));
      assert.deepEqual(homeData.demos, ['intake', 'budget', 'approval', 'erp', 'visibility'].map(slug => `${prefix(locale)}/demo/procurement/?step=${slug}`));
      assert.equal(homeData.crm, `${prefix(locale)}/portfolio/crm/`);
      const erp = page.locator('[data-deck-card="erp"]');
      await erp.locator('[data-deck-hit]').focus();
      await page.keyboard.press('Enter');
      assert.equal(await erp.evaluate(el => el.classList.contains('is-open')), true);
      assert.equal(await erp.evaluate(el => getComputedStyle(el).zIndex), '10');
      await page.keyboard.press('Enter');
      assert.equal(await erp.evaluate(el => el.classList.contains('is-flipped')), true);
      await page.evaluate(() => { window.__oldErpCard = document.querySelector('[data-deck-card="erp"]'); });
      await erp.locator('.ox-deck-links .ox-button-secondary img').click();
      await page.waitForURL(`${base}${prefix(locale)}/portfolio/erp/`);
      assert.equal(await page.locator('[data-erp-module]').count(), 7);
      assert.equal(await page.evaluate(() => window.__oldErpCard.classList.contains('is-flipped')), false);
      await page.goBack();
      await page.waitForSelector('[data-demo-deck].is-ready');
      await page.locator('.ox-project-all a').click();
      await page.waitForURL(`${base}${prefix(locale)}/portfolio/crm/`);
      await page.waitForSelector('[data-workflow-enhanced]');
      results.home.push({ locale, width, ...homeData, changedPixels, maxChannelDelta, projectNavigationAndDeckCleanup: true });

      for (const slug of ['crm', 'erp']) {
        const pathname = `${prefix(locale)}/portfolio/${slug}/`;
        const response = await page.goto(base + pathname);
        await page.waitForSelector(slug === 'crm' ? '[data-workflow-enhanced]' : '[data-hub-enhanced]');
        await page.evaluate(() => document.fonts.ready);
        const row = await page.evaluate(() => ({
          lang: document.documentElement.lang, title: document.title,
          description: document.querySelector('meta[name="description"]').content,
          canonical: [...document.querySelectorAll('link[rel="canonical"]')].map(el => el.href),
          robots: document.querySelector('meta[name="robots"]').content,
          og: Object.fromEntries([...document.querySelectorAll('meta[property^="og:"]')].map(el => [el.getAttribute('property'), el.content])),
          twitter: Object.fromEntries([...document.querySelectorAll('meta[name^="twitter:"]')].map(el => [el.name, el.content])),
          alternates: [...document.querySelectorAll('link[rel="alternate"]')].map(el => ({ lang: el.hreflang, href: el.href })),
          landmarks: ['h1', 'main', 'header', 'footer'].map(selector => document.querySelectorAll(selector).length),
          overflow: document.documentElement.scrollWidth > innerWidth,
          innerOverflow: [...document.querySelectorAll('main *')].filter(el => !el.classList.contains('sr-only') && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1).map(el => el.className),
          missingImages: [...document.images].filter(el => !el.complete || !el.naturalWidth).length,
          fonts: performance.getEntriesByType('resource').filter(entry => /\.(ttf|woff2)$/.test(new URL(entry.name).pathname)).map(entry => new URL(entry.name).pathname),
        }));
        assert.equal(response.status(), 200); assert.equal(row.lang, locale);
        if (locale === 'en') assert.equal(row.title, slug === 'crm' ? 'CRM Platform — OptiMix Portfolio' : 'ERP System — OptiMix Portfolio');
        assert.ok(row.description.length > 50);
        assert.deepEqual(row.canonical, [new URL(pathname, site).href]);
        assert.equal(row.robots, 'noindex, nofollow');
        assert.equal(row.og['og:title'], row.title); assert.equal(row.og['og:description'], row.description);
        assert.equal(row.og['og:url'], row.canonical[0]); assert.equal(row.og['og:type'], 'website');
        assert.equal(row.twitter['twitter:title'], row.title); assert.equal(row.twitter['twitter:description'], row.description);
        assert.deepEqual(row.alternates, ['en', 'ro', 'ru', 'x-default'].map(lang => ({ lang, href: new URL(`${prefix(lang === 'x-default' ? 'en' : lang)}/portfolio/${slug}/`, site).href })));
        assert.deepEqual(row.landmarks, [1, 1, 1, 1]); assert.equal(row.overflow, false);
        assert.deepEqual(row.innerOverflow, []); assert.equal(row.missingImages, 0);
        assert.deepEqual(row.fonts, ['/fonts/redesign/Roboto-Variable.woff2']);
        await page.screenshot({ path: path.join(output, `${locale}-${slug}-${width}.png`), fullPage: true });
        if (slug === 'crm') {
          for (let index = 0; index < 5; index++) {
            await page.locator('[data-workflow-tab]').nth(index).click();
            assert.equal(await page.locator('[data-workflow-tab]').nth(index).getAttribute('aria-selected'), 'true');
            assert.equal(await page.locator('[data-workflow-panel]:visible').count(), 1);
          }
          assert.equal(await page.locator('[data-demo-value="email"]').inputValue(), 'admin@demo.com');
          assert.equal(await page.locator('[data-demo-value="password"]').inputValue(), 'admin123');
        } else {
          for (let index = 0; index < 6; index++) {
            const node = page.locator('[data-hub-node]').nth(index);
            await node.hover(); await page.locator('[data-hub-tooltip]').waitFor({ state: 'visible' });
            await node.click(); assert.equal(await page.locator('[data-hub-panel][open]').count(), 1);
          }
          assert.equal(await page.locator('[data-erp-module]').count(), 7);
        }
        if (width === 375) {
          await page.locator('.ox-menu-trigger').click();
          assert.equal(await page.locator('#ox-mobile-nav').evaluate(el => el.matches(':popover-open')), true);
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#ox-mobile-nav').evaluate(el => el.matches(':popover-open')), false);
        }
        await page.locator('footer [data-locale-link][lang="ru"]').click();
        await page.waitForFunction(() => document.documentElement.lang === 'ru');
        assert.equal(new URL(page.url()).pathname, `/ru/portfolio/${slug}/`);
        results.pages.push({ locale, width, slug, ...row, interactionsPassed: true });
      }
    }
  }
  assert.deepEqual(results.errors, []);
  results.passed = true;
} finally {
  if (!baseline) await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser.close();
}
console.log(JSON.stringify(baseline ? { baselineSaved: true } : { ...results, pages: results.pages.length, home: results.home.length }, null, 2));
