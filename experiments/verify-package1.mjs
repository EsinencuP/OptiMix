import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4322';
const output=path.resolve('docs/revision-2026-11-09/qa');
await fs.mkdir(output,{recursive:true});
const slugs=['hr','documents','crm','erp','procurement','analytics'];
const projects=['recruiting','pdf-editor','crm','erp','erp','crm'];
const results={pages:[],errors:[],interactions:{}};
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',error=>results.errors.push(error.message));
page.on('response',response=>{if(response.status()>=400)results.errors.push(response.status()+' '+response.url());});
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
 const links=new Set();
 for(const locale of ['ru','en','ro']){
  const prefix=locale==='en'?'':`/${locale}`;
  for(const slug of ['',...slugs])for(const width of [1440,1024,768,390,320]){
   const url=slug?`${prefix}/services/${slug}/`:`${prefix}/`;
   await page.setViewportSize({width,height:960});assert.equal((await page.goto(base+url)).status(),200);
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(async()=>{for(const image of document.images)image.loading='eager';for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));}await Promise.all([...document.images].map(image=>Promise.race([image.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,5000))])));scrollTo(0,0);});
   const row=await audit();results.pages.push({url,width,...row});
   if(results.pages.length%20===0)console.log('Audited '+results.pages.length+' states');
   assert.equal(row.lang,locale);assert.equal(row.overflow,false,`${url} overflow ${width}`);
   assert.deepEqual(row.landmarks,[1,1,1,1]);assert.deepEqual(row.missing,[]);
   assert.equal(await page.locator('[data-demo-access],.ox-deck-number,.ox-project-number,.ox-feature-number').count(),0);
   assert.equal(await page.locator('.ox-start-grid>li').count(),4);
   assert.equal(await page.locator('.ox-start-expanded .ox-section-cta a').getAttribute('href'),`${prefix}/contact/`);
   assert.ok((await page.locator('.ox-start-grid>li').first().boundingBox()).height>=190);
   if(width<=960){const boxes=await page.locator('.ox-start-grid>li').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().x));assert.ok(boxes.every(x=>x===boxes[0]));}
   for(const link of row.internal)links.add(link);
   if(slug){
    assert.equal(row.canonical,`https://opti-mix-three.vercel.app${url}`);
    assert.equal(await page.locator('.ox-service-proof a.ox-button').getAttribute('href'),`${prefix}/portfolio/${projects[slugs.indexOf(slug)]}/`);
    assert.equal(await page.locator('.ox-service-scope li').count(),3);
    const locales=await page.locator('header .ox-header-actions>.ox-languages a[lang="en"]').getAttribute('href');assert.equal(locales,`/services/${slug}/`);
    assert.ok(row.alternates.some(item=>item.lang==='ro'&&item.url.endsWith(`/ro/services/${slug}/`)));
   }else{
    assert.equal(await page.locator('#value,.ox-value,.ox-process-illustration').count(),0);
    assert.deepEqual(await page.locator('.ox-service-card').evaluateAll(es=>es.map(e=>new URL(e.href).pathname)),slugs.map(slug=>`${prefix}/services/${slug}/`));
    assert.equal(await page.locator('.ox-real-screen img').count(),2);
    assert.equal(await page.locator('.ox-real-copy li').count(),6);
    assert.equal(await page.locator('.ox-faq-list details').count(),5);
    assert.ok((await page.locator('.ox-faq-list details>p').allTextContents()).every(answer=>answer.trim().length>90));
    assert.equal(await page.locator('.ox-faq-expanded .ox-section-cta a').getAttribute('href'),`${prefix}/contact/`);
    for(const id of ['workflow','examples','people-documents','business-systems','planning-analytics','demo-projects','approach','faq','contact'])assert.equal(await page.locator(`[id="${id}"]`).count(),1);
    assert.equal(await page.locator('[data-hero-shuffle]').getAttribute('data-active-sheet'),'crm');
   }
   if(locale==='ru'&&[1440,390].includes(width)&&(slug===''||slug==='documents'||slug==='hr'))await page.screenshot({path:path.join(output,`${slug||'home'}-${width}.png`),fullPage:true});
  }
 }
 // Every internal target across the newly navigable site must resolve, including old anchors.
 const fetched=new Map();let anchorCount=0;
 for(const href of links){const u=new URL(href),key=u.origin+u.pathname;let html=fetched.get(key);if(!html){const response=await fetch(key);assert.equal(response.status,200,key);html=await response.text();fetched.set(key,html);}if(u.hash){assert.ok(html.includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),href);anchorCount++;}}
 results.interactions.links={routes:fetched.size,anchors:anchorCount};
 // Credential removal is checked against all 72 actual built pages, not just visible widgets.
 async function htmlFiles(dir){let result=[];for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await htmlFiles(file));else if(file.endsWith('.html'))result.push(file);}return result;}
 const files=await htmlFiles('dist');for(const file of files){const html=await fs.readFile(file,'utf8');assert.ok(!/data-demo-access|admin@demo\.com|admin123|Admin123!|data-demo-copy|Shared demo accounts/.test(html),file+' credentials');}
 results.interactions.credentialFreePages=files.length;
 await page.setViewportSize({width:1440,height:960});await page.goto(base+'/ru/');
 const geometry=await page.evaluate(()=>{const art=document.querySelector('.ox-hero-artboard');return [...document.querySelectorAll('.ox-hero-layer')].map((sheet,index)=>{const reference=document.createElement('div');Object.assign(reference.style,{position:'absolute',left:[31,23,14][index]+'%',top:[9,15,22][index]+'%',width:'74%',height:'55%',transform:`rotate(${[12,11,9][index]}deg)`});art.append(reference);const a=sheet.getBoundingClientRect(),b=reference.getBoundingClientRect();reference.remove();return Math.max(...['x','y','width','height'].map(key=>Math.abs(a[key]-b[key])));});});assert.ok(geometry.every(delta=>delta<1),JSON.stringify(geometry));results.interactions.originalRearGeometryMaxDelta=Math.max(...geometry);
 const desktop=page.locator('.ox-desktop-nav [data-services-menu]'),summary=desktop.locator('summary');
 await summary.hover();assert.equal(await desktop.getAttribute('open'),'');
 await page.mouse.click(25,700);assert.equal(await desktop.getAttribute('open'),null);
 await summary.focus();await page.keyboard.press('Enter');assert.equal(await desktop.getAttribute('open'),'');
 await page.keyboard.press('ArrowDown');assert.equal(await desktop.locator('a').first().evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('ArrowUp');assert.equal(await desktop.locator('a').last().evaluate(e=>e===document.activeElement),true);
 await page.keyboard.press('Escape');assert.equal(await desktop.getAttribute('open'),null);assert.equal(await summary.evaluate(e=>e===document.activeElement),true);
 results.interactions.desktopServices=true;
 for(let i=0;i<5;i++){await page.locator('.ox-faq-list summary').nth(i).click();assert.equal(await page.locator('.ox-faq-list details[open]').count(),1);assert.ok(await page.locator('.ox-faq-list details>p').nth(i).isVisible());}
 await page.locator('.ox-faq-list').screenshot({path:path.join(output,'faq-open.png')});results.interactions.faq=true;
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/ru/');await page.locator('.ox-menu-trigger').click();
 const mobile=page.locator('#ox-mobile-nav [data-services-menu]');await mobile.locator('summary').click();assert.equal(await mobile.locator('a').count(),6);
 await page.locator('#ox-mobile-nav').screenshot({path:path.join(output,'mobile-services.png')});
 await mobile.locator('a').nth(3).click();await page.waitForURL(base+'/ru/services/erp/');
 await page.locator('.ox-menu-trigger').click();await page.locator('#ox-mobile-nav .ox-languages a[lang="ro"]').click();await page.waitForURL(base+'/ro/services/erp/');
 await page.locator('.ox-menu-trigger').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#ox-mobile-nav').evaluate(e=>e.matches(':popover-open')),false);results.interactions.mobileServicesAndLocale=true;
 // Real time animation: order, pause on hover, every face, compositor-only keyframes.
 await page.setViewportSize({width:1440,height:960});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'/ru/');await page.mouse.move(10,900);
 for(const key of ['people','processes','systems','crm']){await page.waitForFunction(key=>document.querySelector('[data-hero-shuffle]').dataset.activeSheet===key,key,{timeout:6000});await page.waitForTimeout(1050);const faceAudit=await audit();assert.deepEqual(faceAudit.contrast,[],key+' contrast');await page.locator('[data-hero-shuffle]').screenshot({path:path.join(output,`hero-${key}.png`)});}
 results.interactions.heroOrder=['crm','people','processes','systems','crm'];
 await page.locator('[data-hero-shuffle]').hover();const paused=await page.locator('[data-hero-shuffle]').getAttribute('data-active-sheet');await page.waitForTimeout(5000);assert.equal(await page.locator('[data-hero-shuffle]').getAttribute('data-active-sheet'),paused);results.interactions.heroHoverPause=true;
 await page.mouse.move(10,900);await page.waitForFunction(()=>document.querySelector('[data-hero-shuffle]').dataset.activeSheet==='people',null,{timeout:6000});
 await page.locator('[data-hero-shuffle]').hover();const times=await page.locator('[data-hero-sheet]').evaluateAll(es=>es.flatMap(e=>e.getAnimations().map(a=>({time:a.currentTime,state:a.playState}))));assert.ok(times.every(a=>a.state==='paused'||a.state==='finished'));await page.waitForTimeout(600);assert.deepEqual(await page.locator('[data-hero-sheet]').evaluateAll(es=>es.flatMap(e=>e.getAnimations().map(a=>({time:a.currentTime,state:a.playState})))),times);await page.mouse.move(10,900);results.interactions.heroMidTransitionPause=true;
 const keyframes=await page.locator('[data-hero-sheet]').evaluateAll(es=>es.flatMap(e=>e.getAnimations().flatMap(a=>a.effect.getKeyframes().flatMap(frame=>Object.keys(frame).filter(key=>!['offset','computedOffset','easing','composite','transform','opacity'].includes(key))))));assert.deepEqual(keyframes,[]);
 await page.locator('[data-hero-pause]').click();await page.mouse.move(10,900);const manual=await page.locator('[data-hero-shuffle]').getAttribute('data-active-sheet');await page.waitForTimeout(4800);assert.equal(await page.locator('[data-hero-shuffle]').getAttribute('data-active-sheet'),manual);results.interactions.heroPauseButton=true;
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/ro/');await page.locator('[data-hero-shuffle]').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-hero-shuffle]').dataset.activeSheet==='people',null,{timeout:6000});await page.waitForTimeout(1100);await page.locator('[data-hero-shuffle]').screenshot({path:path.join(output,'hero-mobile-people.png')});results.interactions.mobileAnimation=true;
 await page.setViewportSize({width:1440,height:960});await page.goto(base+'/ru/');await page.locator('[data-hero-pause]').focus();await page.waitForTimeout(4900);assert.equal(await page.locator('[data-hero-shuffle]').getAttribute('data-active-sheet'),'crm');results.interactions.heroFocusPause=true;
 await page.locator('.ox-header-cta').focus();await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(4900);assert.equal(await page.locator('[data-hero-shuffle]').getAttribute('data-active-sheet'),'crm');await page.evaluate(()=>scrollTo(0,0));await page.waitForFunction(()=>document.querySelector('[data-hero-shuffle]').dataset.activeSheet==='people',null,{timeout:6000});results.interactions.heroOffscreenPause=true;
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/ru/');await page.waitForTimeout(5000);assert.equal(await page.locator('[data-hero-shuffle]').getAttribute('data-active-sheet'),'crm');assert.equal(await page.locator('[data-hero-sheet]').evaluateAll(es=>es.flatMap(e=>e.getAnimations()).length),0);results.interactions.reducedMotion=true;
 // Astro lifecycle: repeatedly leave/return without accumulating hero timers or menu listeners.
 for(let i=0;i<3;i++){await page.locator('.ox-service-card').first().click();await page.waitForURL(base+'/ru/services/hr/');await page.locator('.ox-brand').first().click();await page.waitForURL(base+'/ru/');assert.equal(await page.locator('[data-hero-shuffle].is-shuffling').count(),1);}
 results.interactions.astroNavigation=true;
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:960}}),plain=await nojs.newPage();await plain.goto(base+'/ru/');assert.equal(await plain.locator('.ox-hero-process-body').evaluate(e=>getComputedStyle(e).opacity),'1');await plain.locator('.ox-desktop-nav summary').click();assert.equal(await plain.locator('.ox-desktop-nav .ox-services-dropdown a:visible').count(),6);await plain.locator('.ox-faq-list summary').first().click();assert.equal(await plain.locator('.ox-faq-list details[open]').count(),1);assert.equal(await plain.locator('[data-deck-card]').count(),5);await nojs.close();results.interactions.noJavaScript=true;
 assert.deepEqual(results.errors,[]);assert.equal(results.pages.filter(row=>row.contrast.length).length,0,'DOM contrast');
}catch(error){results.failure=error.stack;process.exitCode=1;}
finally{await fs.writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));await browser.close();}
console.log(JSON.stringify({pages:results.pages.length,contrast:results.pages.filter(row=>row.contrast.length).map(row=>({url:row.url,width:row.width,findings:row.contrast})),interactions:results.interactions,errors:results.errors,failure:results.failure},null,2));
