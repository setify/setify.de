import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://setify.de',
  output: 'static',
  adapter: vercel(),
  // Diagnoseseite gehoert nicht in die Sitemap.
  integrations: [sitemap({ filter: (page) => !page.includes('/scroll-test') })],
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
