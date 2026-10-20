/**
 * Control de calidad en celular. Necesita Playwright y el sitio ya construido:
 *   npm run build && npx astro preview --port 4321 &
 *   npm i --no-save playwright && npm run qa
 * Usa el Chromium del entorno; cambiá CHROMIUM si está en otro lado.
 */
const CHROMIUM = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
import { chromium, devices } from 'playwright';

const BASE = 'http://127.0.0.1:4321';
const PAGES = ['/', '/servicios/', '/sobre-nosotros/', '/legales/privacidad/', '/legales/cookies/', '/legales/terminos/', '/404.html'];
const PHONES = [
  ['iPhone SE', { width: 375, height: 667 }],
  ['iPhone 13', { width: 390, height: 844 }],
  ['Pixel 7', { width: 412, height: 915 }],
];
let fails = 0;
const bad = (m) => { fails++; console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch({ executablePath: CHROMIUM });

// 1 · desborde horizontal en celular
for (const [name, viewport] of PHONES) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, hasTouch: true, userAgent: devices['iPhone 13'].userAgent });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await new Promise((r) => { let y = 0; const t = setInterval(() => { window.scrollBy(0, 900); y += 900; if (y > document.body.scrollHeight + 2000) { clearInterval(t); r(); } }, 40); });
    });
    await page.waitForTimeout(600);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    if (m.sw > m.iw + 1) bad(`${name} ${p}: scrollWidth ${m.sw} > innerWidth ${m.iw}`);
    else ok(`${name} ${p}: ${m.sw}px = ${m.iw}px`);
  }
  // menú abierto
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.click('#menu-btn');
  await page.waitForTimeout(250);
  const m2 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, open: document.getElementById('menu-btn').getAttribute('aria-expanded') }));
  if (m2.open !== 'true') bad(`${name}: el menú no se abre`);
  else if (m2.sw > m2.iw + 1) bad(`${name} menú abierto: ${m2.sw} > ${m2.iw}`);
  else ok(`${name} menú abierto: sin desborde`);
  await ctx.close();
}

// 2 · interacciones
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (c) => { if (c.type() === 'error') errors.push(c.text()); });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });

// selector ¿Qué necesitás?
const needs = await page.$$('.needs__input');
console.log(`\nSelector: ${needs.length} opciones`);
for (const n of needs) {
  const id = await n.getAttribute('id');
  const want = id.replace('need-', '');
  const before = await page.evaluate(() => window.scrollY);
  await page.evaluate((i) => document.getElementById(i).click(), id);
  await page.waitForTimeout(260);
  const vis = await page.$$eval('.needs__preview', (els) => els.filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.dataset.need));
  const after = await page.evaluate(() => window.scrollY);

  if (want === 'none') {
    // Es la opción vacía: cierra el panel, no muestra ningún mensaje.
    if (vis.length !== 0) bad(`${id}: debería cerrar el panel y muestra ${JSON.stringify(vis)}`);
    else ok(`${id}: cierra el panel`);
    continue;
  }
  if (vis.length !== 1 || vis[0] !== want) { bad(`${id}: vista previa visible = ${JSON.stringify(vis)}`); continue; }
  if (Math.abs(after - before) > 4) { bad(`${id}: la pantalla saltó ${after - before}px`); continue; }

  // Lo importante en celular: el mensaje se ve sin tener que buscarlo con scroll.
  const caja = await page.$eval('.needs__panel', (el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, alto: r.height, ventana: window.innerHeight };
  });
  const visibleAhora = caja.top < caja.ventana && caja.bottom > 0;
  if (!visibleAhora) bad(`${id}: el mensaje queda fuera de pantalla (top ${Math.round(caja.top)} de ${caja.ventana})`);
  else if (caja.alto > caja.ventana * 0.8) bad(`${id}: el panel ocupa ${Math.round((caja.alto / caja.ventana) * 100)}% de la pantalla`);
  else ok(`${id}: el mensaje se ve sin scroll (${Math.round((caja.alto / caja.ventana) * 100)}% de la pantalla)`);
}

// acordeones FAQ
const faqs = await page.$$('details.faq');
await faqs[0].evaluate((d) => d.querySelector('summary').click());
await page.waitForTimeout(150);
if (!(await faqs[0].evaluate((d) => d.open))) bad('FAQ: no abre'); else ok(`FAQ: ${faqs.length} preguntas, abre y cierra`);

// carrusel de actos
const scrolled = await page.evaluate(async () => {
  const r = document.querySelector('.snap-row--acts');
  if (!r) return -1;
  r.scrollLeft = r.scrollWidth;
  await new Promise((x) => setTimeout(x, 200));
  return r.scrollLeft;
});
scrolled > 0 ? ok(`Carrusel de actos: desliza (${Math.round(scrolled)}px)`) : bad('Carrusel de actos: no desliza');

// 3 · links y wa.me
const links = await page.$$eval('a[href]', (as) => as.map((a) => ({ href: a.getAttribute('href'), wa: a.dataset.wa || null, text: (a.textContent || '').trim().slice(0, 40) })));
const waLinks = links.filter((l) => l.wa);
console.log(`\nWhatsApp: ${waLinks.length} botones en la home`);
const sinOrigen = await page.$$eval('a[href*="wa.me"]:not([data-wa])', (a) => a.length);
if (sinOrigen) bad(`${sinOrigen} links wa.me sin data-wa (no se miden)`); else ok('todos los links de WhatsApp llevan origen medido');

// 4 · zoom permitido
const vp = await page.$eval('meta[name=viewport]', (m) => m.content);
/user-scalable=no|maximum-scale/.test(vp) ? bad(`viewport bloquea el zoom: ${vp}`) : ok(`zoom permitido (${vp})`);

// 5 · TODO visibles
for (const p of PAGES) {
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
  const t = await page.evaluate(() => document.body.innerText);
  const hit = t.match(/PENDIENTE|TODO\(|\[PRECIO/i);
  if (hit) bad(`${p}: texto pendiente visible → ${hit[0]}`);
}
ok('ninguna página muestra marcadores pendientes');

if (errors.length) { bad('errores de consola: ' + errors.slice(0, 4).join(' | ')); } else ok('sin errores de JavaScript en consola');

await browser.close();
console.log(fails ? `\nFALLAS: ${fails}` : '\nTODO OK');
process.exit(fails ? 1 : 0);
