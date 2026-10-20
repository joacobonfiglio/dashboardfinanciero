/**
 * Falla si una página indexable no está en el sitemap, o si una página con
 * noindex sí está. Corre sobre /dist, después de `npm run build`.
 *   node --test tests/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://trakadigital.com';

const html = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full);
    else if (e === 'index.html') html.push(full);
  }
})(DIST);

const sitemap = existsSync(join(DIST, 'sitemap-0.xml')) ? readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8') : '';

test('hay build y sitemap', () => {
  assert.ok(html.length > 0, 'no hay páginas en /dist');
  assert.ok(sitemap.length > 0, 'falta dist/sitemap-0.xml');
});

for (const file of html) {
  const route = '/' + relative(DIST, file).replace(/index\.html$/, '');
  const body = readFileSync(file, 'utf8');
  const noindex = /name="robots"[^>]*content="[^"]*noindex/.test(body);
  const loc = `<loc>${SITE}${route}</loc>`;

  test(`${route} ${noindex ? 'con noindex, fuera del sitemap' : 'indexable y en el sitemap'}`, () => {
    if (noindex) assert.ok(!sitemap.includes(loc), `${route} tiene noindex pero está en el sitemap`);
    else assert.ok(sitemap.includes(loc), `${route} es indexable y falta en el sitemap`);
  });

  test(`${route} tiene un solo H1, canonical, title y description`, () => {
    const h1 = body.match(/<h1[\s>]/g) || [];
    assert.equal(h1.length, 1, `${route} tiene ${h1.length} H1`);
    assert.ok(body.includes(`<link rel="canonical" href="${SITE}${route}">`), `${route} sin canonical correcto`);
    const title = body.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
    assert.ok(title.length > 0 && title.length <= 60, `${route}: title de ${title.length} caracteres (máximo 60)`);
    const desc = body.match(/<meta name="description" content="(.*?)"/)?.[1] ?? '';
    assert.ok(desc.length > 0 && desc.length <= 158, `${route}: description de ${desc.length} caracteres (máximo 158)`);
  });
}

test('el JSON-LD de cada página es válido', () => {
  for (const file of html) {
    const route = '/' + relative(DIST, file).replace(/index\.html$/, '');
    const blocks = [...readFileSync(file, 'utf8').matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
    assert.ok(blocks.length >= 2, `${route} sin JSON-LD`);
    for (const [, raw] of blocks) {
      const data = JSON.parse(raw);
      assert.ok(data['@context'] === 'https://schema.org' && data['@type'], `${route}: JSON-LD sin @context o @type`);
      assert.ok(!JSON.stringify(data).includes('aggregateRating'), `${route}: no se publican estrellas propias`);
    }
  }
});
