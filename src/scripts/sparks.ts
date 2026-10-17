// Chispas sutiles en Canvas 2D que se apartan del cursor.
type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; ph: number; c: string };

export function initSparks(canvas: HTMLCanvasElement | null) {
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  canvas.classList.remove('hidden');
  const colors = ['#FF5B24', '#FFB833', '#FF5B24'];
  const parts: P[] = [];
  const mouse = { x: -999, y: -999 };
  let w = 0, h = 0, raf = 0, visible = true;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const seed = () => {
    parts.length = 0;
    const n = Math.round(Math.min(46, (w * h) / 30000));
    for (let i = 0; i < n; i++) {
      parts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: -0.1 - Math.random() * 0.25, r: 1 + Math.random() * 2.2, a: 0.25 + Math.random() * 0.5, ph: Math.random() * 6.28, c: colors[i % colors.length] });
    }
  };
  const tick = (t: number) => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 14400) { const d = Math.sqrt(d2) || 1, f = (120 - d) / 120; p.vx += (dx / d) * f * 0.5; p.vy += (dy / d) * f * 0.5; }
      p.vx *= 0.96; p.vy = p.vy * 0.96 + (-0.18 - p.vy) * 0.02;
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(t / 700 + p.ph));
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
  };
  window.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
  new ResizeObserver(() => { resize(); seed(); }).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  resize(); seed(); raf = requestAnimationFrame(tick);
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf));
}
