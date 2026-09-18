import { gsap, ScrollTrigger, motionEnabled, isDesktop } from './gsap-setup';

export default function processPin(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('[data-process-track]');
  const progress = root.querySelector<HTMLElement>('[data-process-progress]');
  if (!track) return () => {};

  const mm = gsap.matchMedia();

  // Abstand, den die letzte Karte am Ende zum rechten Rand behaelt.
  const GUTTER = 48;

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    /**
     * Direkt an der letzten Karte gemessen statt ueber scrollWidth. Die Spur
     * traegt die Klasse `container`, deren padding-inline und max-width als
     * ungelayertes CSS die Tailwind-Utilities ueberstimmen. scrollWidth und
     * das gewuenschte Endpolster gingen dadurch auseinander, und die letzte
     * Karte blieb angeschnitten stehen.
     */
    const distance = () => {
      const last = track.lastElementChild as HTMLElement | null;
      if (!last) return 0;
      const verschoben = (gsap.getProperty(track, 'x') as number) || 0;
      const rechtsInRuhe = last.getBoundingClientRect().right - verschoben;
      return Math.max(0, rechtsInRuhe - window.innerWidth + GUTTER);
    };
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
