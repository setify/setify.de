import { gsap, motionEnabled, isDesktop } from './gsap-setup';

/**
 * Punktraster, in dem zufaellige Punkte aufleuchten.
 * Portiert von ui.aceternity.com/components/glowing-stars-effect, hier ohne
 * React und ohne rAF: ein Intervall reicht, der Schein kommt aus box-shadow.
 */

const INTERVAL_MS = 1400;
const DIM = 0.2;

export default function glowingStars(root: HTMLElement): () => void {
  const stars = [...root.querySelectorAll<HTMLElement>('[data-star]')];
  if (!stars.length) return () => {};

  const litCount = Math.max(3, Math.round(stars.length * (isDesktop() ? 0.08 : 0.05)));

  const light = (el: HTMLElement, animate: boolean) => {
    const props = { opacity: 0.9, boxShadow: '0 0 8px 1px rgba(189,172,137,0.7)' };
    if (animate) gsap.to(el, { ...props, duration: 0.8, ease: 'power2.out' });
    else gsap.set(el, props);
  };
  const dim = (el: HTMLElement) =>
    gsap.to(el, { opacity: DIM, boxShadow: '0 0 0 0 rgba(189,172,137,0)', duration: 1.1, ease: 'power2.inOut' });

  // Ruhezustand explizit setzen, sonst bleiben alle Punkte auf voller Deckkraft.
  gsap.set(stars, { opacity: DIM, boxShadow: '0 0 0 0 rgba(189,172,137,0)' });

  // Ohne Animation leuchtet eine feste Auswahl, damit das Raster nicht tot wirkt.
  if (!motionEnabled()) {
    stars.filter((_, i) => i % 11 === 0).forEach((s) => light(s, false));
    return () => gsap.killTweensOf(stars);
  }

  let current: HTMLElement[] = [];
  let timer = 0;
  let onScreen = false;

  const cycle = (animate = true) => {
    current.forEach(dim);
    current = gsap.utils.shuffle([...stars]).slice(0, litCount);
    current.forEach((s) => light(s, animate));
  };

  // Erstzustand ohne Tween setzen: so steht das Bild sofort, auch bevor der
  // IntersectionObserver feuert oder die erste Animationsframe laeuft.
  cycle(false);

  const start = () => {
    if (timer || !onScreen || document.hidden) return;
    timer = window.setInterval(cycle, INTERVAL_MS);
  };
  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = 0;
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? start() : stop();
    },
    { threshold: 0 },
  );
  io.observe(root);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    stop();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    gsap.killTweensOf(stars);
  };
}
