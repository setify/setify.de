import { gsap, motionEnabled } from './gsap-setup';

export default function counters(root: HTMLElement): () => void {
  const els = root.querySelectorAll<HTMLElement>('[data-counter]');
  if (!motionEnabled() || els.length === 0) return () => {};

  const tweens = Array.from(els).map((el) => {
    const value = Number(el.dataset.value ?? '0');
    const suffix = el.dataset.suffix ?? '';
    const state = { n: 0 };
    el.textContent = `0${suffix}`;
    return gsap.to(state, {
      n: value,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate() { el.textContent = `${Math.round(state.n)}${suffix}`; },
    });
  });

  return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
}
