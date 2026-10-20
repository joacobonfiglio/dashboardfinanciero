import { chromium } from 'playwright';
const B = 'http://127.0.0.1:4321';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const grab = async (p, sel, path, wait = 3800) => {
  if (sel) { await p.locator(sel).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(1100); }
  else await p.waitForTimeout(wait);
  await p.screenshot({ path });
};
const d = await (await b.newContext({ viewport: { width: 1440, height: 950 } })).newPage();
await d.goto(B + '/', { waitUntil: 'networkidle' });
await grab(d, null, 'shots/v2-1-hero.png');
await grab(d, '#que-necesitas', 'shots/v2-2-selector.png');
await grab(d, '#servicios', 'shots/v2-3-servicios.png');
await grab(d, '#casos', 'shots/v2-4-casos.png');
await grab(d, '#proceso', 'shots/v2-5-proceso.png');
const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
await m.goto(B + '/', { waitUntil: 'networkidle' });
await grab(m, null, 'shots/v2-m1-hero.png');
await m.locator('#que-necesitas').scrollIntoViewIfNeeded();
await m.waitForTimeout(900);
await m.screenshot({ path: 'shots/v2-m2-selector.png' });
await m.evaluate(() => document.getElementById('need-web').click());
await m.waitForTimeout(700);
await m.screenshot({ path: 'shots/v2-m3-panel.png' });
await b.close();
