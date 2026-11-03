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
  gaId: import.meta.env?.PUBLIC_GA_ID ?? '',
} as const;

export const SITE_URL = site.url;

/** Link de WhatsApp con mensaje precargado. Sin número devuelve "#" (botón visible, sin conectar). */
export function waHref(message: string): string {
  if (!site.whatsapp) return '#';
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

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
  /** Página propia del servicio, cuando existe. */
  page?: string;
  /** Todo lo que necesita la página del servicio. */
  detalle?: {
    title: string;
    description: string;
    kicker: string;
    h1: string;
    intro: string;
    plazo: string;
    alcance: string;
    precioNota: string;
    incluye: readonly { t: string; d: string; icon: string }[];
    casos: readonly { t: string; d: string }[];
    faqs: readonly { q: string; a: string }[];
  };
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
    page: '/servicios/desarrollo-web/',
    detalle: {
      title: 'Desarrollo de páginas web desde $200.000 | Traka',
      description: 'Diseñamos y programamos tu web desde cero, pensada para el celular y con botón de WhatsApp. Desde $200.000 y lista en 3 a 4 semanas.',
      kicker: 'Desarrollo web',
      h1: 'Desarrollo de páginas web que traen consultas.',
      intro: 'Diseñamos y programamos tu web desde cero, pensada primero para el celular: quién sos, qué hacés, dónde estás y un botón para escribirte.',
      plazo: '3 a 4 semanas',
      alcance: 'Hasta 5 secciones',
      precioNota: 'El precio final depende del alcance: cuántas secciones necesitás y cuánto material (textos, fotos, logo) tengas listo. Lo cerramos antes de empezar y no se mueve.',
      incluye: [
        { t: 'Diseño propio, sin plantillas', d: 'El diseño sale de tu marca y de lo que vende tu negocio, no de un tema comprado.', icon: 'ph:paint-brush-broad-bold' },
        { t: 'Pensada para el celular', d: 'Se arma primero en pantalla chica, que es por donde te va a entrar casi todo el mundo.', icon: 'ph:device-mobile-bold' },
        { t: 'Textos incluidos', d: 'Escribimos las secciones con vos. No te dejamos un documento vacío para completar.', icon: 'ph:text-aa-bold' },
        { t: 'WhatsApp en cada sección', d: 'Cada botón abre el chat con el mensaje ya escrito según la página donde está.', icon: 'ph:whatsapp-logo-bold' },
        { t: 'SEO local', d: 'Títulos, descripciones, datos estructurados y tu Perfil de Empresa en Google conectado.', icon: 'ph:magnifying-glass-bold' },
        { t: 'Medición desde el día uno', d: 'Analytics y Search Console configurados, para ver qué páginas traen consultas.', icon: 'ph:chart-line-up-bold' },
      ],
      casos: [
        { t: 'No tenés web', d: 'Hoy te encuentran por Instagram o de boca en boca, y se te caen consultas en el camino.' },
        { t: 'Tenés una, pero vieja', d: 'En el celular se ve mal, tarda en cargar o muestra datos que ya no son.' },
        { t: 'Tenés web y nadie escribe', d: 'Entra gente pero no pasa nada: no se entiende qué hacés o no hay por dónde contactarte.' },
        { t: 'Vendés por WhatsApp', d: 'Querés un lugar propio que te presente bien antes de que te escriban.' },
      ],
      faqs: [
        { q: '¿Cuánto tarda una web?', a: 'Entre 3 y 4 semanas desde que tenemos el material y el alcance acordado. El plazo queda por escrito antes de empezar.' },
        { q: '¿Qué necesitás de mí?', a: 'Tu logo si lo tenés, fotos de tu negocio y un rato para contarnos cómo trabajás. Si no tenés fotos, lo charlamos antes de arrancar.' },
        { q: '¿Qué incluye el precio?', a: 'Diseño, desarrollo, textos, el botón de WhatsApp, el SEO local y la medición. Desde $200.000; el precio final depende del alcance y te llega por escrito.' },
        { q: '¿Hacen tiendas online?', a: 'No. Hacemos webs simples que traen consultas: quién sos, qué hacés, dónde estás y cómo escribirte.' },
        { q: '¿La web es mía?', a: 'Sí. El material que creamos para vos queda a tu nombre una vez cancelado el trabajo.' },
        { q: '¿Y después de publicarla?', a: 'La dejamos publicada y midiendo, y te mostramos los números. Si querés que la sigamos manteniendo, lo charlamos aparte.' },
      ],
    },
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
    page: '/servicios/google-y-redes/',
    detalle: {
      title: 'Perfil de Empresa en Google desde $100.000 | Traka',
      description: 'Optimizamos tu Perfil de Empresa en Google (Google My Business) y tus redes para que aparezcas en Maps y te escriban. Desde $100.000, en unos 10 días.',
      kicker: 'Google y redes',
      h1: 'Perfil de Empresa en Google: que te encuentren en Maps.',
      intro: 'Ponemos tu ficha de Google como corresponde y dejamos tus redes diciendo qué hacés y cómo contactarte. Es lo más rápido que podés hacer para que te lleguen consultas.',
      plazo: 'Unos 10 días',
      alcance: 'Perfil + redes',
      precioNota: 'El precio depende de cuántas sucursales y redes haya que poner a punto, y de si la ficha existe o hay que crearla y verificarla desde cero.',
      incluye: [
        { t: 'Ficha completa y verificada', d: 'Categorías, servicios, zona de cobertura, horarios y datos de contacto, cargados como Google los pide.', icon: 'ph:seal-check-bold' },
        { t: 'Fotos y publicaciones', d: 'Dejamos la ficha con fotos ordenadas y publicaciones cargadas, no vacía.', icon: 'ph:image-square-bold' },
        { t: 'Plan de reseñas', d: 'Un sistema simple para pedirlas después de cada trabajo y un criterio para responderlas todas.', icon: 'ph:star-bold' },
        { t: 'Preguntas y respuestas', d: 'Cargamos las dudas que ya te hacen, para que la ficha las conteste sola.', icon: 'ph:question-bold' },
        { t: 'Puesta a punto de tus redes', d: 'Bio, enlaces, destacados y datos de contacto, alineados con lo que dice la web.', icon: 'ph:instagram-logo-bold' },
        { t: 'Informe de lo que entra', d: 'Qué buscó la gente, cuántos pidieron cómo llegar y cuántos te escribieron.', icon: 'ph:chart-bar-bold' },
      ],
      casos: [
        { t: 'No aparecés en Maps', d: 'Buscan tu rubro cerca y aparecen todos menos vos.' },
        { t: 'Tu ficha tiene datos viejos', d: 'Horarios que ya no son, un teléfono que no atendés o fotos de hace años.' },
        { t: 'Tenés reseñas sin responder', d: 'Las buenas sin agradecer y las malas sin contestar, que es lo que más mira la gente.' },
        { t: 'Tus redes no dicen qué hacés', d: 'Entran al perfil y no entienden a qué te dedicás ni cómo escribirte.' },
      ],
      faqs: [
        { q: '¿Qué es el Perfil de Empresa en Google?', a: 'Es la ficha que aparece en Google y en Maps cuando alguien busca tu negocio o tu rubro: dirección, horarios, fotos, reseñas y botón para llamarte. Antes se llamaba Google Mi Negocio.' },
        { q: '¿Me garantizan aparecer primero?', a: 'No, y desconfiá de quien te lo prometa. Lo que hacemos es que tu ficha esté completa y activa, que es lo que Google mira, y te mostramos qué cambió con datos.' },
        { q: '¿Cuánto tarda?', a: 'Unos 10 días. Si la ficha no existe todavía, hay que esperar a que Google la verifique, y ese plazo lo maneja Google.' },
        { q: '¿Necesito un local a la calle?', a: 'No necesariamente. Google también admite negocios que atienden a domicilio o en una zona: en ese caso se configura como área de cobertura en vez de dirección.' },
        { q: '¿Me manejan las redes todos los meses?', a: 'Esto es la puesta a punto, no la gestión mensual. Si querés que publiquemos todos los meses, lo charlamos aparte.' },
        { q: '¿Sirve si ya tengo la ficha creada?', a: 'Sí. En general el problema no es que no exista, sino que está a medio cargar. Revisamos todo y completamos lo que falta.' },
      ],
    },
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
    page: '/servicios/herramientas-a-medida/',
    detalle: {
      title: 'Herramientas y plataformas a medida | Traka',
      description: 'Sistemas internos, paneles y plataformas propias para lo que tu negocio necesita. Relevamiento, presupuesto cerrado y soporte después de entregar.',
      kicker: 'A medida',
      h1: 'Herramientas y plataformas a medida para tu negocio.',
      intro: 'Cuando ningún sistema de los que se compran hace lo que necesitás, lo construimos. Primero entendemos cómo trabajás, después te pasamos un presupuesto cerrado.',
      plazo: 'Según el alcance',
      alcance: 'A medida',
      precioNota: 'No hay un precio de lista porque no hay dos negocios iguales. Hacemos un relevamiento, te pasamos el alcance y el precio por escrito, y recién ahí decidís.',
      incluye: [
        { t: 'Relevamiento de cómo trabajás', d: 'Vemos tu circuito real: qué cargás, dónde se traba y qué estás haciendo dos veces.', icon: 'ph:clipboard-text-bold' },
        { t: 'Alcance y precio por escrito', d: 'Antes de escribir una línea de código sabés qué se hace, en cuánto tiempo y cuánto cuesta.', icon: 'ph:file-text-bold' },
        { t: 'Desarrollo a medida', d: 'Solo lo que necesitás, sin módulos que nunca vas a abrir.', icon: 'ph:code-bold' },
        { t: 'Puesta en marcha con tu equipo', d: 'Lo dejamos funcionando y mostramos cómo se usa a quien lo va a usar todos los días.', icon: 'ph:users-three-bold' },
        { t: 'Soporte después de entregar', d: 'No desaparecemos el día de la entrega: quedamos para los ajustes que aparezcan.', icon: 'ph:lifebuoy-bold' },
        { t: 'Acceso desde el celular', d: 'Pensado para usarse donde está el trabajo, no solo sentado frente a una computadora.', icon: 'ph:device-mobile-bold' },
      ],
      casos: [
        { t: 'Llevás el negocio en planillas', d: 'Funciona hasta que son varias, cada uno tiene la suya y ya nadie sabe cuál es la buena.' },
        { t: 'Cargás los mismos datos dos veces', d: 'Una en el cuaderno, otra en el sistema, y a veces una tercera en el chat.' },
        { t: 'No ves cómo va el negocio', d: 'Para saber cómo cerró el mes hay que sentarse a sumar a mano.' },
        { t: 'Compraste un sistema que no encaja', d: 'Pagás todos los meses por algo que hace la mitad de lo que necesitás.' },
      ],
      faqs: [
        { q: '¿Por qué no hay precio de lista?', a: 'Porque depende del tamaño y del tiempo que lleve hacerlo. Hacemos el relevamiento, te pasamos el presupuesto cerrado por escrito y decidís con el número delante.' },
        { q: '¿Cómo arranca?', a: 'Con una charla para entender cómo trabajás hoy. De ahí sale el alcance, el plazo y el precio. Recién cuando lo aceptás empieza el desarrollo.' },
        { q: '¿El sistema es mío?', a: 'Sí. Lo que desarrollamos para vos queda a tu nombre una vez cancelado el trabajo.' },
        { q: '¿Y si después necesito cambios?', a: 'Es lo normal: cuando lo empezás a usar aparecen ideas. Los ajustes se presupuestan aparte, con el mismo criterio.' },
        { q: '¿Trabajan sobre lo que ya tengo?', a: 'Puede ser. Si ya tenés un sistema o planillas armadas, lo miramos en el relevamiento y te decimos si conviene aprovecharlo o empezar de nuevo.' },
      ],
    },
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
  // TODO(cliente): URL pública y métrica verificada de cada caso. Sin dato confirmado no se publica.
  { name: 'Aquabon', kind: 'Página web', servicio: 'web', tone: 'chispa', url: '', metric: '' },
  { name: 'Tintorería Constitución', kind: 'Página web', servicio: 'web', tone: 'arena', url: '', metric: '' },
  { name: 'Lavi', kind: 'Plataforma a medida', servicio: 'medida', tone: 'mar', url: '', metric: '' },
] as const;

/* ------------------------------------------------------- los tres pasos */

/** Cada paso del recorrido de un cliente, con el servicio que lo resuelve. */
export const pasos = [
  {
    n: '01',
    t: 'Te encuentran',
    servicio: 'google',
    d: 'Alguien busca lo que hacés. Aparecés en Google, en Maps y en tu Perfil de Empresa, con horarios, fotos y reseñas al día.',
    tags: ['Google', 'Maps', 'Perfil de Empresa'],
    icon: 'ph:magnifying-glass-bold',
  },
  {
    n: '02',
    t: 'Te eligen y te escriben',
    servicio: 'web',
    d: 'Entran a tu web desde el celular, entienden en segundos qué hacés y te escriben por WhatsApp de un toque.',
    tags: ['Web clara', 'Para celular', 'WhatsApp'],
    icon: 'ph:device-mobile-bold',
  },
  {
    n: '03',
    t: 'Te ordenás por dentro',
    servicio: 'medida',
    d: 'Cuando entran más consultas de las que podés seguir en un cuaderno, armamos la herramienta que lo ordena.',
    tags: ['Panel propio', 'Sin planillas', 'A medida'],
    icon: 'ph:squares-four-bold',
  },
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
    a: 'Una web, entre 3 y 4 semanas. El Perfil de Empresa en Google, unos 10 días. Las herramientas a medida dependen del alcance. Los plazos quedan por escrito antes de empezar.',
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
