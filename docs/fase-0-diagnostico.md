# Fase 0 · Diagnóstico y arquitectura

Fecha: octubre de 2026. Base: el sitio que estaba en el repositorio (commit `07ca3a2`).

## Qué había

Astro estático con cuatro páginas (`/`, `/servicios/`, `/sobre-nosotros/`, 404), identidad de
fuego ya definida (arena, carbón, fuego, brasa, chispa, mar) y un recurso visual propio: la
mecha que se quema con el scroll.

Puntos flojos detectados:

| Hallazgo | Impacto |
|---|---|
| 145 KB de JavaScript (GSAP + ScrollTrigger + SplitText + Lenis) | Arranque lento en celulares de gama media, justo el dispositivo del cliente objetivo |
| Sin selector "¿Qué necesitás?" ni vista previa del mensaje | La conversión dependía de un botón genérico de WhatsApp |
| Sin botón flotante de WhatsApp | Se pierde la consulta de quien ya scrolleó medio sitio |
| Marcadores `[PENDIENTE: …]` y `[PRECIO PENDIENTE]` visibles en producción | Resta credibilidad y promete datos que no están |
| Métricas de casos inventadas como placeholder | Riesgo: no se publica nada sin confirmar |
| Sin páginas legales, sin `/llms.txt`, sin medición, `robots.txt` genérico | Huecos de SEO técnico, GEO y cumplimiento |
| Datos del negocio repartidos entre `config.ts`, `Base.astro` y el pie | Cada cambio de teléfono o ciudad había que hacerlo en varios lugares |

## Inventario de URLs

No se pudo rastrear `trakadigital.com` desde este entorno (la red de la sesión no llega al
dominio). El inventario se hizo sobre el repositorio: `/`, `/servicios/`, `/sobre-nosotros/`
y la 404. **Las tres URLs siguen existiendo con la misma ruta**, así que no hay redirecciones
pendientes por este cambio.

**TODO(Traka):** antes de publicar, cruzar el sitemap viejo de producción con el nuevo. Si en
producción hay URLs que no están en este repositorio, cada una necesita un 301 en `vercel.json`.

## Arquitectura de páginas

| URL | H1 | Intención | Palabra clave principal |
|---|---|---|---|
| `/` | Que te encuentren en Google | Transaccional local | webs y posicionamiento en Google para negocios |
| `/servicios/` | Webs y Google, con precio cerrado | Transaccional / comparativa | paquetes de web y Google con precio cerrado |
| `/sobre-nosotros/` | Webs que traen consultas, no adornos | Confianza / marca | agencia web Mar del Plata |
| `/legales/*` | Según la página | Cumplimiento (`noindex, follow`) | — |

### Siguiente capa de contenido (fase 9, cuando haya datos)
- Páginas por rubro: "web para lavanderías", "web para estudios contables", cada una con su
  mensaje de WhatsApp propio.
- Páginas por zona, solo donde haya trabajo real hecho.
- Guías: "cómo optimizar tu Perfil de Empresa en Google", "qué mirar antes de contratar una web".

## Datos que faltan para completar el sitio

Todos están como `TODO(cliente)` en `src/site.ts` y ninguno se muestra hoy en pantalla:

1. Número de WhatsApp (sin esto, los 13 botones del sitio no abren nada).
2. Email de contacto e Instagram.
3. Link del Perfil de Empresa en Google.
4. Horarios de atención.
5. Razón social y CUIT, para las páginas legales.
6. Precio "desde" de cada paquete, si se decide publicarlo.
7. URL pública y una métrica verificada por caso (Aquabon, Tintorería Constitución, Llama Divina, Aquabon Gestión).
8. Foto real del equipo o de la ciudad.

## Lo que no se pudo verificar en este entorno

- La web en producción y su sitemap: la red de la sesión no llega a `trakadigital.com`.
- Competencia local y volumen de búsquedas: requiere acceso a buscadores o a una herramienta de SEO.
- La ficha de Google Business: hace falta el acceso al perfil.
- La validación de datos estructurados contra el validador de Google: se validó localmente
  (JSON parseable, `@context` y `@type` presentes, sin `aggregateRating` propio).
