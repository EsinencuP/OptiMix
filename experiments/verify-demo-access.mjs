import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:4322';
const output=path.resolve('docs/portfolio-release-2026-10-29/demo-access-qa');await fs.mkdir(output,{recursive:true});
const expected={
  crm:[['admin@demo.com','admin123'],['manager@demo.com','manager123'],['member@demo.com','member123']],
  erp:['admin@erp.dev','sales@sample.erp.example','finance@sample.erp.example','warehouse@sample.erp.example','projects@sample.erp.example','analyst@sample.erp.example'].map(email=>[email,'Admin123!']),
};
const result={pages:[],copies:0,errors:[],interactions:{}};
const browser=await chromium.launch({headless:true,channel:'chrome'});
const context=await browser.newContext({reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();page.on('pageerror',error=>result.errors.push(error.message));
page.on('response',response=>{if(response.status()>=400)result.errors.push(`${response.status()} ${response.url()}`);});
try{
  for(const locale of ['ru','en','ro']){
    const prefix=locale==='en'?'':`/${locale}`;
    for(const width of [1440,390,320]){
      await page.setViewportSize({width,height:960});
      for(const route of ['portfolio/','portfolio/erp/','portfolio/crm/','']){
        const url=`${base}${prefix}/${route}`;assert.equal((await page.goto(url)).status(),200);
        await page.waitForSelector('[data-demo-access][data-access-ready]');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,url);
        assert.equal(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.length===new Set(ids).size;}),true,'Unique IDs');
        const ids=route==='portfolio/erp/'?['erp']:route==='portfolio/crm/'?['crm']:['erp','crm'];
        for(const slug of ids){
          const root=page.locator(`[data-demo-access][data-demo-project="${slug}"]`);
          assert.equal(await root.count(),1);
          assert.equal(await root.locator('option').count(),expected[slug].length);
          if(route===''&&slug==='erp'){
            await page.locator('[data-deck-card="erp"] [data-deck-hit]').focus();await page.keyboard.press('Enter');await page.locator('[data-deck-card="erp"] [data-deck-flip]').click();
          }
          for(let index=0;index<expected[slug].length;index++){
            await root.locator('select').selectOption(String(index));
            for(const [i,field] of ['email','password'].entries()){
              assert.equal(await root.locator(`[data-demo-value="${field}"]`).inputValue(),expected[slug][index][i]);
              assert.equal(await root.locator(`[data-demo-value="${field}"]`).getAttribute('type'),'text');
              if(locale==='ru'&&width===1440&&route==='portfolio/'){
                await root.locator(`[data-demo-copy="${field}"] img`).click();
                await page.waitForFunction(el=>el.dataset.copyState==='success',await root.locator('[data-demo-copy-status]').elementHandle());
                assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected[slug][index][i]);result.copies++;
              }
            }
            if(route===''&&slug==='erp')assert.equal(await page.locator('[data-deck-card="erp"]').evaluate(el=>el.classList.contains('is-flipped')),true,'Role/copy must not flip the deck');
          }
          if(route===''&&slug==='erp'){
            await root.locator('label').first().click();assert.equal(await page.locator('[data-deck-card="erp"]').evaluate(el=>el.classList.contains('is-flipped')),true,'Label must not flip');
            const bounds=await page.locator('[data-deck-card="erp"] .ox-deck-back').evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight}));assert.ok(bounds.scroll<=bounds.height+2,`${locale}/${width} ERP card overflow`);
            if(locale==='ru')await page.screenshot({path:path.join(output,`deck-${width}.png`)});
          }
        }
        if(locale==='ru'&&width!==320&&route!=='')await page.screenshot({path:path.join(output,`${route.replaceAll('/','-')}${width}.png`),fullPage:true});
        result.pages.push({locale,width,route,accounts:ids.reduce((sum,slug)=>sum+expected[slug].length,0)});
      }
    }
  }
  await page.goto(`${base}/ru/portfolio/`);
  const root=page.locator('[data-demo-project="crm"]');
  // Clipboard-denied fallback selects the current value and never announces success.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Denied for test'))}}));
  await root.locator('select').selectOption('1');await root.locator('[data-demo-copy="password"]').click();
  await page.waitForFunction(el=>el.dataset.copyState==='manual',await root.locator('[data-demo-copy-status]').elementHandle());
  assert.deepEqual(await root.locator('[data-demo-value="password"]').evaluate(el=>({start:el.selectionStart,end:el.selectionEnd})),{start:0,end:10});result.interactions.manualFallback=true;
  // A delayed copy completion after changing role must not announce success for a different account.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>new Promise(resolve=>{window.__finishDemoCopy=resolve;})}}));
  await root.locator('[data-demo-copy="email"]').click();await root.locator('select').selectOption('2');
  await page.evaluate(()=>window.__finishDemoCopy());await page.waitForTimeout(50);
  assert.equal(await root.locator('[data-demo-copy-status]').textContent(),'');result.interactions.roleRace=true;
  await page.evaluate(()=>{window.__oldDemoRoot=document.querySelector('[data-demo-project="crm"]');});
  await page.locator('[data-portfolio-project="erp"] .ox-catalog-index-links a').first().click();await page.waitForURL(`${base}/ru/portfolio/erp/`);
  assert.equal(await page.evaluate(()=>window.__oldDemoRoot.querySelector('[data-demo-copy]').hidden),true);result.interactions.astroCleanup=true;
  await page.locator('.ox-menu-trigger').click();await page.locator('#ox-mobile-nav [lang="ro"]').click();await page.waitForURL(`${base}/ro/portfolio/erp/`);assert.equal(await page.locator('[data-demo-project="erp"] option').count(),6);result.interactions.locale=true;
  const nojs=await browser.newContext({javaScriptEnabled:false});const plain=await nojs.newPage();await plain.goto(`${base}/ru/portfolio/`);
  for(const slug of ['crm','erp']){const access=plain.locator(`[data-demo-project="${slug}"]`);await access.locator('summary').click();for(const [email,password] of expected[slug]){assert.ok((await access.locator('noscript').innerText()).includes(email));assert.ok((await access.locator('noscript').innerText()).includes(password));}}
  await nojs.close();result.interactions.noJavaScript=true;
  assert.equal(result.errors.length,0);
}catch(error){result.failure=error.stack;process.exitCode=1;}
finally{await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2));await browser.close();}
console.log(JSON.stringify({pages:result.pages.length,copies:result.copies,interactions:result.interactions,errors:result.errors,failure:result.failure},null,2));
