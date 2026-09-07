import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://setify.de',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis', 'zod'] },
  },
  redirects: {
    '/kontakt': '/#kontakt',
    '/cookie-richtlinie-eu': '/datenschutz',
    '/2024/08/10/hello-world': '/',
    '/category/uncategorized': '/',
  },
});
