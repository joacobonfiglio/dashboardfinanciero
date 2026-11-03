/**
 * Falla si un enlace interno apunta a una página que no existe, o a un ancla
 * que no está en la página de destino. Corre sobre /dist, después de `npm run build`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

const paginas = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full);
    else if (e.endsWith('.html')) paginas.push(full);
  }
})(DIST);

/** Dónde vive en /dist la ruta que pide un enlace. */
function archivoDe(ruta) {
  if (ruta === '/') return join(DIST, 'index.html');
  const limpia = ruta.replace(/^\//, '');
  const directo = join(DIST, limpia);
  if (existsSync(directo) && statSync(directo).isFile()) return directo;
  const conIndex = join(DIST, limpia, 'index.html');
  return existsSync(conIndex) ? conIndex : null;
}

const enlaces = new Map(); // ruta -> páginas donde aparece
for (const f of paginas) {
  const origen = '/' + relative(DIST, f).replace(/index\.html$/, '');
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1];
    if (!enlaces.has(href)) enlaces.set(href, new Set());
    enlaces.get(href).add(origen);
  }
}

test('hay páginas construidas', () => assert.ok(paginas.length > 5, `solo ${paginas.length} páginas en /dist`));

for (const [href, origenes] of [...enlaces].sort()) {
  const [ruta, ancla] = href.split('#');
  const desde = [...origenes].join(', ');

  test(`enlace ${href} (desde ${desde})`, () => {
    const destino = archivoDe(ruta || '/');
    assert.ok(destino, `${href} no existe en /dist (enlazado desde ${desde})`);
    if (!ancla) return;
    const html = readFileSync(destino, 'utf8');
    const tieneId = new RegExp(`id="${ancla.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}"`).test(html);
    assert.ok(tieneId, `${href}: la página existe pero no tiene id="${ancla}" (enlazado desde ${desde})`);
  });
}
