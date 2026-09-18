import { gsap, motionEnabled, canHover, isDesktop } from './gsap-setup';

export default function magnetic(root: HTMLElement): () => void {
  if (!motionEnabled() || !canHover() || !isDesktop()) return () => {};
  const els = root.querySelectorAll<HTMLElement>('[data-magnetic]');
  const cleanups: Array<() => void> = [];

  els.forEach((el) => {
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      gsap.to(el, { x: dx * 8, y: dy * 8, duration: 0.4, ease: 'power2.out' });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set(el, { clearProps: 'x,y' });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
