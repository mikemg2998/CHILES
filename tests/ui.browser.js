/* Pruebas de interfaz en navegador real (Playwright + Chromium). Solo UI: comprueban que el rediseño no cambia el
   comportamiento. No forman parte de `npm run check` (requieren el navegador); se lanzan con `npm run check:ui`.
   Cubre: SIGUIENTE = exactamente una carta; el barajado no roba cartas; ♡ una sola vez; selector de nivel sin pantalla
   completa; estado de ropa persiste al cerrar y reabrir; pausa de continuidad; reduced motion; sin dados; sin
   desbordamiento horizontal en 320/375/390/430; sin errores de consola. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.env.PLAYWRIGHT_PATH || '/opt/node-tools/node_modules/playwright/index.js';
const { chromium } = (await import(PW)).default || (await import(PW));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL = `http://127.0.0.1:${server.address().port}/index.html?debug`;
const SAVED = { schema: 5, prefs: { names: ['Mike', 'Val'], mode: 'conexion', bodyParts: [['pene'], ['vulva', 'senos']], underwear: [null, null] }, favorites: [], vibrate: false, setupDone: true };

const browser = await chromium.launch();
let failures = 0, passed = 0;
async function page(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: opts.width || 390, height: opts.height || 844 }, reducedMotion: opts.reducedMotion || 'no-preference' });
  await ctx.addInitScript(s => localStorage.setItem('pab.v2', JSON.stringify(s)), SAVED);
  const pg = await ctx.newPage(); const errors = [];
  pg.on('pageerror', e => errors.push('pageerror ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()); });
  await pg.route('https://api.fontshare.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.goto(URL, { waitUntil: 'networkidle' });
  pg.errors = errors;
  /* contadores sobre el motor real: cuántas veces se pidió una carta y cuántas veces se registró feedback */
  await pg.evaluate(() => { const e = window.pab; window.__rolls = 0; window.__fb = []; const roll = e.roll.bind(e); e.roll = (...a) => { window.__rolls++; return roll(...a); }; const fb = e.feedback.bind(e); e.feedback = k => { window.__fb.push(k); return fb(k); }; });
  return pg;
}
const isOpen = (pg, id) => pg.$eval(id, e => e.classList.contains('open'));
const rolls = pg => pg.evaluate(() => window.__rolls);
async function start(pg) { await pg.click('#btnRoll'); await pg.waitForSelector('#sheetStart.open'); await pg.click('#btnStart'); await pg.waitForSelector('#roundBox:not([hidden])'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); }
async function test(name, fn) {
  let pg;
  try { pg = await fn(); assert.deepEqual(pg?.errors || [], [], 'errores de consola'); passed++; console.log(`ok · ${name}`); }
  catch (e) { failures++; console.log(`FAIL · ${name}\n   ${e.message}`); }
  finally { if (pg) await pg.context().close(); }
}

await test('sin dados: no queda ningún elemento de dados en el DOM', async () => {
  const pg = await page();
  assert.equal(await pg.$$eval('.dice, .die, .cube, #dice', els => els.length), 0);
  assert.ok(await pg.$('#stage .deck .layers'), 'capas de la composición de carta');
  return pg;
});

await test('SIGUIENTE pide exactamente una carta; pulsar durante el barajado no añade otra', async () => {
  const pg = await page(); await start(pg);
  assert.equal(await rolls(pg), 1);
  const before = await pg.$eval('#phrase', e => e.textContent);
  await pg.click('#btnRoll');
  await pg.waitForTimeout(60); /* en pleno barajado */
  assert.ok(await pg.$eval('#stage', e => e.classList.contains('shuffling')), 'el barajado está en curso');
  await pg.$eval('#btnRoll', b => b.click()); await pg.$eval('#btnRoll', b => b.click()); /* clics extra sin esperar al disabled */
  await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); await pg.waitForTimeout(100);
  assert.equal(await rolls(pg), 2, 'dos pulsaciones efectivas = dos cartas, ni una más');
  assert.equal(await pg.evaluate(() => window.pab.state.round), 2);
  assert.notEqual(await pg.$eval('#phrase', e => e.textContent), before);
  assert.ok(!(await pg.$eval('#stage', e => e.classList.contains('shuffling'))), 'el barajado termina');
  const dt = await pg.evaluate(async () => { const t0 = performance.now(); document.querySelector('#btnRoll').click(); await new Promise(r => { const i = setInterval(() => { if (!document.querySelector('#btnRoll').disabled) { clearInterval(i); r(); } }, 5); }); return performance.now() - t0; });
  assert.ok(dt >= 250 && dt <= 700, `barajado entre 250 y 400 ms de animación (medido ${Math.round(dt)} ms)`);
  return pg;
});

await test('♡ Me gusta registra el feedback una sola vez; ••• abre el menú y no roba cartas ni temporizador', async () => {
  const pg = await page(); await start(pg);
  await pg.waitForTimeout(500);
  await pg.click('#fbLike'); await pg.click('#fbLike'); await pg.$eval('#fbLike', b => b.click());
  assert.deepEqual(await pg.evaluate(() => window.__fb), ['like']);
  assert.ok(await pg.$eval('#fbLike', b => b.classList.contains('on')));
  const r = await rolls(pg);
  await pg.click('#btnMore'); await pg.waitForSelector('#sheetMenu.open');
  assert.ok((await pg.$$('#menuList .mi')).length >= 4, 'Otra · Más suave · Pasar · Terminar');
  assert.equal(await pg.$eval('#timer', t => t.hidden || !t.classList.contains('running')), true, 'el menú no arranca el temporizador');
  await pg.mouse.click(10, 10); await pg.waitForFunction(() => !document.querySelector('#sheetMenu').classList.contains('open'));
  assert.equal(await rolls(pg), r, 'abrir y cerrar el menú no pide cartas');
  return pg;
});

await test('temporizador: toca para empezar, toca para parar; el barajado lo reinicia con la nueva carta', async () => {
  const pg = await page(); await start(pg);
  for (let i = 0; i < 12 && await pg.$eval('#timer', t => t.hidden); i++) { await pg.click('#btnRoll'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); }
  assert.ok(!(await pg.$eval('#timer', t => t.hidden)), 'hay una carta con tiempo');
  const total = await pg.$eval('#timer', t => Number(t.dataset.total));
  await pg.click('#timer'); await pg.waitForTimeout(1200);
  assert.ok(await pg.$eval('#timer', t => t.classList.contains('running')));
  const shown = await pg.$eval('#timer .t', e => e.textContent); const [m, s] = shown.split(':').map(Number);
  assert.ok(m * 60 + s < total && m * 60 + s >= total - 3, `cuenta atrás (${shown} de ${total})`);
  const bar = await pg.$eval('#timer .bar', b => b.style.transform); assert.ok(/scaleX\(0\.\d+\)/.test(bar), 'progreso sutil en la línea');
  await pg.click('#timer'); assert.ok(!(await pg.$eval('#timer', t => t.classList.contains('running'))), 'tocar de nuevo para');
  assert.equal(await pg.$eval('#timer .t', e => e.textContent), await pg.evaluate(t => { const m = Math.floor(t / 60), s = t % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }, total));
  return pg;
});

await test('selector de nivel: cambia de nivel sin pantalla completa; Intimidad pregunta la ropa', async () => {
  const pg = await page(); await start(pg);
  await pg.click('#levelBtn'); await pg.waitForSelector('#sheetLevel.open');
  assert.equal((await pg.$$('#levelList .lv')).length, 3);
  await pg.click('#levelList .lv:nth-child(2)'); await pg.waitForTimeout(200);
  const box = await pg.$eval('#levelFlash', f => { const r = f.getBoundingClientRect(); return { h: r.height, w: r.width, hidden: f.hidden }; });
  assert.ok(!box.hidden && box.h < 160 && box.w < 390, `aviso de nivel compacto (${Math.round(box.w)}×${Math.round(box.h)})`);
  assert.equal(await pg.evaluate(() => window.pab.level()), 2);
  assert.equal(await pg.$eval('#levelName', e => e.textContent), 'Deseo');
  await pg.waitForFunction(() => document.querySelector('#levelFlash').hidden);
  await pg.click('#levelBtn'); await pg.waitForSelector('#sheetLevel.open'); await pg.click('#levelList .lv:nth-child(3)');
  await pg.waitForSelector('#sheetClothing.open', { timeout: 4000 });
  assert.equal(await pg.evaluate(() => window.pab.level()), 3);
  return pg;
});

await test('estado de ropa: PUESTA / FUERA / NO LA LLEVO se guarda y se mantiene al cerrar y reabrir', async () => {
  const pg = await page(); await start(pg);
  await pg.click('#levelBtn'); await pg.waitForSelector('#sheetLevel.open'); await pg.click('#levelList .lv:nth-child(3)');
  await pg.waitForSelector('#sheetClothing.open', { timeout: 4000 });
  const segs = await pg.$$('#clothingGrid .col:nth-child(2) .garment');
  assert.ok(segs.length >= 4, 'prendas de Val');
  const sizes = await pg.$$eval('#clothingGrid .seg button', bs => bs.map(b => b.getBoundingClientRect().height));
  assert.ok(sizes.every(h => h >= 44), 'botones de al menos 44 px de alto');
  await (await segs[0].$$('.seg button'))[1].click(); /* camiseta FUERA */
  await (await segs[segs.length - 1].$$('.seg button'))[2].click(); /* última prenda NO LA LLEVO */
  const c1 = await pg.evaluate(() => ({ ...window.pab.clothing[1] }));
  assert.equal(c1.top, 'OFF');
  await pg.click('#btnClothingDone'); await pg.waitForFunction(() => !document.querySelector('#sheetClothing').classList.contains('open'));
  await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled);
  await pg.click('#btnMore'); await pg.waitForSelector('#sheetMenu.open');
  await pg.click('#menuList .mi:has-text("Estado de ropa")'); await pg.waitForSelector('#sheetClothing.open');
  const on = await pg.$$eval('#clothingGrid .col:nth-child(2) .garment', rows => rows.map(r => [...r.querySelectorAll('.seg button')].findIndex(b => b.classList.contains('on'))));
  assert.equal(on[0], 1, 'camiseta sigue en FUERA'); assert.equal(on[on.length - 1], 2, 'última prenda sigue en NO LA LLEVO');
  assert.deepEqual(await pg.evaluate(() => ({ ...window.pab.clothing[1] })), c1, 'reabrir no cambia nada');
  return pg;
});

await test('pausa de Intimidad: «Seguir con el juego» continúa; «Seguir por nuestra cuenta» cierra sin victoria', async () => {
  async function toPause(pg) {
    for (let i = 0; i < 40; i++) {
      if (await isOpen(pg, '#sheetPause')) return true;
      if (await isOpen(pg, '#sheetUndress')) { for (const col of await pg.$$('#undressGrid .col')) { const c = await col.$$('.chip'); await c[c.length - 1].click(); } await pg.click('#btnUndressDone'); await pg.waitForTimeout(350); continue; }
      await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); await pg.click('#btnRoll'); await pg.waitForTimeout(80);
    }
    return false;
  }
  const pg = await page();
  await pg.evaluate(() => { window.pab.setLevel(3); });
  await pg.click('#btnRoll'); await pg.waitForSelector('#sheetStart.open'); await pg.click('#btnStart');
  await pg.waitForSelector('#sheetClothing.open'); await pg.click('#btnClothingDone'); /* Intimidad empieza desde la ropa real */
  await pg.waitForSelector('#roundBox:not([hidden])'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled);
  assert.ok(await toPause(pg), 'la pausa aparece entre la carta 13 y la 17');
  const count = await pg.evaluate(() => window.pab.session.intimacyCardCount);
  assert.ok(count >= 13 && count <= 17, `pausa en ${count}`);
  assert.equal(await pg.$eval('#btnPauseAlone', b => b.textContent.trim()), 'Seguir por nuestra cuenta');
  assert.equal(await pg.$eval('#btnPauseGame', b => b.textContent.trim()), 'Seguir con el juego');
  await pg.mouse.click(10, 10); await pg.waitForTimeout(200); assert.ok(await isOpen(pg, '#sheetPause'), 'la pausa no se cierra tocando fuera');
  const round = await pg.evaluate(() => window.pab.state.round);
  await pg.click('#btnPauseGame'); await pg.waitForFunction(r => window.pab.state.round > r, round); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); await pg.waitForTimeout(150);
  assert.equal(await pg.evaluate(() => window.pab.state.round), round + 1, 'seguir con el juego da exactamente una carta');
  assert.ok(await pg.evaluate(() => window.pab.session.intimacyCardCount) >= count, 'el contador no se reinicia');
  assert.ok(await toPause(pg), 'segunda pausa');
  await pg.click('#btnPauseAlone'); await pg.waitForSelector('#ending:not([hidden])');
  assert.ok(await pg.$eval('#btnNew', b => !b.hidden), 'cierre: nueva sesión disponible');
  assert.ok(!/victoria|ganado|nivel completado/i.test(await pg.$eval('#endingText', e => e.textContent)));
  return pg;
});

await test('reduced motion: sin barajado ni esperas, la carta cambia casi al instante y todo sigue funcionando', async () => {
  const pg = await page({ reducedMotion: 'reduce' }); await start(pg);
  const before = await pg.$eval('#phrase', e => e.textContent);
  const dt = await pg.evaluate(async () => { const t0 = performance.now(); document.querySelector('#btnRoll').click(); await new Promise(r => { const i = setInterval(() => { if (!document.querySelector('#btnRoll').disabled) { clearInterval(i); r(); } }, 2); }); return performance.now() - t0; });
  assert.ok(dt < 120, `casi instantáneo (${Math.round(dt)} ms)`);
  assert.equal(await rolls(pg), 2);
  assert.notEqual(await pg.$eval('#phrase', e => e.textContent), before);
  assert.equal(await pg.$eval('#phrase', e => getComputedStyle(e).opacity), '1', 'la frase es visible sin animación');
  await pg.click('#fbLike'); assert.deepEqual(await pg.evaluate(() => window.__fb), ['like']);
  return pg;
});

await test('responsive: sin desbordamiento horizontal ni objetivos pequeños en 320 / 375 / 390 / 430', async () => {
  let last;
  for (const w of [320, 375, 390, 430]) {
    const pg = await page({ width: w, height: w === 320 ? 568 : 844 });
    const check = async label => {
      const over = await pg.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      assert.ok(!over, `${w}px ${label}: desbordamiento horizontal`);
      const small = await pg.$$eval('button:not([hidden])', bs => bs.filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && (r.height < 44 || r.width < 44) && !b.closest('[hidden], [aria-hidden="true"]'); }).map(b => b.id || b.className));
      assert.deepEqual(small, [], `${w}px ${label}: botones por debajo de 44×44`);
    };
    await check('home');
    const cta = await pg.$eval('#btnRoll', b => b.getBoundingClientRect().bottom); const vh = await pg.evaluate(() => innerHeight);
    assert.ok(cta <= vh, `${w}px: el CTA está dentro de la pantalla (${Math.round(cta)} / ${vh})`);
    await start(pg); await pg.waitForTimeout(500); await check('sesión');
    if (last) await last.context().close(); last = pg;
  }
  return last;
});

await browser.close(); server.close();
console.log(`\n${passed} ok · ${failures} fallos`);
process.exit(failures ? 1 : 0);
