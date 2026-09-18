import { gsap, ScrollTrigger, SplitText, motionEnabled } from './gsap-setup';

/**
 * Wortweises Aufblenden aus der Unschaerfe.
 * Portiert von ui.aceternity.com/components/text-generate-effect, hier ohne
 * React. Bewusst ohne Versatz nach oben, damit es sich von der
 * Ueberschriften-Animation in reveals.ts unterscheidet und ruhig bleibt.
 */

export default function textGenerate(root: HTMLElement): () => void {
  if (!motionEnabled()) return () => {};

  const split = SplitText.create(root, {
    type: 'words',
    autoSplit: true,
    aria: 'none',
    onSplit(self) {
      // Startzustand sofort setzen, sonst blitzt der fertige Satz kurz auf.
      gsap.set(self.words, { opacity: 0, filter: 'blur(12px)' });
      return gsap.to(self.words, {
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.1,
        stagger: 0.055,
        ease: 'power2.out',
        scrollTrigger: { trigger: root, start: 'top 88%', once: true },
      });
    },
  });

  return () => {
    ScrollTrigger.getAll()
      .filter((t) => t.trigger === root)
      .forEach((t) => t.kill());
    split.revert();
  };
}
