/**
 * Genera las imágenes de Open Graph de cada página, con la tipografía y los
 * colores de la marca. Se corren a mano (`npm run og`) y los PNG quedan en
 * el repositorio, así el deploy no depende de binarios nativos.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { servicios } from '../src/site.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fuente = (f) => readFileSync(join(raiz, 'node_modules/@fontsource/dm-sans/files', f));
const fonts = [
  { name: 'DM Sans', data: fuente('dm-sans-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'DM Sans', data: fuente('dm-sans-latin-700-normal.woff'), weight: 700, style: 'normal' },
];

const COLOR = { papel: '#FBF8F3', carbon: '#1F1813', fuego: '#FF5B24', brasa: '#C33C0F', ceniza: '#8C7F73' };

const caja = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });

function tarjeta({ kicker, titulo, pie }) {
  const tam = titulo.length > 62 ? 52 : titulo.length > 44 ? 60 : 70;
  return caja(
    {
      width: 1200, height: 630, boxSizing: 'border-box', flexDirection: 'column', justifyContent: 'space-between',
      backgroundColor: COLOR.papel, padding: '60px 72px', fontFamily: 'DM Sans',
      backgroundImage: 'radial-gradient(circle at 94% 6%, rgba(255,91,36,0.20), rgba(255,91,36,0) 45%), radial-gradient(circle at 2% 98%, rgba(255,184,51,0.22), rgba(255,184,51,0) 40%)',
    },
    [
      caja({ alignItems: 'center', gap: 14 }, [
        caja({ fontSize: 42, fontWeight: 700, letterSpacing: -1.6, color: COLOR.carbon }, 'traka'),
        caja({ width: 18, height: 18, borderRadius: 999, backgroundColor: COLOR.fuego }, []),
      ]),

      caja({ flexDirection: 'column' }, [
        caja({ fontSize: 22, fontWeight: 700, letterSpacing: 4, color: COLOR.brasa }, kicker.toUpperCase()),
        caja({ marginTop: 18, fontSize: tam, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2.4, color: COLOR.carbon }, titulo),
      ]),

      caja({ alignItems: 'center', justifyContent: 'space-between' }, [
        caja({ backgroundColor: COLOR.fuego, color: COLOR.carbon, padding: '14px 28px', borderRadius: 999, fontSize: 26, fontWeight: 700 }, pie),
        caja({ fontSize: 24, color: COLOR.ceniza }, 'trakadigital.com'),
      ]),
    ],
  );
}

async function png(datos, destino) {
  const svg = await satori(tarjeta(datos), { width: 1200, height: 630, fonts });
  const buf = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  writeFileSync(join(raiz, destino), buf);
  console.log('✓', destino, `(${Math.round(buf.length / 1024)} KB)`);
}

/** Frontmatter de las guías, sin dependencias de YAML. */
function guias() {
  const dir = join(raiz, 'src/content/guias');
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => {
    const txt = readFileSync(join(dir, f), 'utf8');
    const campo = (k) => txt.match(new RegExp(`^${k}:\\s*"?(.+?)"?\\s*$`, 'm'))?.[1] ?? '';
    return { slug: f.replace(/\.md$/, ''), h1: campo('h1'), kicker: campo('kicker'), lectura: campo('lectura') };
  });
}

await png({ kicker: 'Webs y Google', titulo: 'Que te encuentren en Google.', pie: 'Webs desde $200.000' }, 'public/og.png');
await png({ kicker: 'Guías', titulo: 'Lo que sabemos, escrito para que lo hagas vos.', pie: 'Guías de Traka' }, 'public/og/guias.png');
await png({ kicker: 'Sobre nosotros', titulo: 'Webs que traen consultas, no adornos.', pie: 'Desde Mar del Plata' }, 'public/og/sobre-nosotros.png');

for (const s of servicios) {
  if (!s.detalle) continue;
  await png({ kicker: s.detalle.kicker, titulo: s.detalle.h1, pie: s.price }, `public/og/${s.id}.png`);
}
for (const g of guias()) {
  await png({ kicker: g.kicker, titulo: g.h1, pie: `Guía · ${g.lectura} min` }, `public/og/guia-${g.slug}.png`);
}
