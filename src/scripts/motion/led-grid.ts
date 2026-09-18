import { motionEnabled, isDesktop } from './gsap-setup';

/**
 * LED-Raster: Punkte auf festem Raster, jeder mit eigener Grundhelligkeit,
 * Amplitude, Frequenz und Phase. Dadurch pulsiert das Feld zufaellig statt im
 * Gleichschritt.
 *
 * Canvas statt DOM, weil ein Raster dieser Dichte sonst mehrere tausend Knoten
 * braeuchte. Gedrosselt auf ~22 Bilder pro Sekunde, das reicht fuer ein
 * langsames Pulsieren und kostet kaum Rechenzeit.
 */

interface Led { x: number; y: number; base: number; amp: number; speed: number; phase: number; size: number }

const PITCH = 26;        // Abstand der Punkte in CSS-Pixeln
const FRAME_MS = 45;
const FALLBACK_ALPHA = 0.1;

export default function ledGrid(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-led-canvas]');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  const maxDpr = isDesktop() ? 2 : 1.5;
  let leds: Led[] = [];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let pageVisible = !document.hidden;

  const build = () => {
    const pitch = PITCH * dpr;
    const cols = Math.ceil(w / pitch) + 1;
    const rows = Math.ceil(h / pitch) + 1;
    leds = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        // Wenige hellere Punkte setzen Akzente, der Rest bleibt sehr zurueckhaltend.
        const bright = Math.random() < 0.05;
        leds.push({
          x: c * pitch,
          y: r * pitch,
          base: bright ? 0.2 + Math.random() * 0.14 : 0.04 + Math.random() * 0.07,
          amp: bright ? 0.1 + Math.random() * 0.1 : 0.02 + Math.random() * 0.05,
          speed: 0.00025 + Math.random() * 0.0009,
          phase: Math.random() * Math.PI * 2,
          size: Math.max(1, Math.round((bright ? 2.2 : 1.6) * dpr)),
        });
      }
    }
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const nw = Math.max(1, Math.round(root.clientWidth * dpr));
    const nh = Math.max(1, Math.round(root.clientHeight * dpr));
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    canvas.width = w;
    canvas.height = h;
    build();
  };

  const render = (now: number) => {
    ctx.clearRect(0, 0, w, h);
    for (const led of leds) {
      const alpha = led.base + Math.sin(now * led.speed + led.phase) * led.amp;
      if (alpha <= 0.01) continue;
      ctx.fillStyle = `rgba(189,172,137,${alpha.toFixed(3)})`;
      ctx.fillRect(led.x, led.y, led.size, led.size);
    }
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    if (now - last < FRAME_MS) return;
    last = now;
    render(now);
  };

  const play = () => {
    if (onScreen && pageVisible && raf === 0) raf = requestAnimationFrame(loop);
  };
  const pause = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const ro = new ResizeObserver(resize);
  ro.observe(root);
  resize();

  // Ohne Animation und auf kleinen Geraeten ein ruhiges, gleichmaessiges
  // Raster zeichnen, statt dauerhaft zu rechnen.
  if (!motionEnabled() || !isDesktop()) {
    ctx.clearRect(0, 0, w, h);
    for (const led of leds) {
      ctx.fillStyle = `rgba(189,172,137,${FALLBACK_ALPHA})`;
      ctx.fillRect(led.x, led.y, led.size, led.size);
    }
    return () => ro.disconnect();
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? play() : pause();
    },
    { threshold: 0 },
  );
  io.observe(root);

  const onVisibility = () => {
    pageVisible = !document.hidden;
    pageVisible ? play() : pause();
  };
  document.addEventListener('visibilitychange', onVisibility);

  render(performance.now());
  play();

  return () => {
    pause();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    leds = [];
  };
}
