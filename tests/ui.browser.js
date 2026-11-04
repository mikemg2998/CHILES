/* Pruebas de interfaz en navegador real (Playwright + Chromium). Solo UI: comprueban que el rediseño no cambia el
   comportamiento. No forman parte de `npm run check` (requieren el navegador); se lanzan con `npm run check:ui`.
   Cubre: SIGUIENTE = exactamente una carta; el barajado no roba cartas; ♡ una sola vez; selector de nivel sin pantalla
   completa; estado de ropa persiste al cerrar y reabrir; sin pausa de continuidad; reloj interno y atmósfera de Intimidad;
   reduced motion; sin dados; sin
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
  await ctx.addInitScript(s => localStorage.setItem('pab.v2', JSON.stringify(s)), opts.saved || SAVED);
  if (opts.init) await ctx.addInitScript(opts.init);
  /* espía de audio: cuenta los tonos que el temporizador programa (cada pitido = un oscilador con start()) y los
     AudioContext creados. Usa el Web Audio real de Chromium; solo observa. */
  await ctx.addInitScript(() => {
    window.__beeps = []; window.__ctx = 0; const AC = window.AudioContext; if (!AC) return;
    window.AudioContext = class extends AC {
      constructor(...a) { super(...a); window.__ctx++; window.__sessionAtCtx = navigator.audioSession ? navigator.audioSession.type : null; window.__lastCtx = this; }
      createBufferSource() { const b = super.createBufferSource(); const st = b.start.bind(b); b.start = (...x) => { window.__sources = (window.__sources || 0) + 1; return st(...x); }; return b; }
      createOscillator() { const o = super.createOscillator(); const st = o.start.bind(o); o.start = w => { window.__beeps.push({ at: w, f: o.frequency.value }); return st(w); }; return o; }
    };
  });
  const pg = await ctx.newPage(); const errors = [];
  if (opts.clock) await pg.clock.install();
  if (opts.lateInit) await pg.addInitScript(opts.lateInit); // después del reloj falso: puede envolver sus temporizadores
  pg.on('pageerror', e => errors.push('pageerror ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()); });
  await pg.route('https://api.fontshare.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.goto(URL + (opts.query || ''), { waitUntil: 'networkidle' });
  pg.errors = errors;
  /* contadores sobre el motor real: cuántas veces se pidió una carta y cuántas veces se registró feedback */
  await pg.evaluate(() => { const e = window.pab; window.__rolls = 0; window.__fb = []; const roll = e.roll.bind(e); e.roll = (...a) => { window.__rolls++; return roll(...a); }; const fb = e.feedback.bind(e); e.feedback = k => { window.__fb.push(k); return fb(k); }; });
  return pg;
}
const isOpen = (pg, id) => pg.$eval(id, e => e.classList.contains('open'));
const rolls = pg => pg.evaluate(() => window.__rolls);
async function start(pg) { await pg.click('#btnRoll'); await pg.waitForSelector('#sheetStart.open'); await pg.click('#btnStart'); await pg.waitForSelector('#roundBox:not([hidden])'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); }
async function test(name, fn) {
  if (process.env.ONLY && !name.includes(process.env.ONLY)) return; // ONLY=texto npm run check:ui → solo esas pruebas
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
  await pg.waitForTimeout(60); /* fase 1: la carta se retira */
  assert.ok(await pg.$eval('#stage', e => e.classList.contains('retiring')), 'fase RETIRAR en curso');
  await pg.waitForTimeout(200); /* fase 2: capas abstractas */
  assert.ok(await pg.$eval('#stage', e => e.classList.contains('shuffling')), 'fase BARAJAR en curso');
  assert.ok(await pg.$eval('#stage .layers', e => Number(getComputedStyle(e).opacity) > 0.5), 'las capas solo existen durante la transición');
  assert.equal(await pg.$eval('#phrase', e => getComputedStyle(e).opacity), '0', 'la frase anterior ya no está durante el barajado');
  await pg.$eval('#btnRoll', b => b.click()); await pg.$eval('#btnRoll', b => b.click()); /* clics extra sin esperar al disabled */
  await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); await pg.waitForTimeout(100);
  assert.equal(await rolls(pg), 2, 'dos pulsaciones efectivas = dos cartas, ni una más');
  assert.equal(await pg.evaluate(() => window.pab.state.round), 2);
  assert.notEqual(await pg.$eval('#phrase', e => e.textContent), before);
  assert.ok(!(await pg.$eval('#stage', e => e.classList.contains('shuffling'))), 'el barajado termina');
  const dt = await pg.evaluate(async () => { const t0 = performance.now(); document.querySelector('#btnRoll').click(); await new Promise(r => { const i = setInterval(() => { if (!document.querySelector('#btnRoll').disabled) { clearInterval(i); r(); } }, 5); }); return performance.now() - t0; });
  assert.ok(dt >= 500 && dt <= 900, `shuffle de 500–700 ms más el revelado (medido ${Math.round(dt)} ms)`);
  assert.equal(await pg.$eval('#stage .layers', e => getComputedStyle(e).opacity), '0', 'sin capas visibles en reposo: el contenido descansa sobre el negro');
  return pg;
});

await test('moods de llegada: exactamente 4 por persona, elección independiente, única por persona y solo para la sesión', async () => {
  const pg = await page();
  await pg.click('#btnRoll'); await pg.waitForSelector('#sheetStart.open');
  assert.equal(await pg.$eval('#sheetStart h2', h => h.textContent.trim()), '¿Cómo llegáis hoy?');
  assert.equal((await pg.$$('#intents .who')).length, 2, 'dos personas');
  assert.equal((await pg.$$('#intents .who:nth-child(1) .mood')).length, 4); assert.equal((await pg.$$('#intents .who:nth-child(2) .mood')).length, 4);
  const labels = await pg.$$eval('#intents .who:nth-child(1) .mood b', bs => bs.map(b => b.textContent.trim()));
  assert.deepEqual(labels, ['Quiero sentirte cerca', 'Tengo curiosidad', 'A ver qué surge', 'Hoy, algo tranquilo']);
  assert.ok(!labels.some(l => /cuiden|jugar/i.test(l)), 'sin «Me apetece que me cuiden» ni «Quiero jugar»');
  const sizes = await pg.$$eval('#intents .mood', bs => bs.map(b => b.getBoundingClientRect().height)); assert.ok(sizes.every(h => h >= 44));
  await pg.click('#intents .who:nth-child(1) .mood[data-mood="tranquilo"]'); await pg.click('#intents .who:nth-child(2) .mood[data-mood="abierto"]');
  const checked = () => pg.$$eval('#intents .mood', bs => bs.filter(b => b.getAttribute('aria-checked') === 'true').map(b => b.dataset.mood));
  assert.deepEqual(await checked(), ['tranquilo', 'abierto'], 'cada persona conserva su señal');
  await pg.click('#intents .who:nth-child(1) .mood[data-mood="cerca"]');
  assert.deepEqual(await checked(), ['cerca', 'abierto'], 'una persona solo puede tener un mood');
  await pg.click('#btnStart'); await pg.waitForSelector('#roundBox:not([hidden])'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled);
  assert.deepEqual(await pg.evaluate(() => window.pab.session.intents), [['cerca'], ['abierto']]);
  assert.deepEqual(await pg.evaluate(() => window.pab.moodProfile().moods), ['cerca', 'abierto']);
  await pg.click('#btnMore'); await pg.waitForSelector('#sheetMenu.open'); await pg.click('#menuList .mi:has-text("Terminar")');
  await pg.waitForSelector('#ending:not([hidden])'); await pg.click('#btnNew');
  await pg.waitForSelector('#welcome:not([hidden])'); await pg.click('#btnRoll'); await pg.waitForSelector('#sheetStart.open');
  assert.deepEqual(await checked(), [], 'la sesión nueva vuelve a preguntar sin mood previo');
  assert.deepEqual(await pg.evaluate(() => window.pab.session.intents), [[], []]);
  return pg;
});

await test('la animación no produce doble temporizador: un solo #timer, parado y reiniciado con cada carta nueva', async () => {
  const pg = await page(); await start(pg);
  assert.equal((await pg.$$('#timer')).length, 1);
  for (let i = 0; i < 12 && await pg.$eval('#timer', t => t.hidden); i++) { await pg.click('#btnRoll'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); }
  await pg.click('#timer'); await pg.waitForTimeout(300); assert.ok(await pg.$eval('#timer', t => t.classList.contains('running')));
  await pg.click('#btnRoll'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); await pg.waitForTimeout(400);
  assert.equal((await pg.$$('#timer')).length, 1, 'sigue habiendo un solo temporizador');
  const st = await pg.$eval('#timer', t => ({ running: t.classList.contains('running'), hidden: t.hidden, text: t.querySelector('.t').textContent, total: Number(t.dataset.total), bar: t.querySelector('.bar').style.transform }));
  if (!st.hidden) { assert.ok(!st.running, 'la carta nueva llega con el temporizador parado'); assert.equal(st.text, await pg.evaluate(t => { const m = Math.floor(t / 60), s = t % 60; return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; }, st.total)); assert.equal(st.bar, 'scaleX(0)'); }
  const text1 = await pg.$eval('#timer .t', e => e.textContent); await pg.waitForTimeout(1100);
  assert.equal(await pg.$eval('#timer .t', e => e.textContent), text1, 'nada sigue contando por debajo');
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

await test('reduced motion: sin barajado ni esperas, la carta cambia casi al instante y todo sigue funcionando', async () => {
  const pg = await page({ reducedMotion: 'reduce' }); await start(pg);
  const before = await pg.$eval('#phrase', e => e.textContent);
  const dt = await pg.evaluate(async () => { const t0 = performance.now(); document.querySelector('#btnRoll').click(); await new Promise(r => { const i = setInterval(() => { if (!document.querySelector('#btnRoll').disabled) { clearInterval(i); r(); } }, 2); }); return performance.now() - t0; });
  assert.ok(dt < 120, `casi instantáneo (${Math.round(dt)} ms)`); await pg.waitForTimeout(80);
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

/* ---------- aviso del temporizador: 3 pitidos solo al llegar a 00:00 de forma natural ---------- */
const beeps = pg => pg.evaluate(() => window.__beeps.length);
const timerState = pg => pg.$eval('#timer', t => ({ hidden: t.hidden, running: t.classList.contains('running'), done: t.classList.contains('done'), text: t.querySelector('.t').textContent, hint: t.querySelector('.hint').textContent, total: Number(t.dataset.total) }));
async function nextCard(pg) { await pg.click('#btnRoll'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); }
async function toTimerCard(pg) { for (let i = 0; i < 20 && await pg.$eval('#timer', t => t.hidden); i++) await nextCard(pg); assert.ok(!(await pg.$eval('#timer', t => t.hidden)), 'hay una carta con tiempo'); return (await timerState(pg)).total; }
async function menu(pg, label) { await pg.click('#btnMore'); await pg.waitForSelector('#sheetMenu.open'); await pg.click(`#menuList .mi:has-text("${label}")`); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); }
const ff = (pg, ms) => pg.clock.fastForward(ms);

await test('temporizador a 00:00: exactamente 3 pitidos, una sola vez, con aviso visual', async () => {
  const pg = await page({ clock: true }); await start(pg);
  const total = await toTimerCard(pg);
  assert.equal(await pg.evaluate(() => window.__ctx), 0, 'sin toque no se crea audio');
  await pg.click('#timer'); assert.equal(await pg.evaluate(() => window.__ctx), 1, 'el audio se desbloquea con el toque');
  await ff(pg, (total - 1) * 1000); await pg.waitForTimeout(50);
  assert.equal(await beeps(pg), 0, 'a falta de 1 s no suena');
  await ff(pg, 1500); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done'));
  assert.equal(await beeps(pg), 3, 'tres pitidos');
  const b = await pg.evaluate(() => window.__beeps);
  assert.ok(b.every(x => x.f >= 500 && x.f <= 900), 'tono medio, ni grave ni agudo');
  assert.ok(b[1].at - b[0].at >= 0.25 && b[2].at - b[1].at >= 0.25, 'con pequeñas pausas entre pitidos');
  const st = await timerState(pg); assert.equal(st.text, '00:00'); assert.equal(st.hint, 'tiempo'); assert.equal(await pg.$eval('#timer', t => t.getAttribute('aria-label')), 'Tiempo terminado');
  // doble disparo: sigue en 00:00, más tiempo, tocar el temporizador terminado
  await ff(pg, 30000); await pg.click('#timer'); await ff(pg, 5000); await pg.waitForTimeout(100);
  assert.equal(await beeps(pg), 3, 'no repite mientras sigue en 00:00');
  return pg;
});

await test('un temporizador nuevo vuelve a sonar; sin tocarlo, una carta con tiempo no suena', async () => {
  const pg = await page({ clock: true }); await start(pg);
  let total = await toTimerCard(pg);
  await pg.click('#timer'); await ff(pg, total * 1000 + 500); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done'));
  assert.equal(await beeps(pg), 3);
  await nextCard(pg); total = await toTimerCard(pg);
  assert.ok(!(await timerState(pg)).done, 'la carta nueva llega sin el estado de terminado');
  await ff(pg, 200000); await pg.waitForTimeout(50);
  assert.equal(await beeps(pg), 3, 'sin empezar no cuenta ni suena');
  await pg.click('#timer'); await ff(pg, total * 1000 + 500); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done'));
  assert.equal(await beeps(pg), 6, 'el segundo temporizador suena otra vez, 3 pitidos');
  return pg;
});

await test('parar, SIGUIENTE, «Otra», «Más suave» o «Pasar» antes de 00:00: ningún pitido', async () => {
  const pg = await page({ clock: true }); await start(pg);
  const cases = [
    ['tocar para parar', p => p.click('#timer')],
    ['SIGUIENTE', p => nextCard(p)],
    ['Otra', p => menu(p, 'Otra')],
    ['Más suave', p => menu(p, 'Más suave')],
    ['Pasar', p => menu(p, 'Pasar')],
  ];
  for (const [label, cancel] of cases) {
    const total = await toTimerCard(pg);
    await pg.click('#timer'); await ff(pg, Math.max(1, total - 2) * 1000);
    assert.ok((await timerState(pg)).running, `${label}: en marcha`);
    await cancel(pg);
    await ff(pg, 200000); await pg.waitForTimeout(50);
    assert.equal(await beeps(pg), 0, `${label}: no suena`);
    assert.ok(!(await timerState(pg)).done, `${label}: no queda como terminado`);
  }
  return pg;
});

await test('parar y volver a empezar: sin final falso; la cuenta empieza de nuevo y suena solo al final', async () => {
  const pg = await page({ clock: true }); await start(pg);
  const total = await toTimerCard(pg);
  await pg.click('#timer'); await ff(pg, (total - 3) * 1000);
  await pg.click('#timer'); assert.equal((await timerState(pg)).running, false, 'parado');
  await ff(pg, 10000); await pg.click('#timer'); // reanudar = empieza de nuevo desde el total
  await ff(pg, (total - 2) * 1000); await pg.waitForTimeout(50);
  assert.equal(await beeps(pg), 0, 'no termina por el tiempo acumulado antes de parar');
  assert.ok((await timerState(pg)).running);
  await ff(pg, 3000); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done'));
  assert.equal(await beeps(pg), 3);
  return pg;
});

await test('cartas sin tiempo: no hay temporizador y no suena nada', async () => {
  const pg = await page({ clock: true }); await start(pg);
  let seen = 0;
  for (let i = 0; i < 25; i++) { if (await pg.$eval('#timer', t => t.hidden)) { seen++; await ff(pg, 130000); } await nextCard(pg); }
  assert.ok(seen > 0, 'han salido cartas sin tiempo');
  assert.equal(await beeps(pg), 0); assert.equal(await pg.evaluate(() => window.__ctx), 0, 'sin toque no se crea audio');
  return pg;
});

await test('todas las duraciones (15 … 120 s): suena justo al llegar a 00:00, nunca antes', async () => {
  const { DURATIONS } = await import('../content/schema.js');
  assert.ok(DURATIONS.includes(120));
  const pg = await page({ clock: true }); await start(pg); await toTimerCard(pg);
  let expected = 0;
  for (const d of DURATIONS) {
    await pg.$eval('#timer', (t, d) => { t.dataset.total = d; t.classList.remove('done', 'running'); }, d);
    await pg.click('#timer');
    await ff(pg, (d - 0.5) * 1000); await pg.waitForTimeout(30);
    assert.equal(await beeps(pg), expected, `${d}s: a 0,5 s del final aún no suena`);
    assert.equal((await timerState(pg)).text, '00:01', `${d}s: muestra 00:01`);
    await ff(pg, 1000); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done'));
    expected += 3; assert.equal(await beeps(pg), expected, `${d}s: 3 pitidos`);
  }
  return pg;
});

await test('temporizador en móvil: centrado, legible, sin tapar la frase ni desbordar (320 → 430, alto y bajo)', async () => {
  let last;
  for (const [w, h] of [[320, 568], [375, 667], [390, 844], [430, 932], [1280, 800]]) {
    const pg = await page({ width: w, height: h }); await start(pg); await toTimerCard(pg); await pg.waitForTimeout(500);
    const g = await pg.evaluate(() => {
      const r = e => e.getBoundingClientRect(), t = r(document.querySelector('#timer')), box = r(document.querySelector('#roundBox')), ph = r(document.querySelector('#phrase'));
      return { t, box, ph, sw: document.documentElement.scrollWidth, vw: innerWidth, fs: parseFloat(getComputedStyle(document.querySelector('#timer .t')).fontSize) };
    });
    assert.ok(Math.abs((g.t.left + g.t.right) / 2 - (g.box.left + g.box.right) / 2) < 2, `${w}px: centrado`);
    assert.ok(g.t.left >= 0 && g.t.right <= g.vw && g.sw <= g.vw, `${w}px: sin desbordamiento`);
    assert.ok(g.t.top >= g.ph.bottom, `${w}px: debajo de la frase, sin taparla`);
    assert.ok(g.t.height >= 44 && g.t.width >= 44, `${w}px: objetivo táctil ≥ 44`);
    assert.ok(g.fs >= 28 && g.fs <= 40, `${w}px: cifra grande pero no gigante (${g.fs}px)`);
    if (last) await last.context().close(); last = pg;
  }
  return last;
});

/* ---------- iPhone / Safari: sesión de audio «playback», sin vibración web ---------- */
/* Simula lo que Safari en iOS expone: navigator.audioSession (iOS 16.4+) y ningún navigator.vibrate. */
const IOS = () => {
  delete Navigator.prototype.vibrate;
  const hist = []; let type = 'auto'; window.__sessionHist = hist;
  Object.defineProperty(navigator, 'audioSession', { configurable: true, value: { get type() { return type; }, set type(v) { type = v; hist.push(v); } } });
};
const NO_APIS = () => { delete Navigator.prototype.vibrate; delete Navigator.prototype.audioSession; };
const ANDROID = () => { window.__vib = []; Navigator.prototype.vibrate = function (p) { window.__vib.push(p); return true; }; };
async function runToZero(pg) { const st = await timerState(pg); await pg.click('#timer'); await ff(pg, st.total * 1000 + 500); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done')); }

await test('iPhone: el toque prepara la sesión «playback» sin sonar; a 00:00 suenan 3 pitidos y luego se suelta el audio', async () => {
  const pg = await page({ clock: true, init: IOS }); await start(pg); await toTimerCard(pg);
  assert.equal(await pg.evaluate(() => typeof navigator.vibrate), 'undefined');
  await pg.click('#timer');
  const u = await pg.evaluate(() => ({ s: navigator.audioSession.type, atCtx: window.__sessionAtCtx, ctx: window.__ctx, beeps: window.__beeps.length, src: window.__sources || 0 }));
  assert.deepEqual(u, { s: 'playback', atCtx: 'playback', ctx: 1, beeps: 0, src: 0 }, 'sesión playback antes de crear el audio, sin ningún sonido al desbloquear');
  const total = (await timerState(pg)).total; await ff(pg, total * 1000 + 500); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done'));
  assert.equal(await beeps(pg), 3); assert.equal(await pg.evaluate(() => navigator.audioSession.type), 'playback', 'suena con la sesión de reproducción');
  await ff(pg, 2000); await pg.waitForTimeout(50);
  assert.equal(await pg.evaluate(() => navigator.audioSession.type), 'auto', 'después de los pitidos la sesión vuelve a auto (no retiene la música de otras apps)');
  assert.equal(await pg.evaluate(() => window.__lastCtx.state), 'suspended');
  // otro temporizador vuelve a preparar y a sonar
  await nextCard(pg); await toTimerCard(pg); await runToZero(pg);
  assert.equal(await beeps(pg), 6); assert.equal(await pg.evaluate(() => window.__ctx), 1, 'un solo AudioContext reutilizado');
  return pg;
});

await test('iPhone: cancelar antes de 00:00 no suena y suelta la sesión; sin ajuste de vibración', async () => {
  const pg = await page({ clock: true, init: IOS }); await start(pg); await toTimerCard(pg);
  await pg.click('#timer'); await ff(pg, 2000); await nextCard(pg);
  await ff(pg, 200000); await pg.waitForTimeout(50);
  assert.equal(await beeps(pg), 0);
  assert.equal(await pg.evaluate(() => navigator.audioSession.type), 'auto');
  await pg.click('#btnSettings'); await pg.waitForTimeout(300);
  assert.equal(await pg.$eval('#swVibe', e => e.closest('.list').hidden), true, 'no se ofrece una vibración que iOS no tiene');
  return pg;
});

await test('navegador sin audioSession ni vibrate: 3 pitidos y ningún error', async () => {
  const pg = await page({ clock: true, init: NO_APIS, saved: { ...SAVED, vibrate: true } }); await start(pg); await toTimerCard(pg);
  assert.equal(await pg.evaluate(() => typeof navigator.audioSession + '/' + typeof navigator.vibrate), 'undefined/undefined');
  await runToZero(pg); await ff(pg, 2000); await pg.waitForTimeout(50);
  assert.equal(await beeps(pg), 3);
  return pg; // test() comprueba que no hay errores de consola
});

await test('Android / Chrome: sin cambios — 3 pitidos y la vibración opcional sigue', async () => {
  const pg = await page({ clock: true, init: ANDROID, saved: { ...SAVED, vibrate: true } }); await start(pg); await toTimerCard(pg);
  assert.equal(await pg.evaluate(() => 'audioSession' in navigator), false);
  await pg.evaluate(() => { window.__vib.length = 0; });
  await runToZero(pg);
  assert.equal(await beeps(pg), 3);
  assert.deepEqual(await pg.evaluate(() => window.__vib), [[12, 60, 12]], 'vibra al terminar, como antes');
  await pg.click('#btnSettings'); await pg.waitForTimeout(300);
  assert.equal(await pg.$eval('#swVibe', e => e.closest('.list').hidden), false, 'el ajuste de vibración sigue visible');
  return pg;
});

await test('modo de prueba ?aviso: cualquier temporizador dura 3 s y suena al terminar', async () => {
  const pg = await page({ clock: true, query: '&aviso' }); await start(pg); await toTimerCard(pg);
  assert.equal((await timerState(pg)).text, '00:03');
  await pg.click('#timer'); await ff(pg, 2500); await pg.waitForTimeout(30); assert.equal(await beeps(pg), 0);
  await ff(pg, 1000); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done'));
  assert.equal(await beeps(pg), 3);
  return pg;
});

/* ---------- sin pausa de continuidad (2026-11-04) ---------- */
async function enterIntimacy(pg) {
  await pg.evaluate(() => { window.pab.setLevel(3); });
  await pg.click('#btnRoll'); await pg.waitForSelector('#sheetStart.open'); await pg.click('#btnStart');
  await pg.waitForSelector('#sheetClothing.open'); await pg.click('#btnClothingDone'); /* Intimidad empieza desde la ropa real */
  await pg.waitForSelector('#roundBox:not([hidden])'); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled);
}
/* SIGUIENTE en Intimidad: si la carta era de quitarse ropa, primero se responde (la hoja de ropa no es una pausa) */
async function resolveUndressSheet(pg, pick = 'last') { if (!(await isOpen(pg, '#sheetUndress'))) return; for (const col of await pg.$$('#undressGrid .col')) { const c = await col.$$('.chip'); await c[pick === 'last' ? c.length - 1 : 0].click(); } await pg.click('#btnUndressDone'); await pg.waitForFunction(() => !document.querySelector('#sheetUndress').classList.contains('open')); }
async function nextIntimate(pg, pick) {
  for (let i = 0; i < 3; i++) {
    await resolveUndressSheet(pg, pick); await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled);
    const r = await pg.evaluate(() => window.pab.state.round); await pg.click('#btnRoll');
    await pg.waitForFunction(r => window.pab.state.round > r || document.querySelector('#sheetUndress').classList.contains('open'), r);
    if (await pg.evaluate(r => window.pab.state.round > r, r)) { await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); return; }
  }
}
/* SIGUIENTE como la pareja: si sale una carta de quitarse ropa, se responde; devuelve las hojas que se abrieron por el camino */
async function playOn(pg, toCount) {
  const opened = new Set();
  for (let i = 0; i < 200 && await pg.evaluate(() => window.pab.session.intimacyCardCount) < toCount; i++) {
    for (const id of await pg.$$eval('.sheet.open', l => l.map(x => x.id))) opened.add(id);
    if (await isOpen(pg, '#sheetUndress')) { for (const col of await pg.$$('#undressGrid .col')) { const c = await col.$$('.chip'); await c[c.length - 1].click(); } await pg.click('#btnUndressDone'); await pg.waitForTimeout(350); continue; }
    await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); await pg.click('#btnRoll'); await pg.waitForTimeout(60);
  }
  for (const id of await pg.$$eval('.sheet.open', l => l.map(x => x.id))) opened.add(id);
  opened.delete('sheetUndress'); return [...opened];
}
await test('sin pausa: 60 cartas seguidas en Intimidad (13–17, 30, 40, 60) sin ninguna pregunta ni modal; terminar sigue siendo voluntario', async () => {
  const pg = await page();
  assert.equal(await pg.$('#sheetPause'), null, 'la hoja de la pausa ya no existe'); assert.equal(await pg.$('#btnPauseAlone'), null); assert.equal(await pg.$('#btnPauseGame'), null);
  await enterIntimacy(pg);
  for (const n of [17, 30, 40, 60]) {
    assert.deepEqual(await playOn(pg, n), [], `ninguna hoja abierta hasta la carta ${n}`);
    assert.equal(await pg.evaluate(() => window.pab.session.ended), null);
    assert.ok(!/Queréis seguir|Seguir por nuestra cuenta|Seguir con el juego/i.test(await pg.evaluate(() => document.body.innerText)));
  }
  const hist = await pg.evaluate(() => window.pab.history.rounds.length), cloth = await pg.evaluate(() => JSON.stringify(window.pab.clothing));
  assert.deepEqual(await playOn(pg, 61), [], 'la carta 61 llega igual');
  assert.equal(await pg.evaluate(() => window.pab.session.intimacyCardCount), 61); assert.ok(await pg.evaluate(() => window.pab.history.rounds.length) >= Math.min(60, hist), 'historial intacto');
  assert.ok(cloth.length > 0);
  await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled); await pg.waitForTimeout(150);
  await pg.click('#btnMore'); await pg.waitForSelector('#sheetMenu.open'); await pg.click('#menuList .mi:has-text("Terminar la sesión")');
  await pg.waitForSelector('#ending:not([hidden])');
  assert.equal(await pg.$eval('#endingText', e => e.textContent), 'Hasta aquí estuvo bien.');
  assert.ok(await pg.$eval('#btnNew', b => !b.hidden), 'cierre: nueva sesión disponible');
  return pg;
});

/* ---------- reloj interno de Intimidad: tiempo simulado ---------- */
const COUNT_INTERVALS = () => { const si = window.setInterval; window.__iv = 0; window.setInterval = (f, ms, ...a) => { if (ms === 10000) window.__iv++; return si(f, ms, ...a); }; };
const heatVar = pg => pg.evaluate(() => Number(getComputedStyle(document.documentElement).getPropertyValue('--heat') || 0));
const ambientOpacity = pg => pg.$eval('.ambient', a => Number(getComputedStyle(a).opacity));
const clockMin = pg => pg.evaluate(() => window.pabClock.elapsedMs() / 60000);
const MIN = 60000;
/* texto visible fuera del temporizador de la carta: ningún reloj de sesión, minutos, porcentaje ni duración */
const sessionTimeShown = pg => pg.evaluate(() => {
  const clone = document.body.cloneNode(true); for (const t of clone.querySelectorAll('#timer, script, style, [hidden], .sheet:not(.open)')) t.remove();
  const txt = clone.innerText || clone.textContent;
  return /\d+\s*(min|minutos|minuto|h\b|horas)|\d{1,2}:\d{2}|\d+\s*%|tiempo (de sesión|restante|transcurrido)|llevamos|quedan/i.test(txt) ? txt : null;
});
await test('reloj: Conexión y Deseo no lo inician; Intimidad sí; 34 normal · 35 empieza · 37 intermedio · 40 final · 50 igual; sin tiempo en pantalla', async () => {
  const pg = await page({ clock: true, lateInit: COUNT_INTERVALS, reducedMotion: 'reduce' }); await start(pg);
  await pg.clock.runFor(30 * MIN); await nextCard(pg); assert.equal(await clockMin(pg), 0, 'Conexión no acumula');
  await pg.click('#levelBtn'); await pg.waitForSelector('#sheetLevel.open'); await pg.click('#levelList .lv:nth-child(2)'); await pg.clock.runFor(2000);
  assert.equal(await pg.evaluate(() => window.pab.level()), 2);
  await pg.clock.runFor(30 * MIN); await nextCard(pg); assert.equal(await clockMin(pg), 0, 'Deseo no acumula'); assert.equal(await heatVar(pg), 0);
  await pg.click('#levelBtn'); await pg.waitForSelector('#sheetLevel.open'); await pg.click('#levelList .lv:nth-child(3)');
  await pg.waitForSelector('#sheetClothing.open', { timeout: 4000 }); await pg.click('#btnClothingDone'); await pg.clock.runFor(1000);
  await pg.waitForFunction(() => !document.querySelector('#btnRoll').disabled);
  assert.ok(await pg.evaluate(() => window.pabClock.running), 'entrar en Intimidad lo inicia');
  const at = async (m, label) => { const now = await clockMin(pg); await pg.clock.runFor(Math.max(0, (m - now) * MIN)); await pg.waitForTimeout(30); return { heat: await heatVar(pg), op: await ambientOpacity(pg), min: await clockMin(pg), label }; };
  let r = await at(34); assert.equal(r.heat, 0, `34 min: ${JSON.stringify(r)}`); assert.equal(r.op, 0);
  await nextIntimate(pg); await resolveUndressSheet(pg); await pg.click('#btnMore'); await pg.waitForSelector('#sheetMenu.open'); await pg.click('#menuList .mi:has-text("Estado de ropa")'); await pg.waitForSelector('#sheetClothing.open'); await pg.click('#btnClothingDone');
  await pg.waitForTimeout(200); await pg.mouse.click(5, 5); await pg.waitForTimeout(300);
  r = await at(35.01); assert.ok(r.heat >= 0 && r.heat < 0.03, `35 min: ${JSON.stringify(r)}`);
  r = await at(37); assert.ok(r.heat > 0.3 && r.heat < 0.5, `37 min: ${JSON.stringify(r)}`); assert.ok(Math.abs(r.op - r.heat) < 0.01, 'la capa sigue a --heat');
  assert.equal(await pg.$$eval('.sheet.open', l => l.length), 0, 'a los 35–37 min no aparece nada');
  r = await at(40.2); assert.equal(r.heat, 1, `40 min: ${JSON.stringify(r)}`); assert.equal(r.op, 1);
  assert.equal(await pg.$$eval('.sheet.open', l => l.length), 0, 'a los 40 min no aparece nada');
  r = await at(50); assert.equal(r.heat, 1); assert.equal(r.op, 1);
  assert.equal(await sessionTimeShown(pg), null, 'ningún tiempo de sesión en pantalla');
  const iv = await pg.evaluate(() => window.__iv); assert.equal(iv, 1, `un solo intervalo del reloj, por muchas pantallas que se abran (${iv})`);
  return pg;
});
await test('reloj: cartas, ropa, menú y cambios de pantalla no lo reinician; la página oculta suma como mucho 5 min; terminar lo congela; sesión nueva lo pone a 0', async () => {
  const pg = await page({ clock: true, init: () => { let hid = false; Object.defineProperty(document, 'hidden', { get: () => hid }); Object.defineProperty(document, 'visibilityState', { get: () => hid ? 'hidden' : 'visible' }); window.__setHidden = v => { hid = v; document.dispatchEvent(new Event('visibilitychange')); }; }, reducedMotion: 'reduce' });
  await enterIntimacy(pg);
  for (let i = 0; i < 8; i++) { await pg.clock.runFor(MIN); await nextIntimate(pg, 'first'); }
  await resolveUndressSheet(pg, 'first');
  const m8 = await clockMin(pg); assert.ok(m8 >= 8 && m8 < 8.2, `8 cartas en 8 min: ${m8}`);
  await pg.click('#btnMore'); await pg.waitForSelector('#sheetMenu.open'); await pg.mouse.click(5, 5); await pg.waitForTimeout(300);
  await pg.click('#btnFavs').catch(() => {}); await pg.waitForTimeout(200); await pg.mouse.click(5, 5); await pg.waitForTimeout(300);
  assert.ok(await clockMin(pg) >= m8, 'abrir hojas no reinicia');
  await pg.evaluate(() => window.__setHidden(true)); await pg.clock.runFor(90 * MIN); await pg.evaluate(() => window.__setHidden(false));
  const back = await clockMin(pg); assert.ok(back - m8 >= 5 && back - m8 < 5.3, `90 min fuera suman 5: ${back - m8}`);
  await pg.click('#btnMore'); await pg.waitForSelector('#sheetMenu.open'); await pg.click('#menuList .mi:has-text("Terminar la sesión")'); await pg.waitForSelector('#ending:not([hidden])');
  const frozen = await clockMin(pg); await pg.clock.runFor(60 * MIN); assert.ok(Math.abs(await clockMin(pg) - frozen) < 1e-9, 'tras el fin no suma');
  await pg.click('#btnNew'); await pg.clock.runFor(500); assert.equal(await clockMin(pg), 0, 'sesión nueva: 0'); assert.equal(await heatVar(pg), 0);
  return pg;
});
await test('atmósfera: detrás del contenido, sin toques, sin tocar el color del texto ni del rojo; después de 40 min todo funciona (SIGUIENTE, temporizador, pitidos)', async () => {
  const pg = await page({ clock: true, reducedMotion: 'reduce' }); await enterIntimacy(pg);
  const colors = () => pg.evaluate(() => { const g = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).color + '|' + getComputedStyle(e).backgroundColor : null; }; return [g('#phrase') || g('.phrase'), g('#btnRoll'), g('#levelBtn'), g('.turn'), g('#timer .t')]; });
  await pg.clock.runFor(5000); await pg.waitForTimeout(50); const before = await colors();
  await pg.clock.runFor(41 * MIN); await pg.waitForTimeout(30); assert.equal(await heatVar(pg), 1);
  assert.deepEqual(await colors(), before, 'texto, SIGUIENTE, selector de nivel y temporizador con los mismos colores');
  const amb = await pg.$eval('.ambient', a => { const s = getComputedStyle(a), w = getComputedStyle(document.querySelector('.wrap')); return { pe: s.pointerEvents, z: Number(s.zIndex), wz: Number(w.zIndex), aria: a.getAttribute('aria-hidden'), pos: s.position }; });
  assert.deepEqual(amb, { pe: 'none', z: 0, wz: 1, aria: 'true', pos: 'fixed' });
  const top = await pg.evaluate(() => { const b = document.querySelector('#btnRoll').getBoundingClientRect(); return document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2).closest('#btnRoll') != null; });
  assert.ok(top, 'SIGUIENTE recibe el toque, no la capa');
  for (let i = 0; i < 30 && await pg.$eval('#timer', t => t.hidden); i++) await nextIntimate(pg);
  await resolveUndressSheet(pg); const total = (await timerState(pg)).total; assert.ok(total > 0, 'hay una carta con tiempo');
  await pg.click('#timer'); await ff(pg, total * 1000 + 500); await pg.waitForFunction(() => document.querySelector('#timer').classList.contains('done'));
  assert.equal(await beeps(pg), 3, 'el temporizador de carta sigue sonando 3 veces');
  // salir de Intimidad: la película se retira
  await resolveUndressSheet(pg); await pg.click('#levelBtn'); await pg.waitForSelector('#sheetLevel.open'); await pg.click('#levelList .lv:nth-child(2)'); await pg.clock.runFor(2000);
  await pg.waitForTimeout(150); const st = await pg.evaluate(() => ({ lvl: window.pab.level(), cls: document.body.className, op: getComputedStyle(document.querySelector('.ambient')).opacity }));
  assert.equal(st.op, '0', `en Deseo no hay atmósfera ${JSON.stringify(st)}`);
  return pg;
});

await browser.close(); server.close();
console.log(`\n${passed} ok · ${failures} fallos`);
process.exit(failures ? 1 : 0);
