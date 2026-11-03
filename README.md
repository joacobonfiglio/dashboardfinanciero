# Traka — trakadigital.com

Astro (salida estática) + Tailwind v4. **Sin librerías de animación en el navegador**: el
movimiento es CSS (`@keyframes`, `scroll-snap`, `:has()`, `::details-content`, transiciones de
vista nativas) más un único `src/scripts/motion.ts` con IntersectionObserver. Fuentes
autoalojadas con Fontsource.

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera /dist
npm test         # sitemap, H1, canonical, largo de title/description y JSON-LD sobre /dist
npm run og       # regenera las imágenes de Open Graph en /public/og
npm run qa       # control de calidad en celular con Playwright (ver abajo)
```

## Páginas

| URL | Qué es |
|---|---|
| `/` | Home: hero, selector "¿Qué necesitás?", tres actos, servicios con precio, casos, proceso, FAQ y guías |
| `/servicios/desarrollo-web/` | Desarrollo de páginas web — desde $200.000 |
| `/servicios/google-y-redes/` | Perfil de Empresa en Google y redes — desde $100.000 |
| `/servicios/herramientas-a-medida/` | Herramientas y plataformas a medida — a presupuesto |
| `/guias/` + `/guias/<slug>/` | Centro de guías |
| `/sobre-nosotros/` | Origen, el nombre, cómo trabajamos |
| `/legales/privacidad/` · `/legales/cookies/` · `/legales/terminos/` | Legales, con `noindex, follow` y fuera del sitemap |
| `404` | Página propia con salida a WhatsApp |
| `/llms.txt` | Resumen en texto plano para asistentes de IA, generado desde los mismos datos |

`/servicios/` (la vieja página general) redirige con 301 al listado de la home: ver `vercel.json`.

## Una sola fuente de datos: `src/site.ts`

Contacto, ciudad, servicios con su precio y **todo el contenido de cada página de servicio**
(qué incluye, cuándo te sirve, preguntas frecuentes) salen de ahí. De ese archivo se alimentan
el texto visible, el JSON-LD, el sitemap, las imágenes de Open Graph y `/llms.txt`.

**Regla: lo que no está confirmado queda vacío y no se muestra.** Cada dato pendiente tiene su
`TODO(cliente)` en el código; ninguno aparece en pantalla.

### Agregar un servicio
Sumá una entrada a `servicios` en `src/site.ts` con su bloque `detalle` y su `page`. La página
se genera sola desde `src/pages/servicios/[slug].astro`, y entra en el menú, en el sitemap y en
`/llms.txt` sin tocar nada más. Después corré `npm run og`.

### Agregar una guía
Creá un `.md` en `src/content/guias/`. El frontmatter está tipado en `src/content.config.ts`
(el build falla si el `title` pasa de 60 caracteres o la `description` de 158). Con `servicio:`
la guía enlaza sola al servicio que corresponde. Después corré `npm run og`.

### Conectar WhatsApp
Poné el número en `site.whatsapp`, en formato internacional sin `+` (ej. `5492235551234`).
Hasta entonces los botones se ven pero no abren nada. Cada botón lleva su mensaje precargado y
un `data-wa` con el origen (header, hero, selector-google, servicio-web, guia-…, flotante…).

### Medición
`PUBLIC_GA_ID` en `.env.production` (y en Vercel). Analytics y el aviso de cookies solo se
cargan en producción y solo si ese ID existe. Hasta que la persona acepta, el consentimiento
está en `denied`; la elección se guarda en `localStorage` y se puede cambiar desde
`/legales/cookies/`. Eventos: `click_whatsapp` con `ubicacion` y `servicio`, y `click_como_llegar`.

## Imágenes de Open Graph

`npm run og` genera una imagen por página con satori + resvg, usando la tipografía y los colores
de la marca, y las deja en `public/og/`. Los PNG se versionan en el repositorio **a propósito**:
así el deploy no depende de binarios nativos. Hay que volver a correrlo cuando cambia un título
de servicio o de guía.

## Control de calidad en celular

`npm run qa` necesita Playwright y el sitio ya construido y servido:

```bash
npm run build
npx astro preview --port 4321 &
npm i --no-save playwright
npm run qa
```

Revisa, en iPhone SE / iPhone 13 / Pixel 7 y sobre las 12 páginas: desborde horizontal (con
scroll hasta el final y con el menú abierto), el selector y su panel, los acordeones, el
carrusel, que todos los links de WhatsApp estén medidos, que el zoom siga habilitado y que no
haya marcadores pendientes a la vista.

## Editar el diseño
Tokens de color, tipografía y componentes visuales: `src/styles/global.css`.
