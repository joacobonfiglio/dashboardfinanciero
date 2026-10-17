# Traka — trakadigital.com

Astro (salida estática) + Tailwind v4 + GSAP/ScrollTrigger/SplitText + Lenis. Fuentes autoalojadas con Fontsource.

```bash
npm install
npm run dev      # desarrollo
npm run build    # genera /dist
```

## Páginas construidas
`/` · `/servicios/` · `/sobre-nosotros/` · `404`

## Conectar WhatsApp
Todos los botones usan `waHref()` de `src/config.ts`. Hoy `WHATSAPP_NUMBER` está vacío, así que los botones se ven pero no abren nada. Poné el número en formato internacional sin `+` (ej. `5492235551234`) y todos quedan conectados, cada uno con su mensaje precargado y su atributo `data-wa` (origen) para analítica.

## Editar contenido
- Paquetes, precios y FAQ: `src/config.ts` (`packages`, `faqs`).
- Los marcadores `[PENDIENTE: …]` y `[PRECIO PENDIENTE]` son visibles a propósito.
