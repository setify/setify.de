import { gsap, ScrollTrigger, reducedMotion } from './gsap-setup';
import { initLenis, scrollToHash } from '../lenis';
import reveals from './reveals';
import nav from './nav';
import preloader from './preloader';
import heroGradient from './hero-gradient';
import marquee from './marquee';
import manifestScrub from './manifest-scrub';
import processPin from './process-pin';
import counters from './counters';
import tilt from './tilt';
import accordion from './accordion';
import magnetic from './magnetic';
import parallax from './parallax';
import iconDraw from './icon-draw';
import imageFade from './image-fade';
import sparkles from './sparkles';
import textGenerate from './text-generate';
import cardStack from './card-stack';
import glowingStars from './glowing-stars';
import ledGrid from './led-grid';
import pixelBlast from './pixel-blast';
import kiConsole from './ki-console';
import kiRail from './ki-rail';
import quoteStage from './quote-stage';
import stickyBanner from './sticky-banner';

export type MotionInit = (root: HTMLElement) => (() => void) | void;

const modules = new Map<string, MotionInit>();
export function registerMotion(name: string, init: MotionInit): void {
  modules.set(name, init);
}

registerMotion('nav', nav);
registerMotion('preloader', preloader);
registerMotion('hero', heroGradient);
registerMotion('marquee', marquee);
registerMotion('manifest', manifestScrub);
registerMotion('process', processPin);
registerMotion('counters', counters);
registerMotion('tilt', tilt);
registerMotion('accordion', accordion);
registerMotion('sparkles', sparkles);
registerMotion('generate', textGenerate);
registerMotion('cardstack', cardStack);
registerMotion('stars', glowingStars);
registerMotion('ledgrid', ledGrid);
registerMotion('pixelblast', pixelBlast);
registerMotion('kiconsole', kiConsole);
registerMotion('kirail', kiRail);
registerMotion('quotes', quoteStage);
registerMotion('banner', stickyBanner);

let cleanups: Array<() => void> = [];

function onAnchorClick(event: MouseEvent): void {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
  if (!link) return;
  const hash = link.getAttribute('href')!.replace(/^\//, '');
  if (hash.length < 2 || !document.querySelector(hash)) return;
  event.preventDefault();
  // Muss den Klick hier stoppen: der ClientRouter von Astro hat seinen
  // Listener frueher registriert und wuerde die Sprungmarke sonst selbst
  // behandeln, also hart springen und dabei scroll-margin-top anwenden.
  // Unser preventDefault kaeme zu spaet, deshalb laeuft dieser Handler in der
  // Capture-Phase und unterbindet die Weitergabe.
  event.stopPropagation();
  history.pushState(null, '', hash);
  scrollToHash(hash);
}

/** Laeuft, sobald der Hauptthread Luft hat, spaetestens nach 1,2 Sekunden. */
function beiGelegenheit(fn: () => void): void {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (ric) ric(fn, { timeout: 1200 });
  else window.setTimeout(fn, 200);
}

function starteModule(root: HTMLElement): void {
  const names = root.dataset.motion!.split(/\s+/);
  for (const name of names) {
    const init = modules.get(name);
    if (!init) continue;
    const cleanup = init(root);
    if (cleanup) cleanups.push(cleanup);
  }
}

function setup(): void {
  cleanups.forEach((fn) => fn());
  cleanups = [];

  cleanups.push(initLenis());

  // Nur der erste Bildschirm wird sofort aufgebaut. SplitText zerlegt jede
  // Ueberschrift in Zeilen und Woerter, das ist auf dem Handy teuer.
  const grenze = window.innerHeight * 1.25;
  const imBild = (el: HTMLElement) => el.getBoundingClientRect().top < grenze;

  cleanups.push(reveals(document.body, imBild) ?? (() => {}));
  cleanups.push(imageFade(document.body) ?? (() => {}));

  // Alles auf einmal zu starten ergab auf dem Handy eine einzige Aufgabe von
  // ueber einer Sekunde, in der die Seite nicht auf Eingaben reagierte.
  // Deshalb zuerst nur, was im ersten Bild steht, der Rest folgt, sobald der
  // Hauptthread frei ist.
  const alle = Array.from(document.querySelectorAll<HTMLElement>('[data-motion]'));
  const zuerst = alle.filter(imBild);
  const spaeter = alle.filter((el) => !zuerst.includes(el));

  // Der Hero-Hintergrund ist WebGL. Das Uebersetzen des Shaders blockiert
  // kurz, und er liegt hinter dem Text, deshalb laeuft er in der zweiten
  // Schicht mit und blendet sich per CSS ein.
  const schwer = (el: HTMLElement) => /\b(hero|pixelblast)\b/.test(el.dataset.motion ?? '');
  zuerst.filter((el) => !schwer(el)).forEach(starteModule);

  beiGelegenheit(() => {
    cleanups.push(reveals(document.body) ?? (() => {}));
    cleanups.push(magnetic(document.body) ?? (() => {}));
    cleanups.push(parallax(document.body) ?? (() => {}));
    cleanups.push(iconDraw(document.body) ?? (() => {}));
    zuerst.filter(schwer).forEach(starteModule);
    spaeter.forEach(starteModule);
    ScrollTrigger.refresh();
  });

  document.addEventListener('click', onAnchorClick, { capture: true });
  cleanups.push(() => document.removeEventListener('click', onAnchorClick, { capture: true }));

  document.documentElement.classList.add('motion-ready');
  requestAnimationFrame(() => ScrollTrigger.refresh());

  // Sprungmarke erst anfahren, wenn Bilder und Schriften stehen und
  // ScrollTrigger die gepinnten Sektionen neu vermessen hat. Vorher wuchs das
  // Layout waehrend des Scrollens weiter und das Ziel verschob sich.
  // Betrifft vor allem Links von Unterseiten wie /ki zurueck auf die Startseite.
  if (location.hash && document.querySelector(location.hash)) {
    const jump = () => {
      ScrollTrigger.refresh();
      requestAnimationFrame(() => scrollToHash(location.hash));
    };
    if (document.readyState === 'complete') requestAnimationFrame(jump);
    else window.addEventListener('load', () => requestAnimationFrame(jump), { once: true });
  }
}

function teardown(): void {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
  document.documentElement.classList.remove('motion-ready');
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', teardown);

if (reducedMotion()) {
  document.documentElement.classList.add('reduced-motion');
}
