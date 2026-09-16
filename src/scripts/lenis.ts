import Lenis from 'lenis';
import { gsap, ScrollTrigger, reducedMotion } from './motion/gsap-setup';

let lenis: Lenis | null = null;

export function scrollToHash(hash: string): void {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (lenis) {
    // Nur die Navigationsleiste messen, nicht den ganzen Header: das
    // Hinweisband darueber faehrt beim Scrollen zusammen und waere zum
    // Zeitpunkt der Landung ohnehin weg.
    const bar = document.querySelector<HTMLElement>('[data-nav] nav');
    const offset = -((bar?.offsetHeight ?? 80) + 8);
    lenis.scrollTo(target, { offset, duration: 1.2 });
  } else {
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

export function initLenis(): () => void {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (reducedMotion() || isTouch) {
    lenis = null;
    return () => {};
  }

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}
