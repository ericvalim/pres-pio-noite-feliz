import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const alvo=process.argv[2]||'producao';const root=path.resolve(alvo), out='_fora-do-site/revista-conferencia/'+alvo;await fs.mkdir(out,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{const u=req.url.split('?')[0];const f=path.resolve(root,'.'+decodeURIComponent(u==='/'?'/index.html':u));if(!f.startsWith(root+path.sep))throw Error();const d=await fs.readFile(f);res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');res.end(d);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const esperado=['https://pay.cakto.com.br/ge3iskx_1309623','https://pay.cakto.com.br/5cvwvfi_1309610','https://pay.cakto.com.br/xhysbvp','https://pay.cakto.com.br/5cvwvfi_1309610'];
try{
for(const width of [390,1366]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const falhas=[];
  page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)falhas.push(r.status()+' '+r.url());});
  await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:20000});console.log('goto');
  // rola a página inteira para disparar lazy-load
  const h=await page.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<h;y+=600){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(60);}
  for(const c of await page.locator('.guia-card').all()){await c.scrollIntoViewIfNeeded();await page.waitForTimeout(150);}
  await page.waitForTimeout(500);
  const imgs=await page.$$eval('img[src*="previas/"]',a=>Promise.all(a.map(async i=>{try{await Promise.race([i.decode(),new Promise(r=>setTimeout(r,3000))])}catch{};return {src:i.currentSrc,ok:i.naturalWidth>0}})));
  console.log('imgs');assert.equal(imgs.length,10);assert(imgs.every(i=>i.ok),JSON.stringify(imgs));
  const sw=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  assert(sw.sw<=sw.cw,`rolagem horizontal ${JSON.stringify(sw)}`);
  const links=await page.$$eval('a[data-checkout]',a=>a.map(x=>x.getAttribute('href')));
  assert.deepEqual(links,esperado);
  assert.deepEqual(falhas,[]);
  assert.equal(await page.locator('#por-dentro [data-amostra]').count(),8);
  assert.equal(await page.evaluate(()=>/p[áa]gina [0-9]/i.test(document.body.innerText+[...document.images].map(i=>i.alt).join(' '))),false);
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(300);
  await page.locator('#inicio').screenshot({path:`${out}/hero-${width}.png`});
  for(const id of ['por-dentro','planos','perguntas']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.locator('#'+id).screenshot({path:`${out}/${id}-${width}.png`});}
  await page.locator('footer').screenshot({path:`${out}/rodape-${width}.png`});
  await page.locator('#por-dentro [data-amostra]').nth(2).click();await page.waitForTimeout(400);
  assert(await page.locator('.guia-modal').evaluate(m=>m.open));
  assert(await page.locator('.guia-viewport img').evaluate(async i=>{await new Promise(r=>i.complete?r():i.onload=r);return i.naturalWidth===1800}));
  await page.screenshot({path:`${out}/modal-${width}.png`});
  console.log(width,'ok',sw,imgs.map(i=>i.src.split('/').pop()).join(' '));
  await page.close();
}
}finally{await browser.close();server.close();}
