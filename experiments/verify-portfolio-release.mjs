import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4322';
const output=path.resolve(process.env.PORTFOLIO_QA_OUTPUT||'docs/portfolio-release-2026-10-29/qa');
await fs.mkdir(output,{recursive:true});
const slugs=['pdf-editor','erp','commerce','founder','recruiting','crm'];
const names=['AI PDF Editor','Evo ERP','Commerce Operations','Founder Workspace','Recruiting Workspace','CRM Portfolio'];
const demos=['https://ai-pdf-editor.pages.dev/','https://erp-xi-pink.vercel.app/','https://optimix-commerce-northstar.academ1cian.chatgpt.site/#overview','https://founder-workspace-portfolio.tealrice.chatgpt.site/workspace/','https://recruiting-workspace-demo.tealrice.chatgpt.site/','https://crm-portfolio-omega.vercel.app/'];
const repos=['https://github.com/academ1cian/ai-pdf-editor','https://github.com/EsinencuP/ERP','https://github.com/academ1cian/commerce-operations-workspace','https://github.com/academ1cian/founder-workspace-portfolio','https://github.com/academ1cian/recruiting-automation-workspace','https://github.com/EsinencuP/crm-portfolio'];
const results={pages:[],interactions:{},errors:[]};
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',error=>results.errors.push(error.message));
page.on('response',response=>{if(response.status()>=400)results.errors.push(`${response.status()} ${response.url()}`);});
async function audit(){return page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g)?.map(Number)||[0,0,0];
  const blend=(a,b)=>a.slice(0,3).map((c,i)=>c*(a[3]??1)+b[i]*(1-(a[3]??1)));
  const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  const findings=new Map(),walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const text=walker.currentNode.textContent.trim(),el=walker.currentNode.parentElement;
    if(!text||!el||el.closest('[hidden],[inert],[aria-hidden="true"],.sr-only,.ox-hero-chart-a11y,script,style,canvas'))continue;
    const css=getComputedStyle(el),rect=el.getBoundingClientRect();
    if(!rect.width||!rect.height||css.visibility==='hidden'||css.display==='none')continue;
    const styles=[];let ancestor=el,visible=true;
    while(ancestor){const s=getComputedStyle(ancestor);if(Number(s.opacity)<.9)visible=false;styles.push(s);ancestor=ancestor.parentElement;}
    if(!visible)continue;
    let bg=[255,255,255];for(const s of styles.reverse())bg=blend(rgb(s.backgroundColor),bg);
    const fg=blend(rgb(css.color),bg),a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const required=parseFloat(css.fontSize)>=24||(parseFloat(css.fontSize)>=18.66&&Number(css.fontWeight)>=700)?3:4.5;
    if(ratio+.01<required)findings.set(el.className+css.color+bg.join(),{class:el.className,text:text.slice(0,50),ratio:+ratio.toFixed(2),required,color:css.color,background:bg.map(Math.round)});
  }
  return {lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,landmarks:['h1','main','header','footer'].map(s=>document.querySelectorAll(s).length),missing:[...document.images].filter(el=>!el.complete||!el.naturalWidth).map(el=>el.src),contrast:[...findings.values()],canonical:document.querySelector('link[rel="canonical"]')?.href,alternates:[...document.querySelectorAll('link[rel="alternate"]')].map(el=>({lang:el.hreflang,url:el.href})),internal:[...document.querySelectorAll('a[href]')].map(el=>el.href).filter(href=>href.startsWith(location.origin)),external:[...document.querySelectorAll('main a[href]')].map(el=>el.href).filter(href=>!href.startsWith(location.origin))};
});}
try{
  const internalLinks=new Set();
  for(const locale of ['ru','en','ro']){
    const prefix=locale==='en'?'':`/${locale}`;
    for(const slug of ['',...slugs]){
      for(const width of [1440,768,390,320]){
        const url=`${base}${prefix}/portfolio/${slug?slug+'/':''}`;
        await page.setViewportSize({width,height:960});
        assert.equal((await page.goto(url)).status(),200);
        await page.evaluate(()=>document.fonts.ready);
        // Existing CRM/ERP reveals settle as they enter the viewport.
        await page.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}scrollTo(0,0);});
        const row=await audit();results.pages.push({url:prefix+'/portfolio/'+slug,width,...row});
        assert.equal(row.lang,locale);assert.equal(row.overflow,false,url+' overflow '+width);assert.deepEqual(row.landmarks,[1,1,1,1]);assert.equal(row.missing.length,0);
        assert.equal(row.canonical,`https://opti-mix-three.vercel.app${prefix}/portfolio/${slug?slug+'/':''}`);
        for(const link of row.internal)internalLinks.add(link);
        if(slug){const i=slugs.indexOf(slug);assert.ok(row.external.includes(demos[i]),`${slug} demo`);assert.ok(row.external.includes(repos[i]),`${slug} repository`);}
        else {assert.equal(await page.locator('[data-portfolio-project]').count(),6);assert.deepEqual(await page.locator('.ox-catalog-index-copy h2').allTextContents(),names);}
        if(locale==='ru'&&[1440,390].includes(width))await page.screenshot({path:path.join(output,`${slug||'catalog'}-${width}.png`),fullPage:true});
      }
    }
    for(const width of [1440,1024,390,320]){
      await page.setViewportSize({width,height:960});await page.goto(`${base}${prefix}/`);await page.waitForSelector('[data-demo-deck].is-ready');
      const row=await audit();results.pages.push({url:prefix+'/',width,...row});assert.equal(row.overflow,false);
      assert.deepEqual(await page.locator('#demo-projects h3[id^="project-"]').allTextContents(),names);
      assert.deepEqual(await page.locator('[data-deck-card]').evaluateAll(els=>els.map(el=>getComputedStyle(el).zIndex)),['1','2','3','4','5']);
      if(width<=390){
        for(const slug of slugs.filter(s=>s!=='crm')){
          await page.locator(`[data-deck-select="${slug}"]`).click();const card=page.locator(`[data-deck-card="${slug}"]`);
          const front=await card.locator('.ox-deck-front').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight}));
          assert.ok(front.scroll<=front.client+2,`${locale} ${slug} front overflow ${width}: ${JSON.stringify(front)}`);
          await card.locator('[data-deck-flip]').click();const back=await card.locator('.ox-deck-back').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight}));
          assert.ok(back.scroll<=back.client+2,`${locale} ${slug} back overflow ${width}`);
          assert.equal(await card.locator('.ox-deck-links a').first().getAttribute('href'),`${prefix}/portfolio/${slug}/`);
          await card.locator('.ox-deck-back [data-deck-back]').click();await card.locator('[data-deck-close]').click();
        }
      }
      if(locale==='ru'&&[1440,390].includes(width))await page.screenshot({path:path.join(output,`home-${width}.png`),fullPage:true});
    }
  }
  // Check same-origin routes and historical anchors reached from portfolio pages.
  const fetched=new Map();let anchorCount=0;
  for(const href of internalLinks){const url=new URL(href),key=url.origin+url.pathname;let html=fetched.get(key);if(!html){const response=await fetch(key);assert.equal(response.status,200,key);html=await response.text();fetched.set(key,html);}if(url.hash){const id=decodeURIComponent(url.hash.slice(1));assert.ok(html.includes(`id="${id}"`),href);anchorCount++;}}
  results.interactions.internalLinks={routes:fetched.size,anchors:anchorCount};
  await page.setViewportSize({width:1440,height:960});await page.goto(`${base}/ru/`);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('[data-demo-deck]').hover({position:{x:10,y:10}});await page.waitForTimeout(500);
  const top=page.locator('[data-deck-card="recruiting"]');const matrix=el=>{const s=getComputedStyle(el),m=new DOMMatrix(s.transform);return {a:m.a,b:m.b,c:m.c,d:m.d,y:m.f,z:s.zIndex};};const before=await top.evaluate(matrix);await top.hover();await page.waitForTimeout(500);const after=await top.evaluate(matrix);assert.equal(after.z,'5');assert.ok(Math.abs(before.y-after.y-64)<1);for(const key of ['a','b','c','d'])assert.equal(before[key],after[key]);
  results.interactions.hover={before,after,lift:64};
  await page.emulateMedia({reducedMotion:'reduce'});const pdf=page.locator('[data-deck-card="pdf-editor"]');await pdf.locator('[data-deck-hit]').focus();await page.keyboard.press('Enter');assert.equal(await pdf.evaluate(el=>getComputedStyle(el).zIndex),'10');await page.keyboard.press('Enter');await pdf.locator('.ox-deck-links a').first().locator('img').click();await page.waitForURL(`${base}/ru/portfolio/pdf-editor/`);
  await page.locator('.ox-header-actions>.ox-languages [lang="ro"]').click();await page.waitForURL(`${base}/ro/portfolio/pdf-editor/`);assert.equal(await page.locator('html').getAttribute('lang'),'ro');results.interactions.nestedLinkAndLocale=true;
  await page.setViewportSize({width:390,height:844});await page.goto(`${base}/ru/portfolio/`);await page.locator('.ox-menu-trigger').click();assert.equal(await page.locator('#ox-mobile-nav').evaluate(el=>el.matches(':popover-open')),true);await page.keyboard.press('Escape');results.interactions.mobileMenu=true;
  const nojs=await browser.newContext({javaScriptEnabled:false});const plain=await nojs.newPage();await plain.goto(`${base}/ru/`);assert.equal(await plain.locator('#demo-projects h3[id^="project-"]').count(),6);for(const slug of slugs.slice(0,5))assert.equal(await plain.locator(`.ox-deck-links a[href="/ru/portfolio/${slug}/"]`).count(),1);await nojs.close();results.interactions.noJavaScript=true;
  assert.equal(results.errors.length,0,'Browser errors');
  assert.equal(results.pages.filter(row=>row.contrast.length).length,0,'DOM contrast findings');
}catch(error){results.failure=error.stack;process.exitCode=1;}
finally{await fs.writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));await browser.close();}
console.log(JSON.stringify({pages:results.pages.length,contrast:results.pages.filter(row=>row.contrast.length).map(row=>({url:row.url,width:row.width,findings:row.contrast})),interactions:results.interactions,errors:results.errors,failure:results.failure},null,2));
