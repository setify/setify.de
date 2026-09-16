import { gsap, motionEnabled, canHover } from './gsap-setup';

/**
 * Kartenstapel, dessen hinterste Karte periodisch nach vorne rueckt.
 * Portiert von ui.aceternity.com/components/card-stack, hier ohne React.
 * Der Wrapper hat eine feste Mindesthoehe, die Karten liegen absolut. Dadurch
 * aendert die Rotation die Dokumenthoehe nicht und ScrollTrigger bleibt gueltig.
 */

const INTERVAL_MS = 5000;
const OFFSET_PX = 14;
const SCALE_STEP = 0.04;

export default function cardStack(root: HTMLElement): () => void {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-stack-card]')];
  if (cards.length < 2) return () => {};

  const place = (order: HTMLElement[], animate: boolean) => {
    order.forEach((card, i) => {
      const props = { y: i * OFFSET_PX, scale: 1 - i * SCALE_STEP, zIndex: order.length - i };
      if (animate) gsap.to(card, { ...props, duration: 0.6, ease: 'power3.out' });
      else gsap.set(card, props);
    });
  };

  let order = [...cards];
  place(order, false);

  // Ohne Animation bleibt der Stapel als statischer, lesbarer Stapel stehen.
  if (!motionEnabled()) return () => gsap.killTweensOf(cards);

  let timer = 0;
  let onScreen = false;
  let hovered = false;

  const rotate = () => {
    order = [order[order.length - 1], ...order.slice(0, -1)];
    place(order, true);
  };

  const start = () => {
    if (timer || !onScreen || hovered || document.hidden) return;
    timer = window.setInterval(rotate, INTERVAL_MS);
  };
  const stop = () => {
    if (!timer) return;
    window.clearInterval(timer);
    timer = 0;
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? start() : stop();
    },
    { threshold: 0.2 },
  );
  io.observe(root);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  // Automatisch wechselnder Inhalt muss anhaltbar sein, auch per Tastatur.
  const onEnter = () => { hovered = true; stop(); };
  const onLeave = () => { hovered = false; start(); };
  const hoverable = canHover();
  if (hoverable) {
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
  }
  root.addEventListener('focusin', onEnter);
  root.addEventListener('focusout', onLeave);

  return () => {
    stop();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    if (hoverable) {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
    }
    root.removeEventListener('focusin', onEnter);
    root.removeEventListener('focusout', onLeave);
    gsap.killTweensOf(cards);
  };
}
