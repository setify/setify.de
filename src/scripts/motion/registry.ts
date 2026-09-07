import { gsap, ScrollTrigger, reducedMotion } from './gsap-setup';
import { initLenis, scrollToHash } from '../lenis';
import reveals from './reveals';
import nav from './nav';
import preloader from './preloader';

export type MotionInit = (root: HTMLElement) => (() => void) | void;

const modules = new Map<string, MotionInit>();
export function registerMotion(name: string, init: MotionInit): void {
  modules.set(name, init);
}

registerMotion('nav', nav);
registerMotion('preloader', preloader);

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

  if (location.hash && document.querySelector(location.hash)) {
    setTimeout(() => scrollToHash(location.hash), 100);
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
