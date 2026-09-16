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
import sparkles from './sparkles';
import textGenerate from './text-generate';
import cardStack from './card-stack';
import glowingStars from './glowing-stars';
import ledGrid from './led-grid';
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
registerMotion('banner', stickyBanner);

let cleanups: Array<() => void> = [];

function onAnchorClick(event: MouseEvent): void {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
  if (!link) return;
  const hash = link.getAttribute('href')!.replace(/^\//, '');
  if (hash.length < 2 || !document.querySelector(hash)) return;
  event.preventDefault();
  history.pushState(null, '', hash);
  scrollToHash(hash);
}

function setup(): void {
  cleanups.forEach((fn) => fn());
  cleanups = [];

  cleanups.push(initLenis());
  cleanups.push(reveals(document.body) ?? (() => {}));
  cleanups.push(magnetic(document.body) ?? (() => {}));
  cleanups.push(parallax(document.body) ?? (() => {}));

  document.querySelectorAll<HTMLElement>('[data-motion]').forEach((root) => {
    const names = root.dataset.motion!.split(/\s+/);
    for (const name of names) {
      const init = modules.get(name);
      if (!init) continue;
      const cleanup = init(root);
      if (cleanup) cleanups.push(cleanup);
    }
  });

  document.addEventListener('click', onAnchorClick);
  cleanups.push(() => document.removeEventListener('click', onAnchorClick));

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
