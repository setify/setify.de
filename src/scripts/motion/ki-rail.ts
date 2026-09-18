import { gsap, ScrollTrigger, motionEnabled } from './gsap-setup';

/**
 * Schiene im KI-Prozess: eine goldene Linie waechst beim Scrollen von links
 * nach rechts durch die drei Schritte, jeder Schritt schaltet sich ein,
 * sobald die Linie ihn erreicht.
 *
 * Der Fortschritt haengt am Scroll (scrub), nicht an einer festen Dauer.
 * Dadurch bleibt Bewegung und Leserichtung gekoppelt.
 */
export default function kiRail(root: HTMLElement): () => void {
  const fill = root.querySelector<HTMLElement>('[data-ki-rail-fill]');
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-ki-step]'));
  if (steps.length === 0) return () => {};

  if (!motionEnabled()) {
    if (fill) fill.style.transform = 'scaleX(1)';
    steps.forEach((el) => el.setAttribute('data-aktiv', ''));
    return () => {};
  }

  const tweens: gsap.core.Tween[] = [];
  const trigger: ScrollTrigger[] = [];

  if (fill) {
    tweens.push(
      gsap.fromTo(
        fill,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top 65%', end: 'bottom 80%', scrub: 0.6 },
        },
      ),
    );
  }

  steps.forEach((el, i) => {
    trigger.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          // Kleiner Versatz je Schritt, damit sie nacheinander angehen und
          // nicht alle gleichzeitig, wenn die Sektion auf einmal ins Bild faellt.
          gsap.delayedCall(i * 0.12, () => el.setAttribute('data-aktiv', ''));
        },
      }),
    );
  });

  return () => {
    tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
    trigger.forEach((t) => t.kill());
  };
}
