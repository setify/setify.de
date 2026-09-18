import { gsap, motionEnabled } from './gsap-setup';

export default function parallax(root: HTMLElement): () => void {
  if (!motionEnabled()) return () => {};
  const els = root.querySelectorAll<HTMLElement>('[data-parallax]');
  const tweens = Array.from(els).map((el) => {
    gsap.set(el, { scale: 1.15 });
    return gsap.fromTo(el, { yPercent: -8 }, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('figure') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); gsap.set(t.targets() as Element[], { clearProps: 'transform' }); });
}
