import { gsap, motionEnabled } from './gsap-setup';

export default function accordion(root: HTMLElement): () => void {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-accordion-item]'));
  const cleanups: Array<() => void> = [];

  const setState = (item: HTMLElement, open: boolean, animate: boolean) => {
    const button = item.querySelector<HTMLButtonElement>('button[aria-expanded]');
    const panel = item.querySelector<HTMLElement>('[data-accordion-panel]');
    const icon = item.querySelector<HTMLElement>('[data-accordion-icon]');
    if (!button || !panel) return;
    button.setAttribute('aria-expanded', String(open));
    if (icon) icon.style.transform = open ? 'rotate(90deg) scaleY(0)' : '';

    if (!animate || !motionEnabled()) {
      panel.hidden = !open;
      gsap.set(panel, { clearProps: 'height,opacity' });
      return;
    }
    if (open) {
      panel.hidden = false;
      gsap.fromTo(panel, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out', clearProps: 'height' });
    } else {
      gsap.to(panel, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut', onComplete() { panel.hidden = true; gsap.set(panel, { clearProps: 'height,opacity' }); } });
    }
  };

  items.forEach((item) => {
    const button = item.querySelector<HTMLButtonElement>('button[aria-expanded]');
    if (!button) return;
    const onClick = () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      items.forEach((other) => other !== item && setState(other, false, true));
      setState(item, !isOpen, true);
    };
    button.addEventListener('click', onClick);
    cleanups.push(() => button.removeEventListener('click', onClick));
  });

  return () => cleanups.forEach((fn) => fn());
}
