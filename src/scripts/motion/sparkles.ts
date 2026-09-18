import { motionEnabled, isDesktop } from './gsap-setup';

/**
 * Goldenes Partikelfeld auf Canvas 2D.
 * Portiert von ui.aceternity.com/components/sparkles, dort auf tsparticles.
 * Hier bewusst eigenhaendig, das spart drei Abhaengigkeiten fuer ein paar
 * blinkende Punkte. Pausiert ausserhalb des Viewports und im Hintergrundtab.
 */

interface Particle { x: number; y: number; r: number; base: number; phase: number; speed: number; drift: number }

const DENSITY = 0.00009; // Partikel pro CSS-Pixel
const FALLBACK_BG = 'radial-gradient(ellipse at 50% 40%, rgba(189,172,137,0.10), transparent 65%)';

export default function sparkles(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-sparkles-canvas]');
  if (!canvas) return () => {};

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    canvas.style.background = FALLBACK_BG;
    return () => {};
  }

  if (!motionEnabled()) {
    canvas.style.background = FALLBACK_BG;
    return () => {};
  }

  const maxDpr = isDesktop() ? 2 : 1.5;
  let particles: Particle[] = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let onScreen = true;
  let pageVisible = !document.hidden;

  const build = () => {
    const count = Math.min(220, Math.round(w * h * DENSITY / (dpr * dpr)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.1 + 0.4) * dpr,
      base: Math.random() * 0.5 + 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.0016 + 0.0006,
      drift: (Math.random() - 0.5) * 0.02 * dpr,
    }));
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const nw = Math.max(1, Math.round(root.clientWidth * dpr));
    const nh = Math.max(1, Math.round(root.clientHeight * dpr));
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    canvas.width = w;
    canvas.height = h;
    build();
  };

  const render = (now: number) => {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.y += p.drift;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      const alpha = p.base + Math.sin(now * p.speed + p.phase) * 0.35;
      if (alpha <= 0) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(227,214,184,${Math.min(alpha, 0.9)})`;
      ctx.fill();
    }
  };

  const loop = (now: number) => {
    render(now);
    raf = requestAnimationFrame(loop);
  };

  const play = () => {
    if (onScreen && pageVisible && raf === 0) raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const ro = new ResizeObserver(resize);
  ro.observe(root);

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? play() : pause();
    },
    { threshold: 0 },
  );
  io.observe(root);

  const onVisibility = () => {
    pageVisible = !document.hidden;
    pageVisible ? play() : pause();
  };
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  render(performance.now());
  play();

  return () => {
    pause();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    particles = [];
  };
}
