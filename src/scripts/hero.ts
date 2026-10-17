import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

const QUERY = 'tintorería cerca de mí';

export function initHero(reduced: boolean) {
  if (reduced) return; // contenido final y estático
  gsap.registerPlugin(SplitText);

  // Titular letra por letra + estallido de la chispa
  const title = document.querySelector<HTMLElement>('.js-split');
  const spark = document.querySelector<SVGElement>('.js-burst');
  if (title) {
    const split = SplitText.create(title, { type: 'words,chars', wordsClass: 'split-word', charsClass: 'split-char', aria: 'none' });
    gsap.from(split.chars, { yPercent: 70, opacity: 0, rotate: 4, duration: 0.7, ease: 'power3.out', stagger: 0.035 });
  }
  if (spark) {
    gsap.fromTo(spark, { scale: 0, rotate: -60, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, rotate: 0, opacity: 1, duration: 0.8, delay: 0.75, ease: 'back.out(3)' });
  }

  // Búsqueda simulada
  const q = document.querySelector<HTMLElement>('.js-query');
  const results = [...document.querySelectorAll<HTMLElement>('.js-result')];
  if (q && results.length) {
    const lit = results[0];
    lit.classList.remove('is-lit');
    q.textContent = '';
    gsap.set(results, { opacity: 0, y: 14 });
    const tl = gsap.timeline({ delay: 1.1 });
    const state = { n: 0 };
    tl.to(state, { n: QUERY.length, duration: QUERY.length * 0.07, ease: 'none', onUpdate: () => { q.textContent = QUERY.slice(0, Math.round(state.n)); } })
      .to(results, { opacity: 1, y: 0, duration: 0.45, stagger: 0.16, ease: 'power2.out' }, '+=0.25')
      .add(() => lit.classList.add('is-lit'), '+=0.5')
      .fromTo(lit, { scale: 1 }, { scale: 1.03, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }, '<');
  }

  // Chispas de fondo: solo escritorio con mouse
  if (window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)').matches) {
    import('./sparks').then((m) => m.initSparks(document.getElementById('sparks') as HTMLCanvasElement));
  }
}
