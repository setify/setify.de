import { gsap, SplitText, motionEnabled } from './gsap-setup';

export default function manifestScrub(root: HTMLElement): () => void {
  const text = root.querySelector<HTMLElement>('[data-manifest-text]');
  if (!text) return () => {};

  if (!motionEnabled()) {
    text.style.color = '#f3eee4';
    text.querySelectorAll('em').forEach((em) => { (em as HTMLElement).style.color = '#bdac89'; });
    return () => {};
  }

  const split = SplitText.create(text, {
    type: 'words',
    autoSplit: true,
    onSplit(self) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: text, start: 'top 75%', end: 'bottom 45%', scrub: 0.6 },
      });
      self.words.forEach((word, i) => {
        const gold = !!(word as HTMLElement).closest('em');
        tl.to(word, { color: gold ? '#bdac89' : '#f3eee4', duration: 1, ease: 'none' }, i * 0.25);
      });
      return tl;
    },
  });

  return () => split.revert();
}
