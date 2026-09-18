import { gsap, ScrollTrigger, SplitText, motionEnabled } from './gsap-setup';

/**
 * `nimm` entscheidet, welche Elemente dieser Durchgang uebernimmt. Die Seite
 * ruft zuerst nur fuer den sichtbaren Bereich auf und holt den Rest nach, wenn
 * der Hauptthread frei ist. Bereits versorgte Elemente sind markiert und
 * werden im zweiten Durchgang uebersprungen.
 */
export default function reveals(root: HTMLElement, nimm: (el: HTMLElement) => boolean = () => true): () => void {
  const splits: SplitText[] = [];
  const triggers: ScrollTrigger[] = [];

  const offen = (sel: string) =>
    Array.from(root.querySelectorAll<HTMLElement>(sel))
      .filter((el) => !el.hasAttribute('data-motion-bereit') && nimm(el))
      .map((el) => { el.setAttribute('data-motion-bereit', ''); return el; });

  const revealEls = offen('[data-reveal]');
  const splitEls = offen('[data-split]');

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
          // Muss die vergroesserte Clip-Box der Zeile (.split-line-mask) ueberschreiten,
          // sonst blitzt die Wortoberkante vor dem Start durch. Bei 0.3em
          // Padding und Zeilenhoehe 0.95 liegt die Grenze bei rund 132 Prozent.
          yPercent: 145,
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
    [...revealEls, ...splitEls].forEach((el) => el.removeAttribute('data-motion-bereit'));
  };
}
