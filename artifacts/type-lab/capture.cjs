const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const findings = [];
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: width > 800 ? 900 : 850 }, deviceScaleFactor: 1 });
    const errors = [];
    const failedResponses = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (!response.ok()) failedResponses.push(`${response.status()} ${response.url()}`); });
    await page.goto('http://127.0.0.1:4174/experiments/type-lab.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(__dirname, `onest-${width}.png`), fullPage: true });
    const data = await page.evaluate(() => {
      const box = selector => [...document.querySelectorAll(selector)].map(el => ({ text: el.textContent.trim(), width: Math.round(el.getBoundingClientRect().width), scrollWidth: el.scrollWidth, font: getComputedStyle(el).fontFamily, fontSize: getComputedStyle(el).fontSize }));
      const glyphs = [...new Set('Ș ș Ț ț Ă ă Â â Î î Ё ё Запрос → 1250,50 lei € %'.replaceAll(' ', ''))];
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        loadedFonts: [...document.fonts].filter(face => face.status === 'loaded').map(face => `${face.family}/${face.weight}`),
        fontChecks: {
          en: document.fonts.check('650 72px "Onest Variable"', 'Optimize the handoff'),
          ro: document.fonts.check('620 48px "Onest Variable"', 'Cerere → aprobare → comandă Ș ș Ț ț Ă ă Â â Î î'),
          ru: document.fonts.check('620 48px "Onest Variable"', 'Запрос → согласование → заказ Ё ё'),
        },
        glyphChecks: Object.fromEntries(glyphs.map(glyph => [glyph, document.fonts.check('620 48px "Onest Variable"', glyph)])),
        overflowElements: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 12).map(el => ({tag:el.tagName, className:el.className, text:el.textContent.trim().slice(0, 60), right:Math.round(el.getBoundingClientRect().right)})),
        headings: box('h1,h2'),
        samples: box('.sample-text,.workflow'),
        figures: box('.figure strong'),
        fontResources: performance.getEntriesByType('resource').filter(x => x.name.includes('.woff2')).map(x => ({name:x.name.split('/').pop(), transferSize:x.transferSize, decodedBodySize:x.decodedBodySize})),
      };
    });
    findings.push({ width, ...data, errors, failedResponses });
    await page.close();
  }
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mobilePage.goto('http://127.0.0.1:4174/experiments/type-lab.html', { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => document.fonts.ready);
  await mobilePage.screenshot({ path: path.join(__dirname, 'onest-mobile-emulation.png'), fullPage: true });
  findings.push({mode:'Chrome mobile emulation', viewport: await mobilePage.evaluate(() => innerWidth), documentWidth: await mobilePage.evaluate(() => document.documentElement.scrollWidth)});
  await mobilePage.close();
  fs.writeFileSync(path.join(__dirname, 'validation.json'), JSON.stringify(findings, null, 2));
  await browser.close();
  console.log(JSON.stringify(findings.map(({ width, documentWidth, fontChecks, fontResources, errors, failedResponses }) => ({width, documentWidth, fontChecks, fontResources, errors, failedResponses})), null, 2));
})().catch(error => { console.error(error); process.exit(1); });
