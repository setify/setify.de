import Lenis from 'lenis';
import { gsap, ScrollTrigger, reducedMotion } from './motion/gsap-setup';

let lenis: Lenis | null = null;

/** Loest eine CSS-Kubik-Bezier nach dem Fortschritt auf. */
function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number) {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1;
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1;
  const c = (a1: number) => 3 * a1;
  const kurve = (t: number, a1: number, a2: number) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
  const steigung = (t: number, a1: number, a2: number) => 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1);

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Newton-Verfahren: den Parameter t suchen, dessen x dem Fortschritt entspricht.
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const fehler = kurve(t, p1x, p2x) - x;
      if (Math.abs(fehler) < 1e-5) break;
      const d = steigung(t, p1x, p2x);
      if (Math.abs(d) < 1e-6) break;
      t -= fehler / d;
    }
    return kurve(t, p1y, p2y);
  };
}

/**
 * Sanfter Anlauf, langes Abbremsen zum Ziel.
 *
 * Bewusst nicht `--ease-out-expo` aus dem CSS, obwohl das die Hauskurve ist:
 * sie legt die halbe Strecke in den ersten elf Prozent der Zeit zurueck. Fuer
 * kurze Text- und Deckkraftwechsel ist das genau richtig, ueber mehrere
 * tausend Scrollpixel wirkt es aber wie ein Sprung mit Nachlauf und damit
 * kaum anders als die Lerp-Glaettung, die hier ersetzt wird.
 *
 * Diese Kurve erreicht die halbe Strecke erst nach 28 Prozent der Zeit und
 * bremst die zweite Haelfte ueber spuerbar.
 */
const easeOutScroll = cubicBezier(0.25, 0.46, 0.45, 0.94);

export function scrollToHash(hash: string): void {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;

  if (lenis) {
    const instanz = lenis;

    // Einmalige Nachkorrektur: der gepinnte Prozessbereich veraendert waehrend
    // der Fahrt die Dokumenthoehe, dadurch wandert das Ziel unter uns weg. Ein
    // zweiter kurzer Anlauf holt den Rest, die Sperre verhindert ein Pendeln.
    let korrigiert = false;

    const fahren = () => {
      // Nur die Navigationsleiste messen, nicht den ganzen Header: das
      // Hinweisband darueber faehrt beim Scrollen zusammen und waere zum
      // Zeitpunkt der Landung ohnehin weg.
      const bar = document.querySelector<HTMLElement>('[data-nav] nav');
      const offset = -((bar?.offsetHeight ?? 80) + 8);

      // Laufzeit an der Strecke orientieren: kurze Spruenge sollen nicht
      // traege wirken, lange nicht gehetzt.
      const strecke = Math.abs(target.getBoundingClientRect().top + offset);
      const duration = Math.min(1.6, Math.max(0.8, strecke / 2200));

      // `easing` muss mit, sonst greift die Lerp-Glaettung der Instanz und
      // `duration` bleibt wirkungslos. Lerp naehert sich dem Ziel asymptotisch
      // an und wirkt am Ende zaeh statt gebremst.
      instanz.scrollTo(target, {
        offset,
        duration,
        easing: easeOutScroll,
        onComplete: () => {
          if (korrigiert) return;
          const rest = target.getBoundingClientRect().top + offset;
          if (Math.abs(rest) < 8) return;
          korrigiert = true;
          instanz.scrollTo(target, { offset, duration: 0.35, easing: easeOutScroll });
        },
      });
    };

    // Lenis fuehrt eine eigene Scrollposition. Weicht sie von der echten ab,
    // etwa nach einem Reload mit wiederhergestellter Position oder nach einer
    // View Transition, rechnet scrollTo mit falschem Startwert und landet weit
    // neben dem Ziel oder bewegt sich gar nicht.
    //
    // Der Abgleich braucht einen eigenen Frame: im selben Frame wuerde die
    // nachfolgende Fahrt das `immediate` des Abgleichs erben und springen.
    if (Math.abs(instanz.scroll - window.scrollY) > 1) {
      instanz.scrollTo(window.scrollY, { immediate: true, force: true });
      requestAnimationFrame(fahren);
    } else {
      fahren();
    }
  } else {
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

export function initLenis(): () => void {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (reducedMotion() || isTouch) {
    lenis = null;
    return () => {};
  }

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}
