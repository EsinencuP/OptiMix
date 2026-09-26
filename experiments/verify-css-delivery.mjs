import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.route('**/home-deferred.generated*.css', async (route) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await route.continue();
});

await page.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded' });
const snapshot = () => page.evaluate(() => {
  const section = document.querySelector('.recognition');
  const deferred = [...document.querySelectorAll('link[rel="stylesheet"]')].find((link) => link.href.includes('home-deferred'));
  return {
    relayDisplay: getComputedStyle(document.querySelector('.relay')).display,
    sectionHeight: section.getBoundingClientRect().height,
    sectionBackground: getComputedStyle(section).backgroundColor,
    deferredMedia: deferred?.media,
  };
});
const early = await snapshot();
await page.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => link.href.includes('home-deferred') && link.media === 'all'));
const late = await snapshot();

const anchorChecks = await Promise.all(['/', '/ro/', '/ru/'].flatMap((route) => ['workflow', 'approach'].map(async (id) => {
  const anchorPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await anchorPage.route('**/home-deferred.generated*.css', async (request) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await request.continue();
  });
  await anchorPage.goto(`http://127.0.0.1:4321${route}#${id}`, { waitUntil: 'domcontentloaded' });
  await anchorPage.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => link.href.includes('home-deferred') && link.media === 'all'));
  await anchorPage.waitForTimeout(100);
  const top = await anchorPage.locator(`#${id}`).evaluate((node) => node.getBoundingClientRect().top);
  await anchorPage.close();
  return { route, id, top: Math.round(top) };
})));
const manualScroll = (async () => {
  const manualPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await manualPage.route('**/home-deferred.generated*.css', async (request) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await request.continue();
  });
  await manualPage.goto('http://127.0.0.1:4321/#workflow', { waitUntil: 'domcontentloaded' });
  await manualPage.waitForTimeout(700);
  await manualPage.mouse.wheel(0, -10000);
  await manualPage.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => link.href.includes('home-deferred') && link.media === 'all'));
  await manualPage.waitForTimeout(100);
  const scrollY = await manualPage.evaluate(() => window.scrollY);
  await manualPage.close();
  return { scrollY: Math.round(scrollY) };
})();
const clickedAnchor = (async () => {
  const clickedPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await clickedPage.route('**/home-deferred.generated*.css', async (request) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await request.continue();
  });
  await clickedPage.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded' });
  await clickedPage.locator('.mobile-menu-trigger').click();
  await clickedPage.locator('.mobile-nav-popover a[href="#workflow"]').click();
  await clickedPage.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => link.href.includes('home-deferred') && link.media === 'all'));
  await clickedPage.waitForTimeout(100);
  const state = await clickedPage.locator('#workflow').evaluate((node) => ({ top: node.getBoundingClientRect().top, hash: location.hash, interrupted: document.documentElement.dataset.anchorScrollInterrupted }));
  await clickedPage.close();
  return { ...state, top: Math.round(state.top) };
})();
const [manual, clicked] = await Promise.all([manualScroll, clickedAnchor]);
await browser.close();

const failures = [];
if (early.deferredMedia !== 'print' || late.deferredMedia !== 'all') failures.push('Deferred stylesheet loading');
if (early.relayDisplay !== 'grid' || late.relayDisplay !== 'grid') failures.push('Relay layout before or after loading');
if (Math.abs(early.sectionHeight - late.sectionHeight) > 1) failures.push('Problem section layout shift');
if (early.sectionBackground !== late.sectionBackground) failures.push('Problem section background flash');
if (anchorChecks.some((check) => check.top < 0 || check.top > 150)) failures.push('Anchor position after deferred CSS');
if (manual.scrollY > 100) failures.push('Manual scroll overridden by anchor correction');
if (clicked.top < 0 || clicked.top > 150) failures.push('Clicked anchor position after deferred CSS');
console.log(JSON.stringify({ delayMs: 3000, early, late, anchorChecks, manual, clicked, failures }, null, 2));
if (failures.length) process.exitCode = 1;
