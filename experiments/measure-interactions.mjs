import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const results = [];

for (const route of ['/', '/ro/', '/ru/']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.__interactionEvents = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.interactionId) window.__interactionEvents.push({ name: entry.name, duration: entry.duration, interactionId: entry.interactionId });
      }
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  await page.goto(`http://127.0.0.1:4321${route}`, { waitUntil: 'networkidle' });
  await page.locator('.mobile-menu-trigger').click();
  await page.waitForTimeout(250);
  await page.mouse.click(8, 500);
  await page.locator('.mobile-menu-trigger').click();
  await page.locator('.mobile-nav-popover a[href="#workflow"]').click();
  await page.waitForTimeout(500);
  const events = await page.evaluate(() => window.__interactionEvents);
  results.push({ route, maxEventDurationMs: Math.max(0, ...events.map((item) => item.duration)), events });
  await page.close();
}

await browser.close();
console.log(JSON.stringify({ methodology: 'Playwright Chrome mobile viewport with 4x CPU throttle; Event Timing API, three menu and anchor interactions per locale. Lab proxy only, not field INP.', results }, null, 2));
if (results.some((item) => item.maxEventDurationMs > 200)) process.exitCode = 1;
