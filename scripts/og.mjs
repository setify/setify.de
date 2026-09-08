import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const logo = readFileSync(new URL('../public/logo-white.svg', import.meta.url), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace('<svg ', '<svg x="120" y="70" width="360" height="114" ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7a6a4c"/><stop offset=".5" stop-color="#bdac89"/><stop offset="1" stop-color="#e3d6b8"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#bdac89" stop-opacity="0.35"/><stop offset="1" stop-color="#1a1b1e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#1a1b1e"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  ${logo}
  <text x="120" y="420" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="600" font-size="54" fill="#f3eee4">Websites, die man nicht wegklickt.</text>
  <text x="120" y="480" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#a8a49b">Premium Websites aus Köln. Konzept, Design und Code aus einer Hand.</text>
  <rect x="120" y="540" width="240" height="4" fill="url(#g)"/>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(new URL('../public/og.png', import.meta.url), png);
console.log('public/og.png geschrieben,', png.length, 'Bytes');
