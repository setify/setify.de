import { gsap, motionEnabled } from './gsap-setup';
import { site } from '@/content/site';

/**
 * Konsole im KI-Hero. Tippt einen Auftrag, hakt die Schritte nacheinander ab,
 * zeigt das Ergebnis und wechselt dann zum naechsten Beispiel.
 *
 * Eine einzige GSAP-Zeitleiste mit repeat: -1, dadurch laesst sie sich in
 * einem Aufruf anhalten und aufraeumen. Laeuft nur, wenn die Konsole im Bild
 * und der Tab sichtbar ist.
 */

const TIPP_PRO_ZEICHEN = 0.022;

export default function kiConsole(root: HTMLElement): () => void {
  const prompt = root.querySelector<HTMLElement>('[data-console-prompt]');
  const status = root.querySelector<HTMLElement>('[data-console-status]');
  const ergebnis = root.querySelector<HTMLElement>('[data-console-result]');
  const ergebnisText = root.querySelector<HTMLElement>('[data-console-result-text]');
  const zeit = root.querySelector<HTMLElement>('[data-console-time]');
  const schritte = Array.from(root.querySelectorAll<HTMLElement>('[data-console-step]'));
  const runs = site.ki.page.console.runs;

  if (!prompt || !status || !ergebnis || !ergebnisText || !zeit || schritte.length === 0) return () => {};

  // Ohne Animation bleibt der fertige erste Lauf stehen, so wie er im Markup steht.
  if (!motionEnabled()) {
    root.setAttribute('data-fertig', '');
    schritte.forEach((s) => s.setAttribute('data-erledigt', ''));
    status.textContent = 'fertig';
    return () => {};
  }

  const tl = gsap.timeline({ repeat: -1, paused: true });

  runs.forEach((run) => {
    const tippdauer = Math.max(1.1, run.prompt.length * TIPP_PRO_ZEICHEN);

    tl.call(() => {
      root.removeAttribute('data-fertig');
      prompt.textContent = '';
      status.textContent = 'bereit';
      schritte.forEach((el, i) => {
        el.removeAttribute('data-erledigt');
        el.removeAttribute('data-aktiv');
        const text = el.querySelector('[data-console-step-text]');
        if (text) text.textContent = run.steps[i] ?? '';
      });
      ergebnisText.textContent = run.result;
      zeit.textContent = run.time;
    });

    const stand = { n: 0 };
    tl.to(stand, {
      n: run.prompt.length,
      duration: tippdauer,
      ease: 'none',
      onUpdate() { prompt.textContent = run.prompt.slice(0, Math.round(stand.n)); },
    });

    tl.call(() => { status.textContent = 'arbeitet'; }, undefined, '+=0.35');

    run.steps.forEach((_, i) => {
      const el = schritte[i];
      if (!el) return;
      tl.call(() => el.setAttribute('data-aktiv', ''), undefined, '+=0.45');
      tl.call(() => el.setAttribute('data-erledigt', ''), undefined, '+=0.35');
    });

    tl.call(() => {
      status.textContent = 'fertig';
      root.setAttribute('data-fertig', '');
    }, undefined, '+=0.4');

    // Ergebnis stehen lassen, damit man es in Ruhe lesen kann.
    tl.to({}, { duration: 3.4 });
  });

  let onScreen = false;
  let pageVisible = !document.hidden;
  const spiele = () => { if (onScreen && pageVisible) tl.play(); else tl.pause(); };

  const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; spiele(); }, { threshold: 0.2 });
  io.observe(root);

  const onVisibility = () => { pageVisible = !document.hidden; spiele(); };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    tl.kill();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
