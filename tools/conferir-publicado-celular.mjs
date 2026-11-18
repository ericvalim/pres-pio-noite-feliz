import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const base='https://ateliecrochetando.com.br/', out='_fora-do-site/revista-conferencia/publicado';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,
  userAgent:'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',locale:'pt-BR'});
await ctx.route(/facebook\.(net|com)\/(tr|en_US|signals)/,r=>r.abort());
const page=await ctx.newPage();
const erros=[],falhas=[];
page.on('pageerror',e=>erros.push(e.message));
page.on('console',m=>{if(m.type()==='error')erros.push(m.text())});
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)falhas.push(r.status()+' '+r.url())});
const t0=Date.now();
await page.goto(base+'?teste='+Date.now(),{waitUntil:'load',timeout:30000});
console.log('carregou em',Date.now()-t0,'ms');
await page.screenshot({path:`${out}/01-topo.png`});
const h=await page.evaluate(()=>document.body.scrollHeight);
for(let y=0;y<h;y+=500){await page.mouse.wheel(0,500);await page.waitForTimeout(80);}
const card=page.locator('.guia-card');
for(let i=0;i<await card.count();i++){await card.nth(i).scrollIntoViewIfNeeded();await page.waitForTimeout(200);}
await page.waitForTimeout(800);
const imgs=await page.$$eval('img:not(.guia-viewport img)',a=>a.map(i=>({src:(i.currentSrc||i.src).split('/').pop(),ok:i.complete&&i.naturalWidth>0})));
const quebradas=imgs.filter(i=>!i.ok);
console.log('imagens:',imgs.length,'quebradas:',JSON.stringify(quebradas));
const prev=await page.$$eval('#por-dentro img',a=>a.map(i=>i.currentSrc.split('/').pop()));
console.log('prévias carregadas:',prev.join(', '));
const sw=await page.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]);
console.log('largura documento/tela:',sw.join('/'));
const links=await page.$$eval('a[data-checkout]',a=>a.map(x=>x.href));
console.log('checkout:',links.join(' | '));
// prévias: deslizar o carrossel por toque
await page.locator('#por-dentro').scrollIntoViewIfNeeded();
await page.locator('.guia-trilho').evaluate(e=>e.scrollTo({left:0}));await page.waitForTimeout(300);
await page.locator('#por-dentro').screenshot({path:`${out}/02-previas.png`});
await page.locator('.guia-trilho').evaluate(e=>e.scrollBy({left:e.clientWidth*0.85*2}));await page.waitForTimeout(500);
await page.locator('#por-dentro').screenshot({path:`${out}/03-previas-deslizado.png`});
// tocar para ampliar
await page.locator('#por-dentro [data-amostra]').nth(2).tap();await page.waitForTimeout(600);
const modal=await page.locator('.guia-modal').evaluate(m=>({aberto:m.open,titulo:m.querySelector('h2').textContent,img:m.querySelector('.guia-viewport img').currentSrc.split('/').pop()}));
console.log('ampliação:',JSON.stringify(modal));
await page.screenshot({path:`${out}/04-ampliacao.png`});
await page.locator('[data-guia-zoom]').tap();await page.waitForTimeout(400);
const zoomW=await page.locator('.guia-viewport img').evaluate(async i=>{await new Promise(r=>i.complete?r():i.onload=r);return [i.naturalWidth,Math.round(i.getBoundingClientRect().width)]});console.log('zoom (natural/exibida):',zoomW.join('/'));assert.equal(zoomW[0],1800);assert(zoomW[1]>=1790,'zoom não usa 1800');
await page.screenshot({path:`${out}/05-ampliacao-zoom.png`});
await page.locator('[data-guia-fechar]').tap();await page.waitForTimeout(500);
console.log('fechou:',!(await page.locator('.guia-modal').evaluate(m=>m.open)));
// planos e FAQ
await page.locator('#planos').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
await page.locator('#planos').screenshot({path:`${out}/06-planos.png`});
const faq=page.locator('summary',{hasText:'revista impressa'});
await faq.scrollIntoViewIfNeeded();await faq.tap();await page.waitForTimeout(400);
console.log('FAQ:',(await faq.locator('xpath=..').locator('.faq__resposta').innerText()).trim());
await page.locator('#perguntas').screenshot({path:`${out}/07-faq.png`});
await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
await page.screenshot({path:`${out}/08-rodape.png`});
console.log('barra fixa visível:',await page.locator('#barra-planos').isVisible());
console.log('erros JS:',JSON.stringify(erros));
console.log('respostas com erro:',JSON.stringify(falhas));
assert.equal(quebradas.length,0);assert(sw[0]<=sw[1]);assert(modal.aberto);assert.equal(falhas.length,0);
const txt=await page.evaluate(()=>document.body.innerText);assert(!/1 p[áa]gina para colorir/i.test(txt),'menção a 1 página para colorir');assert(/EXCLUSIVO DO COMPLETO/i.test(await page.locator('.plano--completo').innerText()),'selo exclusivo ausente');assert(/p[áa]ginas para colorir/.test(await page.locator('.plano--basico .lista-nao').innerText()),'não inclui sem colorir');
assert.equal(await page.locator('#por-dentro [data-amostra]').count(),8);assert.equal(prev.length,8);
console.log('RESULTADO: ok');
await browser.close();
