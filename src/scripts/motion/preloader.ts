import { gsap, motionEnabled } from './gsap-setup';

const KEY = 'setify:preloaded';

export default function preloader(root: HTMLElement): () => void {
  let seen = false;
  try {
    seen = sessionStorage.getItem(KEY) === '1';
  } catch {
    seen = false;
  }
  if (seen || !motionEnabled()) {
    root.remove();
    return () => {};
  }
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // ignore: private mode / storage unavailable
  }
  document.documentElement.style.overflow = 'hidden';

  const logo = root.querySelector('[data-preloader-logo]');
  const bar = root.querySelector('[data-preloader-bar]');

  const tl = gsap.timeline({
    onComplete() {
      document.documentElement.style.overflow = '';
      root.remove();
    },
  });
  tl.to(logo, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.1)
    .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.2)
    .to(root, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '+=0.15');

  return () => {
    tl.kill();
    document.documentElement.style.overflow = '';
    root.remove();
  };
}
