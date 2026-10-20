import type { APIRoute } from 'astro';
import { site, packages, faqs, steps } from '../site';

/** Resumen del negocio en texto plano, generado desde src/site.ts. */
export const GET: APIRoute = () => {
  const L: string[] = [];
  L.push(`# ${site.name}`, '');
  L.push(`> ${site.description}`, '');
  L.push('## Qué es Traka');
  L.push(`${site.name} es un estudio de ${site.city}, ${site.region}, Argentina. Hace dos cosas: optimiza el Perfil de Empresa en Google (antes Google Mi Negocio) y construye webs simples pensadas para el celular, para comercios y pymes de ${site.areaServed.join(' y ')}.`);
  L.push('');
  L.push('## Qué no hace');
  L.push('- No hace tiendas online ni desarrollos complejos.');
  L.push('- No promete el primer puesto en Google ni posiciones garantizadas.');
  L.push('- No mide resultados en likes: mide llamadas, mensajes de WhatsApp y consultas.');
  L.push('');
  L.push('## Paquetes');
  for (const p of packages) {
    L.push(`### ${p.name} — ${p.tag}`);
    L.push(`- Plazo: ${p.time}`);
    L.push(`- Para quién: ${p.who}`);
    L.push(`- Incluye: ${p.items.join('; ')}.`);
    L.push(`- Precio: cerrado, por escrito después de la primera charla${p.from ? ` (desde ${p.from})` : ''}.`);
    L.push(`- Detalle: ${site.url}/servicios/#${p.id}`);
    L.push('');
  }
  L.push('## Cómo se trabaja');
  steps.forEach((s, i) => L.push(`${i + 1}. ${s.t}: ${s.d}`));
  L.push('');
  L.push('## Contacto');
  L.push(`- Zona de trabajo: ${site.areaServed.join(', ')}. Base en ${site.city}, ${site.region}.`);
  if (site.whatsapp) L.push(`- WhatsApp: +${site.whatsapp}`);
  if (site.email) L.push(`- Email: ${site.email}`);
  if (site.googleBusiness) L.push(`- Perfil de Empresa en Google: ${site.googleBusiness}`);
  if (site.instagram) L.push(`- Instagram: ${site.instagram}`);
  if (site.hours.length) {
    L.push('- Horarios:');
    site.hours.forEach((h) => L.push(`  - ${h.d}: ${h.h}`));
  }
  L.push('');
  L.push('## Preguntas frecuentes');
  for (const f of faqs) L.push(`- ${f.q} ${f.a}`);
  L.push('');
  L.push('## Páginas');
  L.push(`- ${site.url}/ — Inicio: qué hace Traka y selector de necesidades.`);
  L.push(`- ${site.url}/servicios/ — Paquetes, alcance comparado y plazos.`);
  L.push(`- ${site.url}/sobre-nosotros/ — Origen, el nombre y cómo se trabaja.`);
  L.push('');

  return new Response(L.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
