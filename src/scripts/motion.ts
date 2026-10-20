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

/* ------------------------------------------------- tres actos: barra de avance */
const acts = document.querySelector<HTMLElement>('.snap-row--acts');
const bar = document.querySelector<HTMLElement>('.acts__progress');
if (acts) {
  const cards = [...acts.querySelectorAll<HTMLElement>('.act')];
  const sync = () => {
    const max = acts.scrollWidth - acts.clientWidth;
    const p = max > 8 ? acts.scrollLeft / max : 1;
    bar?.style.setProperty('--p', String(Math.max(p, 1 / Math.max(cards.length, 1))));
  };
  acts.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  sync();

  if (reduced) {
    cards.forEach((c) => c.classList.add('is-lit'));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-lit', e.isIntersecting && e.intersectionRatio > 0.55)),
      { threshold: [0, 0.55, 1] },
    );
    cards.forEach((c) => io.observe(c));
  }
}

/* ------------------------------------------------- botón flotante de WhatsApp */
const float = document.querySelector<HTMLElement>('.wa-float');
const firstSection = document.querySelector<HTMLElement>('main > *, .mecha-zone > *');
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
