import { gsap, ScrollTrigger, motionEnabled, isDesktop } from './gsap-setup';

export default function processPin(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('[data-process-track]');
  const progress = root.querySelector<HTMLElement>('[data-process-progress]');
  if (!track) return () => {};

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate(self) {
          if (progress) progress.style.transform = `scaleX(${self.progress})`;
        },
      },
    });
    return () => tween.scrollTrigger?.kill();
  });

  mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
    if (!progress) return;
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top 60%',
      end: 'bottom 80%',
      onUpdate(self) { progress.style.transform = `scaleX(${self.progress})`; },
    });
    return () => st.kill();
  });

  return () => mm.revert();
}
