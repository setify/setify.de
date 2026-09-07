import { gsap, motionEnabled, canHover, isDesktop } from './gsap-setup';

export default function tilt(root: HTMLElement): () => void {
  if (!motionEnabled() || !canHover() || !isDesktop()) return () => {};
  const cards = root.querySelectorAll<HTMLElement>('[data-tilt-card]');
  const cleanups: Array<() => void> = [];

  cards.forEach((card) => {
    const glow = card.querySelector<HTMLElement>('[data-tilt-glow]');
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      gsap.to(card, { rotateY: (px - 0.5) * 6, rotateX: (0.5 - py) * 6, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
      if (glow) {
        glow.style.setProperty('--gx', `${px * 100}%`);
        glow.style.setProperty('--gy', `${py * 100}%`);
      }
    };
    const leave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      gsap.set(card, { clearProps: 'transform' });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
