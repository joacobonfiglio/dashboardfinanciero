import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const zone = document.querySelector<HTMLElement>('.mecha-zone');
const cta = document.querySelector<HTMLElement>('.cta');
const acts = [...document.querySelectorAll<HTMLElement>('.act')];

if (reduced) {
  // Mecha completa y estática: todo encendido, sin scroll fijado ni partículas.
  acts.forEach((a) => a.classList.add('is-lit'));
  document.querySelectorAll('.node').forEach((n) => n.classList.add('is-lit'));
  cta?.classList.add('is-burst');
} else {
  gsap.registerPlugin(ScrollTrigger);

  // Scroll suave solo en escritorio con mouse
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({ lerp: 0.12 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    });
  }

  // La mecha: se quema con el scroll hasta el CTA, donde estalla
  if (zone) {
    const nodes = [...zone.querySelectorAll<HTMLElement>('.node')];
    let burst = false;
    const update = () => {
      const r = zone.getBoundingClientRect();
      const burn = Math.min(Math.max(window.innerHeight * 0.62 - r.top, 0), r.height);
      zone.style.setProperty('--burn', `${burn}px`);
      nodes.forEach((n) => n.classList.toggle('is-lit', n.getBoundingClientRect().top - r.top + 9 <= burn));
      if (!burst && cta && burn >= r.height - 2) {
        burst = true;
        cta.classList.add('is-burst');
        gsap.fromTo('.burst-spark', { scale: 0.15, rotate: -30, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.9, ease: 'back.out(2.2)' });
        gsap.fromTo('.cta__reveal', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, delay: 0.25, ease: 'power3.out' });
      }
    };
    let queued = false;
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    ScrollTrigger.addEventListener('refresh', update);
    update();
  }

  // Tres actos: fijado con scroll horizontal en escritorio, vertical en celular
  const mm = gsap.matchMedia();
  const section = document.querySelector<HTMLElement>('.acts');
  const track = document.querySelector<HTMLElement>('.acts__track');
  const viewport = document.querySelector<HTMLElement>('.acts__viewport');
  const pin = document.querySelector<HTMLElement>('.acts__pin');
  if (section && track && viewport && pin) {
    mm.add('(min-width: 1024px)', () => {
      const dist = () => Math.max(track.scrollWidth - viewport.clientWidth, 0);
      const litAt = [0, 0.3, 0.7];
      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${dist() + window.innerHeight * 0.9}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            track.style.setProperty('--p', String(self.progress));
            acts.forEach((a, i) => a.classList.toggle('is-lit', self.progress >= litAt[i]));
          },
        },
      });
    });
    mm.add('(max-width: 1023.98px)', () => {
      const triggers = acts.map((a) =>
        ScrollTrigger.create({ trigger: a, start: 'top 68%', onEnter: () => a.classList.add('is-lit'), onLeaveBack: () => a.classList.remove('is-lit') }),
      );
      return () => triggers.forEach((t) => t.kill());
    });
  }

  // Entradas suaves
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }),
    });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// Hero (solo existe en la home)
if (document.getElementById('phone-search')) import('./hero').then((m) => m.initHero(reduced));
