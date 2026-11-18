import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'producao');
const evidence = path.resolve('_fora-do-site/validacao-black-friday');
await fs.mkdir(evidence, { recursive: true });
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) throw Error('outside root');
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
let checks = 0;
const errors = [];
const basic = '[data-plano="basico"]';
const complete = '[data-plano="completo"]';
const modal = '#oferta-campanha';
const promo = '[data-oferta-aceitar]';
async function visible(page, selector) { assert(await page.locator(selector).isVisible(), selector); checks++; }
async function hidden(page) { assert(await page.locator(modal).isHidden()); checks++; }
async function navigate(page, click, destination) {
  await Promise.all([page.waitForURL(url => url.hostname === 'pay.cakto.com.br'), click()]);
  assert.equal(new URL(page.url()).pathname, '/' + destination);
  assert.equal(new URL(page.url()).searchParams.get('utm_source'), 'teste');
  checks++;
}
async function back(page) { await page.goBack(); await page.waitForURL(base + '/?utm_source=teste'); }
async function session(viewport = { width: 1280, height: 900 }, init) {
  const context = await browser.newContext({ viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600 });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.hostname === 'pay.cakto.com.br') return route.fulfill({ contentType: 'text/html', body: '<h1>Checkout simulado para validar navegação</h1>' });
    return route.abort(); // Nenhuma chamada real à Cakto, fontes ou Meta.
  });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/?utm_source=teste');
  return { context, page };
}
try {
  browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const viewport of [{width:1280,height:900},{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
    const {context,page} = await session(viewport);
    await hidden(page);
    assert.equal(await page.locator('img[src*="img/helena/"]').count(),3);
    for (const img of await page.locator('img[src*="img/helena/"]').all()) {
      await img.evaluate(img => { img.loading = 'eager'; });
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(img => img.decode());
      assert(await img.evaluate(img => img.naturalWidth > 0)); checks++;
    }
    if (viewport.width === 1280 || viewport.width === 390) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator('#quem').screenshot({path:path.join(evidence,`helena-${viewport.width}.png`)});
      await page.locator('#fechamento').screenshot({path:path.join(evidence,`fechamento-${viewport.width}.png`)});
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    assert.equal(await page.locator('.plano--basico .plano__preco strong').innerText(),'R$ 14,90');
    assert.equal(await page.locator('.plano--completo .plano__preco strong').innerText(),'R$ 27,90');
    await page.locator(basic).scrollIntoViewIfNeeded();
    await page.locator(basic).evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'}));
    await page.waitForTimeout(150);
    const scroll = await page.evaluate(() => scrollY);
    await page.locator(basic).click();
    await visible(page,modal);
    assert.equal(await page.locator('#oferta-titulo').innerText(),'Por mais R$ 5, leve o Presépio Completo');
    assert(await page.locator(promo).evaluate(el => document.activeElement === el));
    assert(await page.locator('main').evaluate(el => el.inert));
    assert.equal(await page.locator('body').evaluate(el=>getComputedStyle(el).position),'fixed');
    const bounds=await page.locator('.popup__caixa').boundingBox();
    assert(bounds.x >= 0 && bounds.x+bounds.width <= viewport.width+1);
    assert(bounds.height <= viewport.height-30);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth));
    await page.keyboard.press('Tab'); assert(await page.locator('[data-oferta-basico]').evaluate(el=>document.activeElement===el));
    await page.keyboard.press('Tab'); assert(await page.locator('[data-oferta-fechar]').evaluate(el=>document.activeElement===el));
    await page.keyboard.press('Tab'); assert(await page.locator(promo).evaluate(el=>document.activeElement===el));
    await page.keyboard.press('Shift+Tab'); assert(await page.locator('[data-oferta-fechar]').evaluate(el=>document.activeElement===el));
    await page.locator('.popup__caixa').screenshot({path:path.join(evidence,`modal-${viewport.width}x${viewport.height}.png`)});
    await page.keyboard.press('Escape'); await hidden(page);
    assert(await page.locator(basic).evaluate(el=>document.activeElement===el));
    assert(!(await page.locator('main').evaluate(el=>el.inert)));
    assert(Math.abs((await page.evaluate(()=>scrollY))-scroll)<3);
    await navigate(page,()=>page.locator(basic).click(),'5cvwvfi_1309610');
    await back(page); await hidden(page);
    await context.close();
    console.log(`OK celular/desktop ${viewport.width}x${viewport.height}: fotos, cards, modal, teclado, foco, rolagem e Escape.`);
  }
  for (const action of ['accept','continue','close','backdrop']) {
    const {context,page}=await session();
    await page.locator(basic).click(); await visible(page,modal);
    if(action==='accept') await navigate(page,()=>page.locator(promo).click(),'xhysbvp');
    if(action==='continue') await navigate(page,()=>page.locator('[data-oferta-basico]').click(),'5cvwvfi_1309610');
    if(action==='close') { await page.locator('[data-oferta-fechar]').click(); await hidden(page); await navigate(page,()=>page.locator(basic).click(),'5cvwvfi_1309610'); }
    if(action==='backdrop') { await page.locator(modal).click({position:{x:2,y:2}});await hidden(page);await navigate(page,()=>page.locator(complete).click(),'ge3iskx_1309623'); }
    await back(page);await hidden(page);await page.reload();await hidden(page);
    await navigate(page,()=>page.locator(complete).click(),'ge3iskx_1309623');await back(page);await hidden(page);
    await context.close(); console.log('OK básico:',action,'e prevenção de repetição entre fluxos.');
  }
  for(const action of ['accept','refuse','close','escape']) {
    const {context,page}=await session();
    await navigate(page,()=>page.locator(complete).click(),'ge3iskx_1309623');
    await back(page);await visible(page,modal);
    assert.equal(await page.locator('#oferta-titulo').innerText(),'Leve o Presépio Completo com R$ 8 de desconto');
    assert(await page.locator('[data-oferta-basico]').isHidden());
    if(action==='accept') {await navigate(page,()=>page.locator(promo).click(),'xhysbvp');await back(page);}
    if(action==='refuse') await page.locator('[data-oferta-recusar]').click();
    if(action==='close') await page.locator('[data-oferta-fechar]').click();
    if(action==='escape') await page.keyboard.press('Escape');
    await hidden(page);
    await navigate(page,()=>page.locator(basic).click(),'5cvwvfi_1309610');await back(page);await hidden(page);
    await context.close();console.log('OK retorno do completo:',action,'e sessão compartilhada.');
  }
  // Voltar sem bfcache: recriar documento com marcador de navegação pendente.
  {
    const {context,page}=await session();
    await navigate(page,()=>page.locator(complete).click(),'ge3iskx_1309623');
    await page.goto(base+'/?utm_source=teste');await visible(page,modal);
    await context.close();console.log('OK retorno com documento novo.');
  }
  {
    const {context,page}=await session({width:390,height:844});
    await navigate(page,()=>page.locator(complete).tap(),'ge3iskx_1309623');
    await back(page);await visible(page,modal);
    await page.locator('[data-oferta-recusar]').tap();await hidden(page);
    await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    await hidden(page);
    await context.close();console.log('OK retorno por toque no celular e pageshow repetido.');
  }
  {
    const {context,page}=await session();
    await navigate(page,()=>page.locator(complete).click(),'ge3iskx_1309623');
    await context.addInitScript(()=>{window.PNF_COMPRA_CONFIRMADA=true;});
    await page.goto(base+'/?utm_source=teste');await hidden(page);
    await context.close();console.log('OK confirmação confiável fornecida antes do retorno suprime oferta.');
  }
  {
    const {context,page}=await session();await page.locator(basic).click();await visible(page,modal);
    await page.evaluate(()=>{window.PNF_COMPRA_CONFIRMADA=true;dispatchEvent(new Event('pnf:compra-confirmada'));});
    await hidden(page);await context.close();console.log('OK confirmação fornecida com modal aberto o fecha.');
  }
  for(const mode of ['disabled','buyer','blocked-storage']) {
    const {context,page}=await session(undefined,()=>{});
    if(mode==='disabled') {
      await context.route('**/js/campanha-config.js',route=>route.fulfill({contentType:'text/javascript',body:'window.PNF_CAMPANHA={ativa:false};'}));
    } else if(mode==='buyer') await context.addInitScript(()=>{window.PNF_COMPRA_CONFIRMADA=true;});
    else await context.addInitScript(()=>{Object.defineProperty(window,'sessionStorage',{get(){throw Error('blocked');}});});
    await page.reload();await hidden(page);
    await navigate(page,()=>page.locator(basic).click(),'5cvwvfi_1309610');await back(page);await hidden(page);
    await navigate(page,()=>page.locator(complete).click(),'ge3iskx_1309623');await back(page);await hidden(page);
    await context.close();console.log('OK:',mode);
  }
  {
    const {context,page}=await session();
    await page.waitForTimeout(3500);await page.mouse.move(1,1);await hidden(page);
    assert.equal(await page.evaluate(()=>fbq.queue.filter(args=>args[2]==='PageView').length),1);
    await page.addScriptTag({url:base+'/js/meta-pixel.js'});
    assert.equal(await page.evaluate(()=>fbq.queue.filter(args=>args[2]==='PageView').length),1);
    await page.locator(basic).click();await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>fbq.queue.filter(args=>Array.from(args).includes('Purchase')).length),0);
    await context.close();console.log('OK: sem oferta por tempo/saída; PageView único e nenhum Purchase.');
  }
  assert.deepEqual(errors,[]);
  console.log(`PASS: ${checks} verificações explícitas e cenários completos sem erro JavaScript.`);
} finally {
  if(browser) await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
