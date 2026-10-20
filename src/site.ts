/**
 * Fuente única de datos del negocio.
 * De acá salen: el texto visible, el JSON-LD, /llms.txt y los links de WhatsApp.
 * Regla: lo que no está confirmado queda vacío y NO se muestra en la web.
 */

export const site = {
  name: 'Traka',
  tagline: 'Que te encuentren.',
  url: 'https://trakadigital.com',
  description: 'Webs simples y Perfil de Empresa en Google para comercios y pymes. Precio cerrado, plazos por escrito y una persona que responde por WhatsApp.',

  // TODO(cliente): número de WhatsApp en formato internacional sin "+" (ej. 5492235551234).
  whatsapp: '',
  // TODO(cliente): email de contacto.
  email: '',
  // TODO(cliente): URL del perfil de Instagram.
  instagram: '',
  // TODO(cliente): URL del Perfil de Empresa en Google.
  googleBusiness: '',

  city: 'Mar del Plata',
  region: 'Buenos Aires',
  country: 'AR',
  // TODO(cliente): calle y número. Vacío = no se publica dirección (negocio sin local a la calle).
  street: '',
  areaServed: ['Argentina', 'España'],
  // TODO(cliente): horarios de atención confirmados, ej. [{ d: 'Lunes a viernes', h: '9:00 a 18:00' }].
  hours: [] as { d: string; h: string }[],

  // Datos fiscales para las páginas legales. Se muestran solo cuando están completos.
  legal: {
    // TODO(cliente): razón social / titular.
    holder: '',
    // TODO(cliente): CUIT.
    taxId: '',
  },

  // Medición: el ID va en .env (PUBLIC_GA_ID). Vacío = no se carga nada.
  gaId: import.meta.env.PUBLIC_GA_ID ?? '',
} as const;

export const SITE_URL = site.url;

/** Link de WhatsApp con mensaje precargado. Sin número devuelve "#" (botón visible, sin conectar). */
export function waHref(message: string): string {
  if (!site.whatsapp) return '#';
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

/* ---------------------------------------------------------------- paquetes */

export type Pkg = {
  id: string;
  name: string;
  tag: string;
  time: string;
  summary: string;
  items: readonly string[];
  who: string;
  featured?: boolean;
  /** TODO(cliente): precio "desde". Vacío = no se muestra ningún precio. */
  from?: string;
};

export const packages: readonly Pkg[] = [
  {
    id: 'chispa',
    name: 'Chispa',
    tag: 'Que te encuentren',
    time: '10 días',
    summary: 'Para aparecer en Google y en Maps cuanto antes.',
    items: [
      'Perfil de Empresa en Google optimizado',
      'Landing de una página',
      'Botón de WhatsApp',
      'Plan de reseñas',
    ],
    who: 'Tenés un negocio y cuando alguien te busca en Google no aparecés, o aparecés con datos viejos. Lo resolvemos rápido.',
    from: '',
  },
  {
    id: 'fuego',
    name: 'Fuego',
    tag: 'Que te elijan',
    time: '3 a 4 semanas',
    featured: true,
    summary: 'La web completa para que te encuentren y te elijan.',
    items: [
      'Todo lo de Chispa',
      'Web de hasta 5 secciones',
      'SEO local',
      'Analytics y Search Console',
      'Redacción incluida',
    ],
    who: 'Querés una web propia que te presente bien, te posicione en tu zona y reciba consultas todos los días.',
    from: '',
  },
  {
    id: 'brasa',
    name: 'Brasa',
    tag: 'Que no se apague',
    time: 'Mensual',
    summary: 'Para sostener lo que ya funciona y medirlo.',
    items: [
      'Mantenimiento de la web',
      'Publicaciones en el Perfil de Empresa',
      'Gestión de reseñas',
      'Informe mensual de consultas',
    ],
    who: 'Ya tenés tu web y tu Perfil, y no querés que se apaguen. Los mantenemos vivos y medimos qué trae cada uno.',
    from: '',
  },
];

/* -------------------------------------------------------- barra superior */

/** Barra de oferta arriba de todo: lo primero que se ve y lleva al WhatsApp. */
export const topbar = {
  text: 'Webs a partir de $200.000',
  cta: 'Quiero más información',
  message: 'Hola, vi que las webs de Traka arrancan en $200.000 y quiero más información.',
};

/* ---------------------------------------------------------------- servicios */

export type Servicio = {
  id: string;
  name: string;
  price: string;
  /** Aclaración debajo del precio, cuando hace falta explicarlo. */
  priceNote?: string;
  summary: string;
  items: readonly string[];
  cta: string;
  message: string;
  icon: string;
  featured?: boolean;
};

export const servicios: readonly Servicio[] = [
  {
    id: 'web',
    name: 'Desarrollo de páginas web',
    price: 'Desde $200.000',
    summary: 'Tu web propia, pensada primero para el celular y para que te escriban.',
    items: [
      'Diseño y desarrollo a medida',
      'Textos y estructura incluidos',
      'Botón de WhatsApp en cada sección',
      'Medición de las consultas que entran',
    ],
    cta: 'Quiero mi web',
    message: 'Hola, quiero una web para mi negocio. Vi que arrancan en $200.000.',
    icon: 'ph:browsers-bold',
    featured: true,
  },
  {
    id: 'google',
    name: 'Google y redes sociales',
    price: 'Desde $100.000',
    summary: 'Mejora y optimización de tu Perfil de Empresa en Google (Google My Business) y de tus redes.',
    items: [
      'Perfil de Empresa en Google optimizado',
      'Fotos, horarios y servicios al día',
      'Plan de reseñas',
      'Puesta a punto de tus redes',
    ],
    cta: 'Quiero mejorar mi Google',
    message: 'Hola, quiero mejorar mi Perfil de Empresa en Google y mis redes. Vi que arranca en $100.000.',
    icon: 'ph:map-pin-bold',
  },
  {
    id: 'medida',
    name: 'Herramientas y plataformas a medida',
    price: 'A presupuesto',
    priceNote: 'Depende del tamaño y del tiempo que lleve hacerlo, por eso lo charlamos antes.',
    summary: 'Sistemas internos, paneles y plataformas propias para lo que tu negocio necesita.',
    items: [
      'Relevamiento de lo que hacés hoy',
      'Presupuesto cerrado antes de empezar',
      'Desarrollo a medida',
      'Soporte después de entregar',
    ],
    cta: 'Pedir presupuesto',
    message: 'Hola, necesito una herramienta o plataforma a medida y quiero pedir un presupuesto.',
    icon: 'ph:squares-four-bold',
  },
];

export const notaPrecios = 'Precios en pesos argentinos. El precio final te llega por escrito antes de empezar.';

/* ------------------------------------------------- selector ¿Qué necesitás? */

export const needs = [
  {
    id: 'google',
    label: 'Que me encuentren en Google',
    hint: 'No aparecés en Maps o tu ficha está desactualizada.',
    icon: 'ph:map-pin-bold',
    svc: 'Google y redes sociales',
    message: 'Hola, quiero que mi negocio aparezca en Google y en Maps. Te cuento: ',
  },
  {
    id: 'web',
    label: 'Una web nueva',
    hint: 'No tenés web, o la que tenés ya no te representa.',
    icon: 'ph:browsers-bold',
    svc: 'Desarrollo de páginas web',
    message: 'Hola, quiero una web nueva para mi negocio. Te cuento: ',
  },
  {
    id: 'consultas',
    label: 'Que mi web traiga consultas',
    hint: 'Tenés web, pero no te escribe nadie.',
    icon: 'ph:chat-circle-dots-bold',
    svc: 'Desarrollo de páginas web',
    message: 'Hola, tengo web pero casi no recibo consultas. Te cuento: ',
  },
  {
    id: 'mantener',
    label: 'Mantener y medir lo que ya tengo',
    hint: 'Querés que alguien se ocupe todos los meses.',
    icon: 'ph:chart-line-up-bold',
    svc: 'Google y redes sociales',
    message: 'Hola, quiero mantener y medir la web y el Perfil de Empresa que ya tengo. Te cuento: ',
  },
] as const;

/* ------------------------------------------------------------------- casos */

export const cases = [
  // TODO(cliente): URL pública y métrica verificada de cada caso. Sin dato confirmado no se publica ninguno.
  { name: 'Aquabon', kind: 'Lavandería', tone: 'chispa', url: '', metric: '' },
  { name: 'Tintorería Constitución', kind: 'Tintorería', tone: 'arena', url: '', metric: '' },
  { name: 'Llama Divina', kind: 'Bienestar', tone: 'fuego', url: '', metric: '' },
  { name: 'Aquabon Gestión', kind: 'Software propio', tone: 'mar', url: '', metric: '' },
] as const;

/* ----------------------------------------------------------------- proceso */

export const steps = [
  { t: 'Escuchamos', d: 'Nos contás cómo funciona tu negocio y qué querés que pase.' },
  { t: 'Plan a medida', d: 'Te pasamos alcance, plazo y precio cerrado, por escrito.' },
  { t: 'Conectamos', d: 'Armamos tu Perfil de Empresa en Google, tu web y tu botón de WhatsApp.' },
  { t: 'Ponemos en marcha', d: 'Publicamos, medimos las consultas y te mostramos los números.' },
] as const;

/* --------------------------------------------------------------------- faq */

export const faqs = [
  {
    q: '¿Cuánto cuesta?',
    a: 'Las webs arrancan en $200.000 y la mejora de tu Perfil de Empresa en Google y tus redes, en $100.000. Las herramientas a medida van a presupuesto, porque dependen del tamaño y del tiempo de desarrollo. En todos los casos el precio final te llega por escrito antes de empezar.',
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
