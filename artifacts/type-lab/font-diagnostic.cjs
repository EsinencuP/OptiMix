const { chromium } = require('C:/Users/User.DESKTOP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  await page.goto('http://127.0.0.1:4174/experiments/type-lab.html', { waitUntil: 'networkidle' });
  const result = await page.evaluate(async () => {
    await document.fonts.ready;
    const snapshot = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 420;
      canvas.height = 100;
      const context = canvas.getContext('2d');
      context.font = '620 48px "Onest Variable"';
      context.fillStyle = '#172328';
      const glyphPixels = Object.fromEntries(['Ă', 'ă', '→', 'Ș', 'Ё'].map(char => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillText(char, 10, 65);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let hash = 2166136261;
        for (const value of pixels) hash = Math.imul(hash ^ value, 16777619) >>> 0;
        return [char, hash];
      }));
      const widths = Object.fromEntries(['Ă', 'ă', '→', 'Ș', 'Ё'].map(char => [char, context.measureText(char).width]));
      context.font = '620 48px Arial';
      const arialGlyphPixels = Object.fromEntries(['Ă', 'ă', '→', 'Ș', 'Ё'].map(char => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillText(char, 10, 65);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let hash = 2166136261;
        for (const value of pixels) hash = Math.imul(hash ^ value, 16777619) >>> 0;
        return [char, hash];
      }));
      return {
        loaded: [...document.fonts].filter(face => face.status === 'loaded').map(face => face.unicodeRange.slice(0, 40)),
        checks: Object.fromEntries(['Ă', 'ă', '→', 'Ș', 'Ё'].map(char => [char, document.fonts.check('620 48px "Onest Variable"', char)])),
        widths,
        glyphPixels,
        arialGlyphPixels,
        resources: performance.getEntriesByType('resource').filter(item => item.name.includes('.woff2')).map(item => item.name.split('/').pop()),
      };
    };
    const before = snapshot();
    const requested = await document.fonts.load('620 48px "Onest Variable"', 'Ă ă →');
    const after = snapshot();
    return {before, requested: requested.map(face => face.unicodeRange.slice(0, 40)), after};
  });
  fs.writeFileSync(path.join(__dirname, 'font-diagnostic.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
