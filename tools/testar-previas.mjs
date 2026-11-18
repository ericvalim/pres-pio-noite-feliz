import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('producao'), out='_fora-do-site/previas';
const server=http.createServer(async(req,res)=>{try{const f=path.resolve(root,'.'+decodeURIComponent(req.url==='/'?'/index.html':req.url));if(!f.startsWith(root+path.sep))throw Error();const d=await fs.readFile(f);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp'})[path.extname(f)]||'application/octet-stream');res.end(d);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
for(const width of [320,390,768,1280]){
const page=await browser.newPage({viewport:{width,height:900}});
await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
const big=[];page.on('request',r=>{if(r.url().includes('-1800.webp'))big.push(r.url());});
await page.goto(base);await page.locator('#por-dentro').scrollIntoViewIfNeeded();await page.waitForTimeout(850);
assert.equal(big.length,0);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('#por-dentro img').evaluateAll(imgs=>Promise.all(imgs.map(im=>im.decode())));
assert(await page.locator('#por-dentro img').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>0)));
if(width<768){assert(await page.locator('.guia-trilho').evaluate(e=>e.scrollWidth>e.clientWidth));await page.locator('.guia-trilho').evaluate(e=>e.scrollLeft=200);assert(await page.locator('.guia-trilho').evaluate(e=>e.scrollLeft>0));await page.locator('.guia-trilho').evaluate(e=>e.scrollLeft=0);}
await page.locator('#por-dentro').screenshot({path:`${out}/${width<768?'celular':'desktop'}-${width}.png`});
await page.locator('[data-amostra]').first().click();await page.waitForTimeout(250);assert(await page.locator('.guia-modal').evaluate(e=>e.open));assert.equal(big.length,1);
await page.locator('.guia-modal img').evaluate(im=>im.decode());
await page.locator('[data-guia-zoom]').click();assert(await page.locator('.guia-viewport').evaluate(e=>e.scrollWidth>e.clientWidth));
await page.locator('.guia-viewport').focus();await page.keyboard.press('Tab');assert(await page.locator('[data-guia-zoom]').evaluate(e=>e===document.activeElement));
await page.keyboard.press('Shift+Tab');assert(await page.locator('.guia-viewport').evaluate(e=>e===document.activeElement));
await page.keyboard.press('Escape');await page.waitForTimeout(250);assert(await page.locator('[data-amostra]').first().evaluate(e=>e===document.activeElement));
await page.locator('[data-amostra]').first().click();await page.locator('[data-guia-fechar]').click();await page.waitForTimeout(250);assert(!await page.locator('.guia-modal').evaluate(e=>e.open));
await page.locator('[data-amostra]').first().click();await page.mouse.click(1,1);await page.waitForTimeout(250);assert(!await page.locator('.guia-modal').evaluate(e=>e.open));
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('#por-dentro').scrollIntoViewIfNeeded();assert.equal(await page.locator('.guia-card').first().evaluate(e=>getComputedStyle(e).animationName),'none');
for(const url of ['/pdf/dist/presepio-noite-feliz-basico-revisado.pdf','/pdf/dist/presepio-noite-feliz-completo-revisado.pdf'])assert.equal((await page.request.get(base+url)).status(),404);
results.push({width,overflow:false,carousel:width<768,modal:true,keyboard:true,reducedMotion:true,largeLazy:true});await page.close();
}
const page=await browser.newPage({javaScriptEnabled:false});await page.goto(base);assert(await page.locator('[data-amostra]').first().isVisible());assert.equal(await page.locator('[data-amostra]').count(),4);await page.close();
await fs.writeFile(`${out}/validacao.json`,JSON.stringify(results,null,2));console.log(results);
}finally{await browser.close();server.close();}
