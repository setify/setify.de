import { motionEnabled, isDesktop } from './gsap-setup';

interface Blob { x: number; y: number; r: number; color: string; vx: number; vy: number; phase: number }

export default function heroGradient(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  const scrollBar = root.querySelector<HTMLElement>('[data-hero-scroll-bar]');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  if (!motionEnabled()) {
    canvas.style.background = 'radial-gradient(circle at 30% 40%, rgba(189,172,137,0.5), transparent 60%), radial-gradient(circle at 70% 60%, rgba(122,106,76,0.5), transparent 60%)';
    return () => {};
  }

  const SCALE = 0.15;
  const blobs: Blob[] = [
    { x: 0.3, y: 0.4, r: 0.45, color: '189,172,137', vx: 0.00012, vy: 0.00009, phase: 0 },
    { x: 0.7, y: 0.6, r: 0.5, color: '122,106,76', vx: -0.0001, vy: 0.00013, phase: 2 },
    { x: 0.55, y: 0.25, r: 0.35, color: '227,214,184', vx: 0.00008, vy: -0.0001, phase: 4 },
  ];

  let w = 0, h = 0, raf = 0, last = 0, visible = true;
  const fps = isDesktop() ? 30 : 20;
  const interval = 1000 / fps;

  const resize = () => {
    w = Math.max(1, Math.floor(root.clientWidth * SCALE));
    h = Math.max(1, Math.floor(root.clientHeight * SCALE));
    canvas.width = w;
    canvas.height = h;
  };

  const draw = (t: number) => {
    raf = requestAnimationFrame(draw);
    if (!visible || t - last < interval) return;
    last = t;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      const px = (b.x + Math.sin(t * b.vx + b.phase) * 0.18) * w;
      const py = (b.y + Math.cos(t * b.vy + b.phase) * 0.18) * h;
      const pr = b.r * Math.max(w, h);
      const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, `rgba(${b.color},0.9)`);
      g.addColorStop(1, `rgba(${b.color},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
  io.observe(root);

  resize();
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(draw);

  const scrollAnim: Animation | undefined = scrollBar?.animate([{ transform: 'translateY(-100%)' }, { transform: 'translateY(200%)' }], { duration: 1600, iterations: Infinity, easing: 'ease-in-out' });

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('resize', resize);
    scrollAnim?.cancel();
  };
}
