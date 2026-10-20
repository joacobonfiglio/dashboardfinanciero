# Traka — trakadigital.com

Astro (salida estática) + Tailwind v4. **Sin librerías de animación**: el movimiento es CSS
(`@keyframes`, `scroll-snap`, `:has()`) más un único `src/scripts/motion.ts` con IntersectionObserver.
Fuentes autoalojadas con Fontsource.

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera /dist
npm test         # sitemap, H1, canonical, largo de title/description y JSON-LD sobre /dist
npm run qa       # control de calidad en celular con Playwright (ver abajo)
```

## Páginas

| URL | Qué es |
|---|---|
| `/` | Home: hero, selector "¿Qué necesitás?", tres actos, paquetes, casos, proceso, FAQ |
| `/servicios/` | Los tres paquetes, tabla de alcance comparado, lo que no hacemos |
| `/sobre-nosotros/` | Origen, el nombre, cómo trabajamos |
| `/legales/privacidad/` · `/legales/cookies/` · `/legales/terminos/` | Legales, con `noindex, follow` y fuera del sitemap |
| `404` | Página propia con salida a WhatsApp |
| `/llms.txt` | Resumen en texto plano para asistentes de IA, generado desde `src/site.ts` |

## Una sola fuente de datos: `src/site.ts`

Contacto, ciudad, horarios, paquetes, FAQ, casos y las opciones del selector salen de ahí.
De ese archivo se alimentan el texto visible, el JSON-LD, el sitemap y `/llms.txt`.

**Regla: lo que no está confirmado queda vacío y no se muestra.** Cada dato pendiente tiene
su `TODO(cliente)` en el código; ninguno aparece en pantalla.

### Conectar WhatsApp
Poné el número en `site.whatsapp`, en formato internacional sin `+` (ej. `5492235551234`).
Hasta entonces los botones se ven pero no abren nada. Cada botón lleva su mensaje precargado
y un `data-wa` con el origen (header, hero, selector-google, paquete-fuego, flotante…).

### Medición
`PUBLIC_GA_ID` en `.env.production` (y en Vercel). Analytics y el aviso de cookies solo se
cargan en producción y solo si ese ID existe. Hasta que la persona acepta, el consentimiento
está en `denied`; la elección se guarda en `localStorage` y se puede cambiar desde
`/legales/cookies/`.

Eventos: `click_whatsapp` con `ubicacion` y `servicio`, y `click_como_llegar` en el pie.

## Control de calidad en celular

`npm run qa` necesita Playwright y el sitio ya construido y servido:

```bash
npm run build
npx astro preview --port 4321 &
npm i --no-save playwright
npm run qa
```

Revisa, en iPhone SE / iPhone 13 / Pixel 7: desborde horizontal (con scroll hasta el final y
con el menú abierto), el selector, los acordeones, el carrusel, que todos los links de
WhatsApp estén medidos, que el zoom siga habilitado y que no haya marcadores pendientes a la vista.

## Editar contenido
- Paquetes, FAQ, proceso, casos y selector: `src/site.ts`.
- Tokens de color, tipografía y componentes visuales: `src/styles/global.css`.
