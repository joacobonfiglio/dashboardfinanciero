/**
 * Único script de movimiento del sitio: sin librerías.
 * IntersectionObserver para las entradas, un rAF para la mecha y listeners sueltos.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------- entradas suaves */
const revealables = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduced) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else if (revealables.length) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }),
    { rootMargin: '0px 0px -12% 0px' },
  );
  revealables.forEach((el) => io.observe(el));
}

/* ------------------------------------------------- la mecha que se quema */
const zone = document.querySelector<HTMLElement>('.mecha-zone');
const nodes = zone ? [...zone.querySelectorAll<HTMLElement>('.node')] : [];
if (zone && !reduced) {
  let queued = false;
  const update = () => {
    const r = zone.getBoundingClientRect();
    const burn = Math.min(Math.max(window.innerHeight * 0.62 - r.top, 0), r.height);
    zone.style.setProperty('--burn', `${burn}px`);
    for (const n of nodes) n.classList.toggle('is-lit', n.getBoundingClientRect().top - r.top + 9 <= burn);
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
} else {
  nodes.forEach((n) => n.classList.add('is-lit'));
}

/* ------------------------------------------------- carruseles que avanzan con el scroll */
const rows = [...document.querySelectorAll<HTMLElement>('[data-scrollx]')];
const unaColumna = window.matchMedia('(max-width: 1023.98px)');

for (const row of rows) {
  const cards = [...row.children] as HTMLElement[];
  let manual = false;

  // Si la persona lo desliza con el dedo, mandan sus manos: dejamos de moverlo.
  const soltar = () => {
    manual = true;
    row.classList.remove('is-driven');
  };
  row.addEventListener('pointerdown', soltar);
  row.addEventListener('wheel', soltar, { passive: true });
  row.addEventListener('keydown', soltar);

  // El avance se mide sobre el propio carrusel: recién empieza cuando ya se ve.
  const INICIO = 0.72; // su borde de arriba llegó al 72% del alto de la pantalla
  const FIN = 0.12;    // y termina cuando casi lo tenés arriba de todo
  const avanzar = () => {
    if (manual || reduced || !unaColumna.matches) return;
    const max = row.scrollWidth - row.clientWidth;
    if (max <= 8) return;
    row.classList.add('is-driven');
    const vh = window.innerHeight;
    const top = row.getBoundingClientRect().top;
    const p = Math.min(Math.max((vh * INICIO - top) / Math.max(vh * (INICIO - FIN), 1), 0), 1);
    row.scrollLeft = max * p;
  };

  let pedido = false;
  const alScroll = () => {
    if (pedido) return;
    pedido = true;
    requestAnimationFrame(() => { pedido = false; avanzar(); });
  };
  addEventListener('scroll', alScroll, { passive: true });
  addEventListener('resize', alScroll);
  avanzar();

  if (reduced) cards.forEach((c) => c.classList.add('is-lit'));
  else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-lit', e.isIntersecting && e.intersectionRatio > 0.55)),
      { threshold: [0, 0.55, 1] },
    );
    cards.forEach((c) => io.observe(c));
  }
}

/* ------------------------------------------------- cerrar el panel del selector con el teclado */
const cerrar = document.querySelector<HTMLElement>('[data-close-need]');
cerrar?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  const none = document.getElementById('need-none') as HTMLInputElement | null;
  if (none) { none.checked = true; document.getElementById('que-necesitas')?.scrollIntoView({ block: 'nearest' }); }
});

/* ------------------------------------------------- botón flotante de WhatsApp */
const float = document.querySelector<HTMLElement>('.wa-float');
const firstSection = document.querySelector<HTMLElement>('#hero') ?? document.querySelector<HTMLElement>('main > *, .mecha-zone > *');
if (float) {
  if (reduced) {
    float.classList.add('is-in');
  } else if (firstSection) {
    new IntersectionObserver(
      ([e]) => float.classList.toggle('is-in', !e.isIntersecting),
      { threshold: 0 },
    ).observe(firstSection);
  } else {
    float.classList.add('is-in');
  }
}

/* ------------------------------------------------- medición y links sin número */
const servicioDesdeUrl = () => {
  const p = location.pathname;
  if (p.startsWith('/servicios')) return 'servicios';
  if (p.startsWith('/sobre-nosotros')) return 'sobre-nosotros';
  if (p.startsWith('/legales')) return 'legales';
  return 'home';
};

document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  const wa = target?.closest<HTMLAnchorElement>('a[data-wa]');
  if (wa) {
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    gtag?.('event', 'click_whatsapp', { ubicacion: wa.dataset.wa, servicio: servicioDesdeUrl() });
    // Mientras no haya número cargado, el botón se ve pero no navega.
    if (wa.getAttribute('href') === '#') e.preventDefault();
    return;
  }
  const ga = target?.closest<HTMLAnchorElement>('a[data-ga]');
  if (ga) {
    const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    gtag?.('event', ga.dataset.ga as string, { ubicacion: 'footer', servicio: servicioDesdeUrl() });
  }
});
