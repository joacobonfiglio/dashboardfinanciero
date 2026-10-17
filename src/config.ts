// Datos de contacto. Mientras falten, los botones de WhatsApp se muestran pero no abren nada.
// Para conectarlos: poné el número en formato internacional sin "+" (ej. "5492235551234").
export const WHATSAPP_NUMBER = '';
export const EMAIL = '[EMAIL]';
export const INSTAGRAM_URL = '';

export const SITE_URL = 'https://trakadigital.com';

/** Link de WhatsApp con mensaje precargado. Sin número devuelve "#" (botón visible, sin conectar). */
export function waHref(message: string): string {
  if (!WHATSAPP_NUMBER) return '#';
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const packages = [
  {
    id: 'chispa',
    name: 'Chispa',
    tag: 'Que te encuentren',
    time: '10 días',
    summary: 'Para aparecer en Google y Maps cuanto antes.',
    items: [
      'Perfil de Empresa en Google optimizado',
      'Landing de una página',
      'Botón de WhatsApp',
      'Plan de reseñas',
    ],
  },
  {
    id: 'fuego',
    name: 'Fuego',
    tag: 'Que te elijan',
    time: '3–4 semanas',
    featured: true,
    summary: 'La web completa para que te encuentren y te elijan.',
    items: [
      'Todo lo de Chispa',
      'Web de hasta 5 secciones',
      'SEO local',
      'Analytics y Search Console',
      'Redacción incluida',
    ],
  },
  {
    id: 'brasa',
    name: 'Brasa',
    tag: 'Que no se apague',
    time: 'Mensual',
    summary: 'Para sostener lo que ya funciona y medirlo.',
    items: [
      'Mantenimiento de la web',
      'Publicaciones en el Perfil',
      'Gestión de reseñas',
      'Informe mensual de consultas',
    ],
  },
] as const;

export const faqs = [
  {
    q: '¿Cuánto cuesta?',
    a: 'Cada paquete tiene precio cerrado: lo que te pasamos al empezar es lo que pagás. Los valores "desde" están en la sección de paquetes [PRECIO PENDIENTE].',
  },
  {
    q: '¿Me prometen aparecer primeros en Google?',
    a: 'No. Nadie puede prometerlo. Lo que sí hacemos es que te encuentren más, y te lo mostramos con datos: llamadas, mensajes de WhatsApp y consultas.',
  },
  {
    q: '¿Cuánto tarda?',
    a: 'Chispa, unos 10 días. Fuego, entre 3 y 4 semanas. Los plazos quedan por escrito antes de empezar.',
  },
  {
    q: '¿Qué es el Perfil de Empresa en Google?',
    a: 'Es la ficha que aparece en Google y en Maps cuando alguien busca tu negocio o tu rubro: dirección, horarios, fotos, reseñas y botón para llamarte. Antes se llamaba Google Mi Negocio.',
  },
  {
    q: '¿Hacen tiendas online?',
    a: 'No. Hacemos webs simples que traen consultas: quién sos, qué hacés, dónde estás y cómo escribirte.',
  },
  {
    q: '¿Con quién hablo?',
    a: 'Con una sola persona, por WhatsApp. No hay call centers ni tickets.',
  },
] as const;
