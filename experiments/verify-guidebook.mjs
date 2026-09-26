import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const base = 'http://127.0.0.1:4321';
const result = { failures: [], visibleProblem: {}, hero: {}, header: {}, menu: {}, relay: {}, layout: [], touchTargets: [], metadata: {}, metadataPages: [] };

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2100);
result.visibleProblem.jsEnabled = await page.evaluate(() => ['.recognition-heading .section-title', '.relay li'].every((selector) => {
  const style = getComputedStyle(document.querySelector(selector));
  return style.visibility === 'visible' && Number(style.opacity) === 1;
}));
result.hero.visibleWithin2s = await page.evaluate(() => ['.hero-title-line', '.hero-actions', '.route-preview li'].every((selector) => {
  const style = getComputedStyle(document.querySelector(selector));
  return style.visibility === 'visible' && Number(style.opacity) === 1;
}));
result.header.initial = await page.evaluate(() => ({ position: getComputedStyle(document.querySelector('.site-header')).position, scrolled: document.querySelector('.site-header').classList.contains('is-scrolled') }));
await page.evaluate(() => window.scrollTo(0, 700));
await page.waitForTimeout(400);
result.header.scrolled = await page.evaluate(() => ({ scrolled: document.querySelector('.site-header').classList.contains('is-scrolled'), backdrop: getComputedStyle(document.querySelector('.site-header')).backdropFilter }));
await page.locator('.relay li').first().scrollIntoViewIfNeeded();
const relay = page.locator('.relay li').first();
result.relay.before = await relay.evaluate((node) => getComputedStyle(node).boxShadow);
await relay.hover();
await page.waitForTimeout(250);
result.relay.after = await relay.evaluate((node) => getComputedStyle(node).boxShadow);
await page.close();

const noJs = await browser.newContext({ javaScriptEnabled: false });
const staticPage = await noJs.newPage();
await staticPage.goto(base + '/', { waitUntil: 'load' });
result.visibleProblem.jsDisabled = await staticPage.evaluate(() => ['.recognition-heading .section-title', '.relay li'].every((selector) => {
  const style = getComputedStyle(document.querySelector(selector));
  return style.visibility === 'visible' && Number(style.opacity) === 1;
}));
await noJs.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(base + '/', { waitUntil: 'networkidle' });
await mobile.locator('.mobile-menu-trigger').click();
result.menu.opened = await mobile.locator('.mobile-nav-popover').evaluate((node) => node.matches(':popover-open'));
result.menu.transition = await mobile.locator('.mobile-nav-popover').evaluate((node) => getComputedStyle(node).transitionProperty);
await mobile.mouse.click(8, 500);
result.menu.closedOutside = await mobile.locator('.mobile-nav-popover').evaluate((node) => !node.matches(':popover-open'));
await mobile.locator('.mobile-menu-trigger').click();
await mobile.locator('.mobile-nav-popover a[href="#workflow"]').click();
result.menu.closedAnchor = await mobile.locator('.mobile-nav-popover').evaluate((node) => !node.matches(':popover-open'));
await mobile.close();

for (const width of [1440, 768, 390]) {
  const check = await browser.newPage({ viewport: { width, height: 900 } });
  await check.goto(base + '/', { waitUntil: 'networkidle' });
  result.layout.push(await check.evaluate(() => ({
    width: innerWidth,
    relayColumns: getComputedStyle(document.querySelector('.relay')).gridTemplateColumns.split(' ').length,
    documentWidth: document.documentElement.scrollWidth,
  })));
  await check.close();
}

for (const route of ['/', '/ro/', '/ru/', '/contact/', '/ro/contact/', '/ru/contact/', '/privacy/', '/ro/privacy/', '/ru/privacy/']) {
  for (const width of [1280, 390, 320]) {
    const check = await browser.newPage({ viewport: { width, height: 844 } });
    await check.goto(base + route, { waitUntil: 'networkidle' });
    result.touchTargets.push(await check.evaluate(() => ({
    route: location.pathname,
    width: innerWidth,
    small: [...document.querySelectorAll('a[href],button:not(:disabled)')].filter((node) => {
      if (node.classList.contains('skip-link')) return false;
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return style.visibility === 'visible' && style.display !== 'none' && rect.width && rect.height && (rect.width < 43.95 || rect.height < 43.95);
    }).map((node) => ({ text: node.textContent?.trim().slice(0, 30), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
    })));
    if (route === '/' && width === 390) result.metadata = await check.evaluate(() => ({
    icon: document.querySelector('link[rel="icon"]')?.getAttribute('href'),
    ogTitle: document.querySelector('meta[property="og:title"]')?.content,
    ogDescription: document.querySelector('meta[property="og:description"]')?.content,
    ogLocale: document.querySelector('meta[property="og:locale"]')?.content,
    imagePreload: Boolean(document.querySelector('link[rel="preload"][as="image"]')),
    fontPreload: Boolean(document.querySelector('link[rel="preload"][as="font"]')),
    transition: Boolean(document.querySelector('meta[name="astro-view-transitions-enabled"]')),
    }));
    if (width === 390) result.metadataPages.push(await check.evaluate(() => ({
      route: location.pathname,
      icon: document.querySelector('link[rel="icon"]')?.getAttribute('href'),
      title: document.querySelector('meta[property="og:title"]')?.content,
      description: document.querySelector('meta[property="og:description"]')?.content,
      type: document.querySelector('meta[property="og:type"]')?.content,
      locale: document.querySelector('meta[property="og:locale"]')?.content,
    })));
    await check.close();
  }
}

const inner = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await inner.goto(base + '/contact/', { waitUntil: 'networkidle' });
await inner.evaluate(() => window.scrollTo(0, 500));
await inner.waitForTimeout(100);
result.header.inner = await inner.evaluate(() => ({ position: getComputedStyle(document.querySelector('.site-header')).position, scrolled: document.querySelector('.site-header').classList.contains('is-scrolled') }));
await inner.close();
await browser.close();

if (!result.visibleProblem.jsEnabled || !result.visibleProblem.jsDisabled) result.failures.push('Problem content hidden');
if (!result.hero.visibleWithin2s) result.failures.push('Hero elements hidden after load');
if (result.header.initial.position !== 'fixed' || !result.header.scrolled.scrolled || !result.header.scrolled.backdrop.includes('blur')) result.failures.push('Home header state');
if (result.header.inner.position !== 'sticky' || !result.header.inner.scrolled) result.failures.push('Inner header state');
if (!result.menu.opened || !result.menu.closedOutside || !result.menu.closedAnchor || !result.menu.transition.includes('opacity')) result.failures.push('Mobile popover behavior');
if (result.relay.before === result.relay.after) result.failures.push('Relay hover');
if (result.layout.map((item) => item.relayColumns).join(',') !== '5,2,1') result.failures.push('Relay container layout');
if (result.touchTargets.some((item) => item.small.length)) result.failures.push('Touch targets');
if (!result.metadata.icon || !result.metadata.ogTitle || !result.metadata.ogDescription || !result.metadata.ogLocale || !result.metadata.imagePreload || !result.metadata.fontPreload || !result.metadata.transition) result.failures.push('Metadata');
if (result.metadataPages.length !== 9 || result.metadataPages.some((page) => !page.icon || !page.title || !page.description || page.type !== 'website' || page.locale !== (page.route.startsWith('/ro/') ? 'ro_RO' : page.route.startsWith('/ru/') ? 'ru_RU' : 'en_GB'))) result.failures.push('Localized Open Graph metadata');
console.log(JSON.stringify(result, null, 2));
if (result.failures.length) process.exitCode = 1;
