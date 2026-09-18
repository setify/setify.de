import { motionEnabled, isDesktop } from './gsap-setup';

/**
 * Zahlenfeld: zwei Ebenen aus Ziffern, die gegeneinander treiben. Hinten
 * wenige sehr grosse Ziffern, vorne ein duennerer Strom kleiner Ziffern.
 * Einzelne Ziffern wuerfeln sich neu, dadurch wirkt das Feld wie ein Zaehler,
 * der nie stehen bleibt.
 *
 * Canvas statt DOM, weil sonst pro Ziffer ein Knoten noetig waere. Gedrosselt
 * auf ~30 Bilder pro Sekunde, das genuegt fuer die langsame Drift.
 */

interface Glyph {
  x: number;      // CSS-Pixel, wandert mit speed
  y: number;
  size: number;   // CSS-Pixel
  alpha: number;
  speed: number;  // CSS-Pixel pro Millisekunde, negativ = nach links
  char: string;
  rollAt: number; // Zeitstempel, ab dem die Ziffer neu gewuerfelt wird
}

const FRAME_MS = 33;
const GOLD = '189,172,137';

const ziffer = () => String(Math.floor(Math.random() * 10));

export default function numberField(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-number-canvas]');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return () => {};

  const maxDpr = isDesktop() ? 2 : 1.5;
  let glyphs: Glyph[] = [];
  let w = 0;          // CSS-Pixel
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let onScreen = true;
  let pageVisible = !document.hidden;

  const build = () => {
    glyphs = [];
    if (w === 0 || h === 0) return;

    // Hintere Ebene: grosse Ziffern, sehr leise, langsam nach links.
    // Auch an der Breite deckeln, sonst wirken die Ziffern auf dem Handy riesig.
    const grossSize = Math.max(74, Math.min(h * 0.55, w * 0.28, 190));
    const grossAbstand = grossSize * 1.15;
    const grossAnzahl = Math.ceil(w / grossAbstand) + 2;
    for (let i = 0; i < grossAnzahl; i += 1) {
      glyphs.push({
        x: i * grossAbstand,
        y: h * 0.5 + grossSize * 0.36,
        size: grossSize,
        alpha: 0.035 + Math.random() * 0.025,
        speed: -0.0075,
        char: ziffer(),
        rollAt: performance.now() + 1200 + Math.random() * 6000,
      });
    }

    // Vordere Ebene: kleine Ziffern, verstreut, gegenlaeufig und schneller.
    const kleinAnzahl = Math.round((w / 100) * (isDesktop() ? 1.6 : 1));
    for (let i = 0; i < kleinAnzahl; i += 1) {
      const size = 11 + Math.random() * 9;
      glyphs.push({
        x: Math.random() * w,
        y: 14 + Math.random() * (h - 24),
        size,
        alpha: 0.07 + Math.random() * 0.09,
        speed: 0.011 + Math.random() * 0.016,
        char: ziffer(),
        rollAt: performance.now() + Math.random() * 3500,
      });
    }
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const nw = Math.max(1, Math.round(root.clientWidth));
    const nh = Math.max(1, Math.round(root.clientHeight));
    if (nw === w && nh === h) return;
    w = nw;
    h = nh;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  };

  const render = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.textBaseline = 'alphabetic';
    for (const g of glyphs) {
      ctx.font = `600 ${g.size}px Switzer, system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${GOLD},${g.alpha.toFixed(3)})`;
      ctx.fillText(g.char, g.x, g.y);
    }
  };

  const step = (now: number, dt: number) => {
    for (const g of glyphs) {
      g.x += g.speed * dt;
      // Rand zu Rand umbrechen, die Breite der Ziffer grosszuegig geschaetzt.
      const breite = g.size;
      if (g.x < -breite) g.x = w + breite;
      else if (g.x > w + breite) g.x = -breite;

      if (now >= g.rollAt) {
        g.char = ziffer();
        g.rollAt = now + 1500 + Math.random() * 5000;
      }
    }
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const dt = now - last;
    if (dt < FRAME_MS) return;
    last = now;
    // Nach einem Tab-Wechsel oder langem Stillstand nicht springen.
    step(now, Math.min(dt, 120));
    render();
  };

  const play = () => {
    if (onScreen && pageVisible && raf === 0) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const pause = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const ro = new ResizeObserver(resize);
  ro.observe(root);
  resize();

  if (!motionEnabled()) {
    render();
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

  render();
  play();

  return () => {
    pause();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    glyphs = [];
  };
}
