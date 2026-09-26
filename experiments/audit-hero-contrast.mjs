import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const base = 'http://127.0.0.1:4321';
const results = [];

for (const route of ['/', '/ro/', '/ru/']) {
  for (const width of [320, 390, 768, 1440, 1600, 1920, 2560]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const targets = await page.evaluate(() => [...document.querySelectorAll('.site-header .wordmark, .primary-nav > a, .language-switch a, .mobile-contact, .mobile-menu-trigger')]
      .filter((node) => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility === 'visible' && node.getBoundingClientRect().width > 0;
      })
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          text: node.textContent.trim(),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          colors: [style.color, ...(node.classList.contains('wordmark') ? [getComputedStyle(node.querySelector('span')).color] : [])],
          opacity: Number(style.opacity),
        };
      }));
    const headerHeight = await page.locator('.site-header').evaluate((node) => Math.ceil(node.getBoundingClientRect().height));
    await page.locator('.header-inner').evaluate((node) => { node.style.visibility = 'hidden'; });
    const screenshot = await page.screenshot({ clip: { x: 0, y: 0, width, height: headerHeight } });
    const measured = await page.evaluate(async ({ data, targets, width }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const linear = (value) => { const s = value / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; };
      const luminance = (rgb) => .2126 * linear(rgb[0]) + .7152 * linear(rgb[1]) + .0722 * linear(rgb[2]);
      const contrast = (first, second) => { const a = luminance(first); const b = luminance(second); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05); };
      const rgb = (color) => color.match(/[\d.]+/g).slice(0, 3).map(Number);
      return targets.map((target) => {
        let minimum = Infinity;
        let at = null;
        for (let y = Math.max(0, Math.ceil(target.y + 2)); y < Math.min(canvas.height, Math.floor(target.y + target.height - 2)); y += 1) {
          for (let x = Math.max(0, Math.ceil(target.x + 2)); x < Math.min(width, Math.floor(target.x + target.width - 2)); x += 1) {
            const offset = (y * width + x) * 4;
            const background = [pixels[offset], pixels[offset + 1], pixels[offset + 2]];
            for (const color of target.colors) {
              const foreground = rgb(color).map((channel, index) => channel * target.opacity + background[index] * (1 - target.opacity));
              const ratio = contrast(foreground, background);
              if (ratio < minimum) { minimum = ratio; at = { x, y, color }; }
            }
          }
        }
        return { text: target.text, ratio: Number(minimum.toFixed(2)), at };
      });
    }, { data: screenshot.toString('base64'), targets, width });
    results.push({ route, width, targets: measured });
    await page.close();
  }
}

await browser.close();
const failures = results.flatMap(({ route, width, targets }) => targets.filter((target) => target.ratio < 4.5).map((target) => ({ route, width, ...target })));
console.log(JSON.stringify({ minimum: Math.min(...results.flatMap((result) => result.targets.map((target) => target.ratio))), failures, results }, null, 2));
if (failures.length) process.exitCode = 1;
