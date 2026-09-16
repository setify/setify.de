import { gsap, motionEnabled } from './gsap-setup';

/**
 * Hinweisband ueber der Navigation.
 * Portiert von ui.aceternity.com/components/sticky-banner, hier ohne React.
 * Es liegt im fixierten Header, aendert also keine Dokumenthoehe und keine
 * Ankeroffsets. Beim Scrollen faehrt es zusammen, per Klick verschwindet es
 * dauerhaft.
 */

const KEY = 'setify:ki-banner';
const HIDE_AFTER = 240;

const dismissed = (): boolean => {
  try {
    return localStorage.getItem(KEY) === 'dismissed';
  } catch {
    // Privater Modus und blockierte Site-Daten werfen hier.
    return false;
  }
};

const remember = (): void => {
  try {
    localStorage.setItem(KEY, 'dismissed');
  } catch {
    /* Nicht speicherbar ist kein Fehlerfall, der Banner bleibt dann pro Besuch. */
  }
};

export default function stickyBanner(root: HTMLElement): () => void {
  const close = root.querySelector<HTMLButtonElement>('[data-ki-banner-close]');

  if (dismissed()) {
    document.documentElement.dataset.bannerState = 'dismissed';
    return () => {};
  }

  let collapsed = false;
  const setCollapsed = (next: boolean) => {
    if (next === collapsed) return;
    collapsed = next;
    if (!motionEnabled()) {
      root.style.display = next ? 'none' : '';
      return;
    }
    gsap.to(root, { height: next ? 0 : 'auto', duration: 0.45, ease: 'power3.out' });
  };

  const onScroll = () => setCollapsed(window.scrollY > HIDE_AFTER);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const onClose = () => {
    remember();
    document.documentElement.dataset.bannerState = 'dismissed';
    if (!motionEnabled()) {
      root.style.display = 'none';
      return;
    }
    gsap.to(root, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.out' });
  };
  close?.addEventListener('click', onClose);

  return () => {
    window.removeEventListener('scroll', onScroll);
    close?.removeEventListener('click', onClose);
    gsap.killTweensOf(root);
  };
}
