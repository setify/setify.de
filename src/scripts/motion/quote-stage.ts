import { gsap, ScrollTrigger, motionEnabled } from './gsap-setup';

/**
 * Zitat-Buehne: blendet eine Stimme nach der anderen ein und laesst den
 * Fortschritt im Index mitlaufen.
 *
 * Der Wechsel haelt an, sobald jemand mit der Maus darauf ist, per Tastatur
 * hineinnavigiert oder den Tab wechselt. Automatisch wechselnde Inhalte muessen
 * anhaltbar sein, sonst reisst man Lesenden den Text weg.
 */

const DAUER_MS = 6000;

export default function quoteStage(root: HTMLElement): () => void {
  const folien = [...root.querySelectorAll<HTMLElement>('[data-quote-slide]')];
  const reiter = [...root.querySelectorAll<HTMLButtonElement>('[data-quote-tab]')];
  if (folien.length < 2 || folien.length !== reiter.length) return () => {};

  let aktiv = 0;
  let imBild = false;
  let angehalten = false;
  let fortschritt: gsap.core.Tween | null = null;

  const bewegung = motionEnabled();

  const zeige = (index: number, animiert: boolean) => {
    const vorher = aktiv;
    aktiv = (index + folien.length) % folien.length;

    folien.forEach((folie, i) => {
      const ist = i === aktiv;
      if (ist) folie.setAttribute('data-aktiv', '');
      else folie.removeAttribute('data-aktiv');
    });

    reiter.forEach((r, i) => {
      const ist = i === aktiv;
      r.setAttribute('aria-selected', String(ist));
      r.tabIndex = ist ? 0 : -1;
      const balken = r.querySelector<HTMLElement>('[data-quote-fortschritt]');
      if (balken && !ist) gsap.set(balken, { scaleX: 0 });
    });

    if (!animiert || !bewegung) return;

    const neu = folien[aktiv];
    const alt = folien[vorher];
    if (alt && alt !== neu) gsap.set(alt, { clearProps: 'opacity,y' });

    gsap.fromTo(
      neu.querySelectorAll('[data-quote-text], [data-quote-meta]'),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', overwrite: true },
    );
  };

  const balkenStarten = () => {
    fortschritt?.kill();
    const balken = reiter[aktiv]?.querySelector<HTMLElement>('[data-quote-fortschritt]');
    if (!balken) return;
    gsap.set(balken, { scaleX: 0 });
    fortschritt = gsap.to(balken, {
      scaleX: 1,
      duration: DAUER_MS / 1000,
      ease: 'none',
      onComplete: () => zeige(aktiv + 1, true),
    });
  };

  const laufen = () => {
    if (!bewegung || angehalten || !imBild || document.hidden) return;
    if (fortschritt && fortschritt.isActive()) return;
    balkenStarten();
  };

  const anhalten = () => {
    fortschritt?.pause();
  };
  const weiter = () => {
    if (!bewegung || angehalten || !imBild || document.hidden) return;
    if (fortschritt && fortschritt.paused()) fortschritt.play();
    else laufen();
  };

  const waehle = (index: number) => {
    zeige(index, true);
    reiter[aktiv]?.focus();
    fortschritt?.kill();
    fortschritt = null;
    laufen();
  };

  const aufKlick = (event: Event) => {
    const ziel = (event.currentTarget as HTMLButtonElement);
    waehle(reiter.indexOf(ziel));
  };

  const aufTaste = (event: KeyboardEvent) => {
    const schritte: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (event.key in schritte) {
      event.preventDefault();
      waehle(aktiv + schritte[event.key]);
      return;
    }
    if (event.key === 'Home') { event.preventDefault(); waehle(0); }
    if (event.key === 'End') { event.preventDefault(); waehle(folien.length - 1); }
  };

  reiter.forEach((r) => {
    r.addEventListener('click', aufKlick);
    r.addEventListener('keydown', aufTaste);
  });

  const aufEintritt = () => { angehalten = true; anhalten(); };
  const aufAustritt = () => { angehalten = false; weiter(); };
  root.addEventListener('pointerenter', aufEintritt);
  root.addEventListener('pointerleave', aufAustritt);
  root.addEventListener('focusin', aufEintritt);
  root.addEventListener('focusout', aufAustritt);

  const aufSichtbarkeit = () => (document.hidden ? anhalten() : weiter());
  document.addEventListener('visibilitychange', aufSichtbarkeit);

  const beobachter = ScrollTrigger.create({
    trigger: root,
    start: 'top 85%',
    end: 'bottom 15%',
    onToggle: (self) => { imBild = self.isActive; self.isActive ? weiter() : anhalten(); },
  });

  zeige(0, false);

  // onToggle feuert erst beim Ueberschreiten der Grenze. Liegt die Sektion beim
  // Initialisieren bereits im Bild, etwa bei einem Deeplink auf #referenzen,
  // bliebe der Wechsel sonst fuer immer stehen.
  imBild = beobachter.isActive;
  weiter();

  return () => {
    fortschritt?.kill();
    beobachter.kill();
    document.removeEventListener('visibilitychange', aufSichtbarkeit);
    root.removeEventListener('pointerenter', aufEintritt);
    root.removeEventListener('pointerleave', aufAustritt);
    root.removeEventListener('focusin', aufEintritt);
    root.removeEventListener('focusout', aufAustritt);
    reiter.forEach((r) => {
      r.removeEventListener('click', aufKlick);
      r.removeEventListener('keydown', aufTaste);
    });
    gsap.killTweensOf(root.querySelectorAll('[data-quote-text], [data-quote-meta], [data-quote-fortschritt]'));
  };
}
