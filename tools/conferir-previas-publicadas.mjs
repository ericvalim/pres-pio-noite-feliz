import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const base='https://ateliecrochetando.com.br';
const out='_fora-do-site/previas/publicacao';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const report=[];
for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='ateliecrochetando.com.br'?route.continue():route.abort());
 const resp=await page.goto(base,{waitUntil:'domcontentloaded'});assert.equal(resp.status(),200);
 const section=page.locator('#por-dentro');await section.waitFor();assert.equal(await section.locator('[data-amostra]').count(),4);
 let starts=0;await page.exposeFunction('recordAnimation',()=>starts++);
 await page.evaluate(()=>document.querySelector('#por-dentro').addEventListener('animationstart',()=>window.recordAnimation()));
 await section.scrollIntoViewIfNeeded();await page.waitForTimeout(1100);assert.equal(starts,4);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await section.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
 assert(await section.locator('img').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>0)));
 await section.screenshot({path:`${out}/${width}.png`});
 for(let i=0;i<4;i++){
  const link=section.locator('[data-amostra]').nth(i);await link.click();await page.waitForTimeout(250);
  assert(await page.locator('.guia-modal').evaluate(e=>e.open));await page.locator('.guia-modal img').evaluate(i=>i.decode());
  await page.locator('[data-guia-zoom]').click();assert(await page.locator('.guia-viewport').evaluate(e=>e.scrollWidth>e.clientWidth));
  await page.locator('.guia-viewport').focus();await page.keyboard.press('Tab');assert(await page.locator('[data-guia-zoom]').evaluate(e=>e===document.activeElement));
  if(i===0){await page.locator('[data-guia-zoom]').click();await page.locator('.guia-modal').screenshot({path:`${out}/ampliacao-${width}.png`});}
  if(i===1)await page.locator('[data-guia-fechar]').click();else if(i===2)await page.mouse.click(1,1);else await page.keyboard.press('Escape');
  await page.waitForTimeout(250);assert(!await page.locator('.guia-modal').evaluate(e=>e.open));assert(await link.evaluate(e=>e===document.activeElement));
 }
 if(width===390){assert(await page.locator('.guia-trilho').evaluate(e=>e.scrollWidth>e.clientWidth));await page.locator('.guia-trilho').evaluate(e=>e.scrollLeft=150);assert(await page.locator('.guia-trilho').evaluate(e=>e.scrollLeft>0));}
 await page.locator('#hero').count().then(async n=>{if(n)await page.locator('#hero').scrollIntoViewIfNeeded();});await section.scrollIntoViewIfNeeded();await page.waitForTimeout(200);assert.equal(starts,4);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await section.scrollIntoViewIfNeeded();assert.equal(await section.locator('.guia-card').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 for(const asset of ['index.html','css/previas.css','js/previas.js','js/meta-pixel.js','js/ofertas.js','js/campanha-config.js',...['pontos','receita','montagem','cena'].flatMap(s=>[360,720,1800].map(w=>`img/previas/${s}-${w}.webp`))]){
  const r=await page.request.get(base+'/'+asset);assert.equal(r.status(),200);const actual=await r.body();const local=await fs.readFile('producao/'+asset);
  if(asset.endsWith('.webp')) assert(actual.equals(local),`Diferenca remota ${asset}`);
  else {
    const normalize = data => data.toString('utf8').replace(/\r\n/g,'\n').replace(/<script\b[^>]*src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js[^>]*><\/script>\n?/g,'');
    assert.equal(normalize(actual),normalize(local),`Diferenca remota ${asset}`);
  }
 }
 for(const pdf of ['basico','completo'])assert.equal((await page.request.get(`${base}/pdf/dist/presepio-noite-feliz-${pdf}-revisado.pdf`)).status(),404);
 assert.deepEqual(errors,[]);report.push({width,visible:true,images:4,animationOnce:true,zoom:true,keyboard:true,closeMethods:true,reducedMotion:true,remoteMatchesLocal:true,pdf404:true});await context.close();
}
await fs.writeFile(out+'/resultado.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
