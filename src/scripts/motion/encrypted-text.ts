import { ScrollTrigger, motionEnabled } from './gsap-setup';

/**
 * Zeichensalat, der sich von links nach rechts aufloest.
 * Portiert von ui.aceternity.com/components/encrypted-text, hier ohne React.
 * Leerzeichen bleiben stehen, damit die Wortbreiten nicht springen.
 */

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&*+-<>/?';
const REVEAL_MS = 34;
const FLIP_MS = 48;

const randomChar = () => CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));

export default function encryptedText(root: HTMLElement): () => void {
  const out = root.querySelector<HTMLElement>('[data-encrypted-out]');
  const original = root.dataset.encrypted ?? out?.textContent ?? '';
  if (!out || !original) return () => {};

  // Ohne Animation bleibt der gerenderte Text einfach stehen.
  if (!motionEnabled()) return () => {};

  const chars = [...original];
  let scrambled = chars.map((c) => (c === ' ' ? ' ' : randomChar()));
  let raf = 0;
  let startedAt = 0;
  let lastFlip = 0;
  let done = false;

  const paint = (revealCount: number) => {
    let result = '';
    for (let i = 0; i < chars.length; i += 1) {
      result += i < revealCount ? chars[i] : scrambled[i];
    }
    out.textContent = result;
  };

  const frame = (now: number) => {
    if (!startedAt) startedAt = now;
    const revealCount = Math.floor((now - startedAt) / REVEAL_MS);

    if (now - lastFlip >= FLIP_MS) {
      lastFlip = now;
      scrambled = chars.map((c, i) => (c === ' ' ? ' ' : i < revealCount ? c : randomChar()));
    }

    paint(revealCount);

    if (revealCount >= chars.length) {
      out.textContent = original;
      done = true;
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  const trigger = ScrollTrigger.create({
    trigger: root,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      paint(0);
      raf = requestAnimationFrame(frame);
    },
  });

  return () => {
    if (raf) cancelAnimationFrame(raf);
    trigger.kill();
    // Teardown mitten im Lauf darf keinen Zeichensalat hinterlassen.
    if (!done) out.textContent = original;
  };
}
