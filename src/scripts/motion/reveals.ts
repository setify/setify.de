import { gsap, ScrollTrigger, SplitText, motionEnabled } from './gsap-setup';

export default function reveals(root: HTMLElement): () => void {
  const splits: SplitText[] = [];
  const triggers: ScrollTrigger[] = [];

  const revealEls = root.querySelectorAll<HTMLElement>('[data-reveal]');
  const splitEls = root.querySelectorAll<HTMLElement>('[data-split]');

  if (!motionEnabled()) {
    gsap.set([...revealEls, ...splitEls], { clearProps: 'all', opacity: 1, visibility: 'visible' });
    return () => {};
  }

  revealEls.forEach((el) => {
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  splitEls.forEach((el) => {
    gsap.set(el, { visibility: 'visible' });
    const split = SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        // background-clip: text greift nicht durch die Wort-Kindelemente hindurch.
        // Verlauf deshalb pro Wort setzen und vom zerlegten Eltern-Span entfernen.
        for (const word of self.words) {
          const parent = (word as HTMLElement).closest<HTMLElement>('.gold-gradient-text, [data-gold-gradient]');
          if (parent && parent !== el) {
            word.classList.add('gold-gradient-text');
            parent.classList.remove('gold-gradient-text');
            parent.dataset.goldGradient = '';
          }
        }
        return gsap.from(self.words, {
          yPercent: 110,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 1.1,
          stagger: 0.035,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
    splits.push(split);
  });

  return () => {
    splits.forEach((s) => s.revert());
    triggers.forEach((t) => t.kill());
  };
}
