import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const base = 'http://127.0.0.1:4321';
const output = path.resolve('artifacts/ia-2026-09-26');
await fs.mkdir(output, { recursive: true });
const results = [];
const errors = [];

for (const locale of ['en', 'ro', 'ru']) {
  for (const pageKind of ['home', 'contact', 'privacy']) {
    const suffix = pageKind === 'home' ? '' : `${pageKind}/`;
    const route = `${locale === 'en' ? '/' : `/${locale}/`}${suffix}`;
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      page.on('pageerror', (error) => errors.push(`${route} ${width}: ${error.message}`));
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      const data = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        title: document.title,
        heading: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
        activeLanguage: document.querySelector('.language-switch a[aria-current="page"]')?.getAttribute('lang'),
        localBriefBuilder: Boolean(document.querySelector('[data-brief-builder]')),
        submitForm: Boolean(document.querySelector('form')),
        hasHeader: Boolean(document.querySelector('.site-header')),
        hasFooter: Boolean(document.querySelector('.site-footer')),
      }));
      data.zoomOverflow = await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%';
        return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth;
      });
      await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
      results.push({ route, width, status: response.status(), ...data });
      if (width === 390 && ['/', '/ro/', '/ru/', '/contact/'].includes(route)) {
        await page.screenshot({ path: path.join(output, `${route.replaceAll('/', '-') || 'en'}-390.png`), fullPage: true });
      }
      if (width === 1440 && ['/', '/ro/', '/ru/', '/contact/'].includes(route)) {
        await page.screenshot({ path: path.join(output, `${route.replaceAll('/', '-') || 'en'}-1440.png`), fullPage: true });
      }
      await page.close();
    }
  }
}

const navigation = await browser.newPage({ viewport: { width: 390, height: 844 } });
await navigation.goto(base + '/ro/contact/', { waitUntil: 'networkidle' });
await navigation.locator('.mobile-menu-trigger').click();
const mobileMenuVisible = await navigation.locator('.mobile-nav-popover').isVisible();
await navigation.evaluate(() => { window.__clientNavigationProbe = 'preserved'; });
await navigation.locator('.mobile-languages a[lang="ru"]').click();
await navigation.waitForURL('**/ru/contact/');
const languageTarget = new URL(navigation.url()).pathname;
const clientNavigation = await navigation.evaluate(() => window.__clientNavigationProbe === 'preserved');
await navigation.close();
await browser.close();

const failures = results.filter((item) => item.status !== 200 || item.lang !== (item.route.startsWith('/ro/') ? 'ro' : item.route.startsWith('/ru/') ? 'ru' : 'en') || item.horizontalOverflow > 1 || item.zoomOverflow > 1 || item.activeLanguage !== item.lang || !item.hasHeader || !item.hasFooter || (item.route.includes('contact') && (!item.localBriefBuilder || item.submitForm)));
if (!mobileMenuVisible || languageTarget !== '/ru/contact/' || !clientNavigation) failures.push({ mobileMenuVisible, languageTarget, clientNavigation });
if (errors.length) failures.push(...errors);
console.log(JSON.stringify({ count: results.length, failures, results }, null, 2));
if (failures.length) process.exitCode = 1;
