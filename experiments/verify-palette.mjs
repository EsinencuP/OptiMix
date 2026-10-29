import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.PALETTE_QA_URL || 'http://127.0.0.1:4322';
const output = path.resolve('docs/palette-2026-10-29/verified');
await fs.mkdir(output, { recursive: true });
const routes = ['', 'contact/', 'privacy/', 'projects/procurement/', 'portfolio/crm/', 'portfolio/erp/', 'demo/procurement/', ...['intake','budget','approval','erp','visibility'].map(slug => `solutions/${slug}/`)];
const results = { pages: [], interactions: {}, errors: [] };
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({ reducedMotion:'reduce' });
const page = await context.newPage();
page.on('pageerror', error => results.errors.push(error.message));
page.on('response', response => { if (response.status() >= 400 && !response.url().includes('404')) results.errors.push(`${response.status()} ${response.url()}`); });
const audit = async () => page.evaluate(() => {
  const rgb = value => value.match(/[\d.]+/g)?.map(Number) || [0,0,0];
  const composite = (fg,bg) => fg.slice(0,3).map((c,i) => c*(fg[3]??1)+bg[i]*(1-(fg[3]??1)));
  const luminance = c => c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const failures = new Map();
  const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    const el = walker.currentNode.parentElement;
    if(!text || !el || el.closest('[hidden],[inert],[aria-hidden="true"],.sr-only,.ox-hero-chart-a11y,script,style,canvas')) continue;
    const style = getComputedStyle(el), rect=el.getBoundingClientRect();
    if(!rect.width || !rect.height || style.visibility==='hidden' || style.display==='none') continue;
    const chain=[]; let ancestor=el, visible=true;
    while(ancestor) { const s=getComputedStyle(ancestor); if(Number(s.opacity)<.9) visible=false; chain.push(s); ancestor=ancestor.parentElement; }
    if(!visible) continue;
    let bg=[255,255,255];
    for(const s of chain.reverse()) bg=composite(rgb(s.backgroundColor),bg);
    const fg=composite(rgb(style.color),bg), a=luminance(fg), b=luminance(bg);
    const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const large=parseFloat(style.fontSize)>=24 || (parseFloat(style.fontSize)>=18.66 && Number(style.fontWeight)>=700);
    const required=large?3:4.5;
    if(ratio+.01<required) {
      const key=`${el.className}|${style.color}|${bg.map(Math.round)}|${required}`;
      failures.set(key,{element:el.className,text:text.slice(0,65),color:style.color,background:bg.map(Math.round),ratio:+ratio.toFixed(2),required});
    }
  }
  return { lang:document.documentElement.lang, title:document.title,
    overflow:document.documentElement.scrollWidth>innerWidth,
    landmarks:['h1','main','header','footer'].map(s=>document.querySelectorAll(s).length),
    missingImages:[...document.images].filter(el=>!el.complete||!el.naturalWidth).map(el=>el.src),
    palette:getComputedStyle(document.querySelector('.ox-home')).backgroundColor,
    contrast:[...failures.values()] };
});
try {
  for(const locale of ['ru','en','ro']) {
    const prefix=locale==='en'?'':`/${locale}`;
    for(const route of [...routes, locale==='en'?'404.html':'404/']) {
      for(const width of [1440,390]) {
        await page.setViewportSize({width,height:960});
        const url=`${base}${prefix}/${route}`;
        const response=await page.goto(url);
        await page.evaluate(()=>document.fonts.ready);
        const data=await audit();
        assert.equal(data.overflow,false,`${url} overflow ${width}`);
        assert.deepEqual(data.landmarks,[1,1,1,1],`${url} landmarks`);
        assert.equal(data.missingImages.length,0,`${url} images`);
        assert.equal(data.lang,locale);
        const row={url:prefix+'/'+route,width,status:response.status(),...data};
        results.pages.push(row);
        if((locale==='ru' && ['', 'contact/', 'portfolio/crm/', 'portfolio/erp/', 'demo/procurement/', 'projects/procurement/','solutions/intake/','privacy/','404/'].includes(route)) || (locale!=='ru' && route==='')) {
          // Scroll through the page so existing reveal animations have settled before full-page capture.
          await page.evaluate(async()=>{ for(let y=0;y<document.documentElement.scrollHeight;y+=600) { scrollTo(0,y); await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))); } scrollTo(0,0); });
          await page.screenshot({path:path.join(output,`${locale}-${route.replaceAll('/','-')||'home-'}${width}.png`),fullPage:true});
        }
      }
    }
    for(const width of [320,768,1024,1280]) {
      await page.setViewportSize({width,height:900}); await page.goto(`${base}${prefix}/`);
      await page.waitForSelector('[data-demo-deck].is-ready');
      const data=await audit(); assert.equal(data.overflow,false,`${locale} home ${width}`);
      results.pages.push({url:prefix+'/',width,...data});
      if(locale==='ru') await page.screenshot({path:path.join(output,`ru-home-${width}.png`),fullPage:width===320});
    }
  }
  assert.equal(results.pages.filter(row=>row.contrast.length).length,0,'DOM text contrast');
  await page.setViewportSize({width:1440,height:960}); await page.goto(`${base}/ru/`);
  await page.waitForSelector('[data-demo-deck].is-ready');
  await page.locator('#services').screenshot({path:path.join(output,'services-1440.png')});
  const deck=await page.evaluate(()=>({names:[...document.querySelectorAll('#demo-projects h3')].map(el=>el.textContent),layers:[...document.querySelectorAll('[data-deck-card]')].map(el=>getComputedStyle(el).zIndex),links:[...document.querySelectorAll('.ox-deck-links a')].map(el=>el.getAttribute('href'))}));
  assert.deepEqual(deck.names,['Cherryli','Budget','Aprobery','ERP','Steer','All-in-one CRM']);
  assert.deepEqual(deck.layers,['1','2','3','4','5']);
  const erp=page.locator('[data-deck-card="erp"]');
  await erp.locator('[data-deck-hit]').focus(); await page.keyboard.press('Enter');
  assert.equal(await erp.evaluate(el=>el.classList.contains('is-open')),true);
  assert.equal(await erp.evaluate(el=>getComputedStyle(el).zIndex),'10');
  await page.keyboard.press('Enter'); assert.equal(await erp.evaluate(el=>el.classList.contains('is-flipped')),true);
  await page.screenshot({path:path.join(output,'deck-open-flipped.png')});
  await erp.locator('.ox-button-secondary img').click(); await page.waitForURL(`${base}/ru/portfolio/erp/`);
  assert.equal(await page.locator('[data-erp-module]').count(),7);
  results.interactions.deck={...deck,openFlipLink:true};
  await page.goto(`${base}/ru/`);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('[data-demo-deck]').hover({position:{x:10,y:10}});
  await page.waitForTimeout(500);
  const topCard=page.locator('[data-deck-card="visibility"]');
  const matrix=el=>{const s=getComputedStyle(el),m=new DOMMatrix(s.transform);return {a:m.a,b:m.b,c:m.c,d:m.d,y:m.f,z:s.zIndex};};
  const before=await topCard.evaluate(matrix);
  await topCard.hover(); await page.waitForTimeout(500);
  const after=await topCard.evaluate(matrix);
  assert.equal(after.z,'5'); assert.equal(before.z,'5');
  for(const key of ['a','b','c','d']) assert.equal(before[key],after[key]);
  assert.ok(Math.abs(before.y-after.y-64)<1);
  results.interactions.hover={before,after,lift:64};
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#faq details summary').first().click(); assert.equal(await page.locator('#faq details').first().getAttribute('open'),'');
  results.interactions.faq=true;
  await page.locator('.ox-header-actions>.ox-languages [data-locale-link][lang="en"]').click(); await page.waitForURL(`${base}/`);
  assert.equal(await page.locator('html').getAttribute('lang'),'en'); results.interactions.locale=true;
  await page.setViewportSize({width:390,height:844}); await page.goto(`${base}/ru/`);
  await page.locator('.ox-menu-trigger').click(); assert.equal(await page.locator('#ox-mobile-nav').evaluate(el=>el.matches(':popover-open')),true);
  await page.screenshot({path:path.join(output,'mobile-menu.png')});
  await page.keyboard.press('Escape'); assert.equal(await page.locator('#ox-mobile-nav').evaluate(el=>el.matches(':popover-open')),false);
  await page.locator('[data-deck-select="budget"]').click(); assert.equal(await page.locator('[data-deck-card="budget"]').evaluate(el=>el.classList.contains('is-open')),true);
  results.interactions.mobileMenuAndDeck=true;
  await page.goto(`${base}/ru/demo/procurement/`);
  await page.locator('input[value="exception"]').check(); await page.locator('[data-demo-next]').click(); await page.locator('[data-demo-next]').click();
  assert.equal(await page.locator('[data-demo]').getAttribute('data-route-state'),'halted');
  await page.screenshot({path:path.join(output,'demo-halted.png'),fullPage:true});
  await page.locator('[data-demo-resolve]').click();
  for(let i=0;i<3;i++) await page.locator('[data-demo-next]').click();
  assert.equal(await page.locator('[data-demo]').getAttribute('data-route-state'),'complete');
  await page.screenshot({path:path.join(output,'demo-complete.png'),fullPage:true});
  await page.locator('[data-demo-restart]').click(); assert.equal(await page.locator('[data-demo]').getAttribute('data-route-state'),'active');
  results.interactions.demoHaltedResolveCompleteRestart=true;
  await page.goto(`${base}/ru/contact/`);
  await page.locator('.brief-builder input').first().fill('Проверка новой палитры');
  const downloadPromise=page.waitForEvent('download');
  await page.locator('.brief-builder button').click();
  const download=await downloadPromise;
  assert.ok(download.suggestedFilename().endsWith('.txt'));
  await page.screenshot({path:path.join(output,'brief-saved.png'),fullPage:true});
  results.interactions.briefDownload=true;
  results.interactions.reducedMotion=await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  assert.equal(results.errors.length,0,'Browser or network errors');
} catch(error) { results.failure=error.stack; process.exitCode=1; }
finally { await fs.writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2)); await browser.close(); }
console.log(JSON.stringify({pages:results.pages.length,pagesWithContrastFindings:results.pages.filter(p=>p.contrast.length).length,interactions:results.interactions,errors:results.errors,failure:results.failure},null,2));
