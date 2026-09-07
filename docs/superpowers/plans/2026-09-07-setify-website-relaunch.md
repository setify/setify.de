# setify.de Relaunch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Statische One-Page-Agentur-Website für setify.de mit zwei Rechtsseiten, Resend-Kontaktformular und GSAP-Animationen, deploybar auf Vercel.

**Architecture:** Astro 7 rendert alle Seiten statisch, eine einzige On-Demand-Route `/api/contact` läuft als Vercel Function. Alle Texte liegen zentral in `src/content/site.ts`, Sektionen sind reine Astro-Komponenten ohne Framework. Animationen sind pro Sektion gekapselte TypeScript-Module mit `init()`/Cleanup, die über `data-motion`-Attribute gefunden und bei Astro View Transitions sauber neu initialisiert werden.

**Tech Stack:** Astro 7.3, TypeScript 5, Tailwind CSS 4 (`@tailwindcss/vite`), GSAP 3.15 (ScrollTrigger, SplitText), Lenis 1.3, Zod 4, Resend 6, Cloudflare Turnstile, Vitest 5, Playwright 1.63, pnpm, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-07-setify-website-relaunch-design.md`

## Global Constraints

- Node >= 22.12 (Astro 7 Anforderung), pnpm als Paketmanager.
- Astro `output: 'static'` mit Vercel-Adapter, nur `src/pages/api/contact.ts` setzt `export const prerender = false`. (Spec nennt `server` plus `prerender = true` pro Seite, `static` plus einmal `prerender = false` ist gleichwertig und weniger Boilerplate.)
- Farben exakt: `#1A1B1E`, `#232428`, `#2E3035`, `#BDAC89`, `#E3D6B8`, `#7A6A4C`, `#F3EEE4`, `#EAE3D5`, `#FBF9F4`, `#6B665C`, `#A8A49B`. Kein Grün.
- Fonts: Fraunces (Headlines), Manrope (Text), selbst gehostet über `@fontsource-variable`. Kein Google-Fonts-Request.
- Markenname immer klein: `setify`. In Fließtext, Titeln, Meta, Mails.
- Keine Gedankenstriche in Texten. Kommas, Punkte, Doppelpunkte.
- Deutsch, Du-Ansprache.
- `prefers-reduced-motion: reduce` reduziert alle Animationen auf Opacity-Fades, deaktiviert Lenis, Pinning, Marquee, Parallax, Tilt, Magnetisch, Canvas.
- Unter 1024 px kein Pinning, kein Tilt, kein Magnetisch.
- Gold nie als Flächenhintergrund ganzer Sektionen.
- Jeder Task endet mit grünem `pnpm check` (Astro Check + Typecheck), `pnpm test` (Vitest) und einem Commit.
- Commit-Messages: Conventional Commits, Deutsch erlaubt, Trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## Dateistruktur

```
astro.config.mjs               Astro, Vercel, Sitemap, Tailwind, Redirects
tsconfig.json                  extends astro/tsconfigs/strict, Alias @/
package.json                   Scripts: dev, build, preview, check, test, test:e2e, og
vitest.config.ts               Unit-Tests unter tests/unit
playwright.config.ts           E2E gegen pnpm dev
.env.example                   Alle Env-Variablen mit Kommentar
public/
  logo.svg, logo-white.svg     Bestehende Logos von setify.de
  favicon.svg                  Anthrazit-Quadrat mit Gold-Verlauf
  og.png                       Generiert durch scripts/og.mjs
  robots.txt
scripts/og.mjs                 Sharp rendert OG-SVG zu PNG
src/
  styles/tokens.css            Tailwind @theme mit allen Farben, Fonts, Skala
  styles/global.css            Reset, Basis-Typografie, Utility-Klassen, Fokus, Reduced Motion
  content/site.ts              Alle Texte, typisiert
  layouts/Base.astro           HTML-Gerüst, Meta, Fonts, ClientRouter, Motion-Bootstrap
  components/seo/Meta.astro    Title, Description, Canonical, OG, Twitter
  components/seo/JsonLd.astro  ProfessionalService
  components/ui/Eyebrow.astro
  components/ui/Button.astro
  components/ui/SectionHeading.astro
  components/ui/ImagePlaceholder.astro
  components/ui/Input.astro
  components/layout/Nav.astro
  components/layout/Footer.astro
  components/layout/Preloader.astro
  components/sections/Hero.astro
  components/sections/TrustMarquee.astro
  components/sections/Manifest.astro
  components/sections/Services.astro
  components/sections/Process.astro
  components/sections/Work.astro
  components/sections/Numbers.astro
  components/sections/Pricing.astro
  components/sections/Industries.astro
  components/sections/Faq.astro
  components/sections/Contact.astro
  pages/index.astro
  pages/impressum.astro
  pages/datenschutz.astro
  pages/api/contact.ts
  lib/contact-schema.ts        Zod-Schema, parseContactInput
  lib/mail.ts                  buildContactEmails, sendContactEmails
  lib/turnstile.ts             verifyTurnstile
  lib/rate-limit.ts            checkRateLimit
  scripts/motion/gsap-setup.ts Plugin-Registrierung, Media-Helper
  scripts/motion/registry.ts   data-motion Discovery, init/cleanup Lifecycle
  scripts/motion/reveals.ts    Text- und Scroll-Reveals (global)
  scripts/motion/nav.ts
  scripts/motion/preloader.ts
  scripts/motion/hero-gradient.ts
  scripts/motion/marquee.ts
  scripts/motion/manifest-scrub.ts
  scripts/motion/process-pin.ts
  scripts/motion/counters.ts
  scripts/motion/magnetic.ts
  scripts/motion/tilt.ts
  scripts/motion/parallax.ts
  scripts/motion/accordion.ts
  scripts/lenis.ts
  scripts/contact-form.ts
tests/unit/site-content.test.ts
tests/unit/contact-schema.test.ts
tests/unit/mail.test.ts
tests/unit/rate-limit.test.ts
tests/e2e/home.spec.ts
tests/e2e/contact.spec.ts
```

---

### Task 1: Projekt-Grundgerüst

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.env.example`, `.npmrc`, `vitest.config.ts`, `src/pages/index.astro` (temporär), `src/env.d.ts`, `public/logo.svg`, `public/logo-white.svg`, `public/robots.txt`
- Modify: `.gitignore` (bereits vorhanden, prüfen)

**Interfaces:**
- Produces: Scripts `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm test`, `pnpm test:e2e`. Alias `@/*` auf `src/*`.

- [ ] **Step 1: package.json anlegen**

```json
{
  "name": "setify-website",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check && tsc --noEmit -p tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "og": "node scripts/og.mjs"
  }
}
```

- [ ] **Step 2: Abhängigkeiten installieren**

Run:
```bash
pnpm add astro@^7.3.1 @astrojs/vercel@^11.0.10 @astrojs/sitemap@^3.7.4 @tailwindcss/vite@^4.3.3 tailwindcss@^4.3.3 gsap@^3.15.0 lenis@^1.3.26 resend@^6.26.0 zod@^4.5.4 @fontsource-variable/fraunces@^5.3.0 @fontsource-variable/manrope@^5.3.0
pnpm add -D typescript@^5.9.0 @astrojs/check vitest@^5.0.0 @playwright/test@^1.63.0 sharp
pnpm exec playwright install chromium
```
Expected: `node_modules` vorhanden, keine Peer-Warnungen zu astro.

- [ ] **Step 3: astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://setify.de',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  redirects: {
    '/kontakt': '/#kontakt',
    '/cookie-richtlinie-eu': '/datenschutz',
    '/2024/08/10/hello-world': '/',
    '/category/uncategorized': '/',
  },
});
```

- [ ] **Step 4: tsconfig.json und env.d.ts**

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vitest/globals"]
  },
  "include": [".astro/types.d.ts", "src/**/*", "tests/**/*", "scripts/**/*"],
  "exclude": ["dist", "node_modules"]
}
```

`src/env.d.ts`:
```ts
interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly RESEND_API_KEY?: string;
  readonly RESEND_FROM?: string;
  readonly CONTACT_TO?: string;
}
```

- [ ] **Step 5: .env.example und .npmrc**

`.env.example`:
```bash
# Cloudflare Turnstile, Testkeys bestehen immer: https://developers.cloudflare.com/turnstile/troubleshooting/testing/
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# Resend, ohne Key läuft Mailversand im Dry-Run (Log statt Versand)
RESEND_API_KEY=
RESEND_FROM="setify <hallo@setify.de>"
CONTACT_TO=mail@setify.de
```

`.npmrc`:
```
engine-strict=true
```

- [ ] **Step 6: vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
});
```

- [ ] **Step 7: Logos und robots.txt**

Run:
```bash
curl -sL -A "Mozilla/5.0" https://setify.de/wp-content/uploads/2024/08/setify_logo_1.svg -o public/logo.svg
curl -sL -A "Mozilla/5.0" https://setify.de/wp-content/uploads/2024/08/setify_logo_white.svg -o public/logo-white.svg
head -c 200 public/logo.svg
```
Expected: Ausgabe beginnt mit `<svg xmlns=`.

`public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://setify.de/sitemap-index.xml
```

- [ ] **Step 8: Temporäre Startseite**

`src/pages/index.astro`:
```astro
---
---
<html lang="de">
  <head><meta charset="utf-8" /><title>setify</title></head>
  <body><h1>setify</h1></body>
</html>
```

- [ ] **Step 9: Build und Check laufen lassen**

Run: `pnpm check && pnpm build`
Expected: `astro check` 0 errors, Build endet mit `Complete!`, Ordner `.vercel/output` existiert.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: Astro-Grundgerüst mit Vercel, Tailwind, Vitest

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Designsystem, Base-Layout, UI-Bausteine

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/seo/Meta.astro`, `src/components/ui/Eyebrow.astro`, `src/components/ui/Button.astro`, `src/components/ui/SectionHeading.astro`, `src/components/ui/ImagePlaceholder.astro`, `src/components/ui/Input.astro`, `src/assets/images/.gitkeep`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces:
  - `Base.astro` Props `{ title: string; description: string; tone?: 'dark' | 'sand'; noindex?: boolean }`, Slot default.
  - `Eyebrow.astro` Props `{ as?: 'p' | 'span'; class?: string }`, Slot Text.
  - `Button.astro` Props `{ href: string; variant?: 'gold' | 'ghost'; magnetic?: boolean; class?: string }`, Slot Text. Rendert `<a data-magnetic>` wenn `magnetic`.
  - `SectionHeading.astro` Props `{ eyebrow: string; title: string; lead?: string; align?: 'left' | 'center'; tone: 'dark' | 'sand' }`.
  - `ImagePlaceholder.astro` Props `{ id: string; ratio: '4:5' | '3:2' | '4:3' | '3:4' | '16:9' | '1:1'; label: string; alt: string; tone?: 'dark' | 'sand'; class?: string; parallax?: boolean }`.
  - `Input.astro` Props `{ name: string; label: string; type?: 'text' | 'email' | 'tel' | 'textarea' | 'select'; required?: boolean; options?: { value: string; label: string }[]; autocomplete?: string; placeholder?: string }`.
  - CSS-Klassen: `.container` (max 1280 px, Padding), `.section` (Padding vertikal), `.section--dark`, `.section--sand`, `.font-display`, `.text-display`, `.text-h1`, `.text-h2`, `.text-h3`, `.text-lead`, `.gold-gradient-text`, `.gold-line`, `[data-reveal]`, `[data-split]`.

- [ ] **Step 1: tokens.css**

```css
@import 'tailwindcss';

@theme {
  --color-anthracite-950: #1a1b1e;
  --color-anthracite-900: #232428;
  --color-anthracite-800: #2e3035;
  --color-gold-700: #7a6a4c;
  --color-gold-500: #bdac89;
  --color-gold-300: #e3d6b8;
  --color-sand-50: #fbf9f4;
  --color-sand-100: #f3eee4;
  --color-sand-200: #eae3d5;
  --color-ink-muted: #6b665c;
  --color-paper-muted: #a8a49b;

  --font-display: 'Fraunces Variable', 'Georgia', serif;
  --font-sans: 'Manrope Variable', system-ui, sans-serif;

  --text-display: clamp(3rem, 2rem + 5vw, 6rem);
  --text-h1: clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem);
  --text-h2: clamp(2rem, 1.3rem + 2.6vw, 3.5rem);
  --text-h3: clamp(1.5rem, 1.2rem + 0.9vw, 2rem);
  --text-lead: clamp(1.125rem, 1rem + 0.4vw, 1.375rem);

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

- [ ] **Step 2: global.css**

```css
@import './tokens.css';
@import '@fontsource-variable/fraunces/full.css';
@import '@fontsource-variable/manrope';
@import 'lenis/dist/lenis.css';

:root {
  --gold-gradient: linear-gradient(135deg, #7a6a4c 0%, #bdac89 50%, #e3d6b8 100%);
  color-scheme: dark;
}

html {
  scroll-behavior: auto;
  -webkit-text-size-adjust: 100%;
}

body {
  @apply bg-anthracite-950 text-sand-100 font-sans antialiased;
  font-size: 1.0625rem;
  line-height: 1.6;
  font-feature-settings: 'ss01', 'cv11';
}

::selection {
  background: #bdac89;
  color: #1a1b1e;
}

:focus-visible {
  outline: 2px solid #bdac89;
  outline-offset: 3px;
  border-radius: 2px;
}

.font-display {
  font-family: var(--font-display);
  font-optical-sizing: auto;
  font-variation-settings: 'SOFT' 30, 'WONK' 0;
  letter-spacing: -0.02em;
}

.text-display { font-size: var(--text-display); line-height: 0.95; font-weight: 300; }
.text-h1 { font-size: var(--text-h1); line-height: 1; font-weight: 400; }
.text-h2 { font-size: var(--text-h2); line-height: 1.05; font-weight: 400; }
.text-h3 { font-size: var(--text-h3); line-height: 1.15; font-weight: 500; }
.text-lead { font-size: var(--text-lead); line-height: 1.5; }

.container {
  width: 100%;
  max-width: 80rem;
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 4vw, 3rem);
}

.section { padding-block: clamp(5rem, 10vw, 10rem); position: relative; }
.section--dark { @apply bg-anthracite-950 text-sand-100; }
.section--sand { @apply bg-sand-100 text-anthracite-950; color-scheme: light; }

.gold-gradient-text {
  background: var(--gold-gradient);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.gold-line {
  height: 1px;
  background: var(--gold-gradient);
  opacity: 0.6;
}

/* Reveal-Startzustände. JS entfernt sie, ohne JS bleibt alles sichtbar. */
html.js [data-reveal] { opacity: 0; transform: translateY(40px); }
html.js [data-split] { visibility: hidden; }
html.js.motion-ready [data-reveal],
html.js.motion-ready [data-split] { opacity: 1; transform: none; visibility: visible; }

@media (prefers-reduced-motion: reduce) {
  html.js [data-reveal] { opacity: 1; transform: none; }
  html.js [data-split] { visibility: visible; }
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Hinweis: Das Startzustand-Muster funktioniert so: `Base.astro` setzt inline sofort `document.documentElement.classList.add('js')`. Die Motion-Module setzen Startwerte per GSAP selbst und fügen danach `motion-ready` hinzu, damit die CSS-Regel den Startzustand wieder freigibt und GSAP übernimmt. Ohne JS sieht der Nutzer alles.

- [ ] **Step 3: Meta.astro**

```astro
---
interface Props {
  title: string;
  description: string;
  noindex?: boolean;
}
const { title, description, noindex = false } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site).toString();
const og = new URL('/og.png', Astro.site).toString();
---
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex && <meta name="robots" content="noindex, nofollow" />}
<meta property="og:type" content="website" />
<meta property="og:site_name" content="setify" />
<meta property="og:locale" content="de_DE" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={og} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={og} />
```

- [ ] **Step 4: Base.astro**

```astro
---
import '@/styles/global.css';
import { ClientRouter } from 'astro:transitions';
import Meta from '@/components/seo/Meta.astro';

interface Props {
  title: string;
  description: string;
  tone?: 'dark' | 'sand';
  noindex?: boolean;
}
const { title, description, tone = 'dark', noindex } = Astro.props;
---
<!doctype html>
<html lang="de" class={tone === 'sand' ? 'tone-sand' : 'tone-dark'}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1a1b1e" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <Meta title={title} description={description} noindex={noindex} />
    <script is:inline>document.documentElement.classList.add('js');</script>
    <ClientRouter />
    <slot name="head" />
  </head>
  <body class={tone === 'sand' ? 'bg-sand-100 text-anthracite-950' : ''}>
    <slot />
    <script>
      import '@/scripts/motion/registry';
    </script>
  </body>
</html>
```

`src/scripts/motion/registry.ts` existiert erst in Task 10. Für diesen Task eine Minimalfassung anlegen, die Task 10 ersetzt:

```ts
// src/scripts/motion/registry.ts (Platzhalter bis Task 10)
document.addEventListener('astro:page-load', () => {
  document.documentElement.classList.add('motion-ready');
});
```

- [ ] **Step 5: Eyebrow, Button, SectionHeading**

`src/components/ui/Eyebrow.astro`:
```astro
---
interface Props { as?: 'p' | 'span'; class?: string }
const { as: Tag = 'p', class: className = '' } = Astro.props;
---
<Tag class={`inline-flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold-500 ${className}`}>
  <span class="inline-block h-px w-6 bg-gold-500/70" aria-hidden="true"></span>
  <slot />
</Tag>
```

`src/components/ui/Button.astro`:
```astro
---
interface Props {
  href: string;
  variant?: 'gold' | 'ghost';
  magnetic?: boolean;
  class?: string;
}
const { href, variant = 'gold', magnetic = false, class: className = '' } = Astro.props;
const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold transition-[transform,box-shadow,background-color,color] duration-500 [transition-timing-function:var(--ease-out-expo)] will-change-transform';
const variants = {
  gold: 'bg-gold-500 text-anthracite-950 hover:bg-gold-300 hover:shadow-[0_20px_60px_-20px_rgba(189,172,137,0.6)]',
  ghost: 'border border-gold-500/50 text-current hover:border-gold-500 hover:bg-gold-500/10',
};
---
<a href={href} class={`${base} ${variants[variant]} ${className}`} data-magnetic={magnetic ? '' : undefined}>
  <span class="relative z-10"><slot /></span>
  <svg class="relative z-10 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</a>
```

`src/components/ui/SectionHeading.astro`:
```astro
---
import Eyebrow from './Eyebrow.astro';
interface Props {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  tone: 'dark' | 'sand';
}
const { eyebrow, title, lead, align = 'left', tone } = Astro.props;
const muted = tone === 'dark' ? 'text-paper-muted' : 'text-ink-muted';
---
<div class={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
  <Eyebrow class={align === 'center' ? 'justify-center' : ''}>{eyebrow}</Eyebrow>
  <h2 class="font-display text-h2 mt-5 text-balance" data-split>{title}</h2>
  {lead && <p class={`text-lead mt-6 ${muted}`} data-reveal>{lead}</p>}
</div>
```

- [ ] **Step 6: ImagePlaceholder.astro**

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  id: string;
  ratio: '4:5' | '3:2' | '4:3' | '3:4' | '16:9' | '1:1';
  label: string;
  alt: string;
  tone?: 'dark' | 'sand';
  class?: string;
  parallax?: boolean;
}
const { id, ratio, label, alt, tone = 'dark', class: className = '', parallax = false } = Astro.props;

const ratios = { '4:5': '4 / 5', '3:2': '3 / 2', '4:3': '4 / 3', '3:4': '3 / 4', '16:9': '16 / 9', '1:1': '1 / 1' };
const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/*.{jpg,jpeg,png,webp,avif}', { eager: true });
const match = Object.entries(images).find(([path]) => path.replace(/^.*\//, '').replace(/\.[^.]+$/, '') === id);
const image = match?.[1].default;

const bg = tone === 'dark' ? 'bg-anthracite-900' : 'bg-sand-200';
const fg = tone === 'dark' ? 'text-paper-muted' : 'text-ink-muted';
---
<figure class={`relative overflow-hidden rounded-2xl ${bg} ${className}`} style={`aspect-ratio: ${ratios[ratio]}`} data-image-id={id}>
  {image ? (
    <Image src={image} alt={alt} class="h-full w-full object-cover" data-parallax={parallax ? '' : undefined} widths={[480, 768, 1200, 1600]} sizes="(min-width: 1024px) 50vw, 100vw" />
  ) : (
    <div class="absolute inset-0 grid place-items-center" data-parallax={parallax ? '' : undefined}>
      <svg class="absolute inset-0 h-full w-full opacity-60" aria-hidden="true">
        <defs>
          <linearGradient id={`ph-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#7a6a4c" stop-opacity="0.35" />
            <stop offset="1" stop-color="#e3d6b8" stop-opacity="0.15" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#ph-${id})`} />
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#bdac89" stroke-opacity="0.3" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="#bdac89" stroke-opacity="0.3" />
      </svg>
      <div class={`relative z-10 rounded-full border border-gold-500/40 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${fg}`} aria-hidden="true">
        BILD: {label}, {ratio}
      </div>
      <span class="sr-only">{alt}</span>
    </div>
  )}
  <span class="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-gold-500/20" aria-hidden="true"></span>
</figure>
```

- [ ] **Step 7: Input.astro**

```astro
---
interface Option { value: string; label: string }
interface Props {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  required?: boolean;
  options?: Option[];
  autocomplete?: string;
  placeholder?: string;
}
const { name, label, type = 'text', required = false, options = [], autocomplete, placeholder } = Astro.props;
const id = `field-${name}`;
const field =
  'peer w-full rounded-xl border border-anthracite-950/15 bg-sand-50 px-4 py-3.5 text-anthracite-950 placeholder:text-ink-muted/60 transition-colors duration-300 focus:border-gold-700 focus:outline-none aria-[invalid=true]:border-red-700';
---
<div class="group/field flex flex-col gap-2">
  <label for={id} class="text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
    {label}{required && <span class="text-gold-700"> *</span>}
  </label>
  {type === 'textarea' ? (
    <textarea id={id} name={name} rows="5" required={required} placeholder={placeholder} class={`${field} resize-y`}></textarea>
  ) : type === 'select' ? (
    <select id={id} name={name} required={required} class={field}>
      <option value="">Bitte wählen</option>
      {options.map((o) => <option value={o.value}>{o.label}</option>)}
    </select>
  ) : (
    <input id={id} name={name} type={type} required={required} autocomplete={autocomplete} placeholder={placeholder} class={field} />
  )}
  <p class="min-h-[1.25rem] text-[0.8rem] text-red-700" data-error-for={name} aria-live="polite"></p>
</div>
```

- [ ] **Step 8: index.astro auf Base umstellen (Sichtprüfung des Designsystems)**

```astro
---
import Base from '@/layouts/Base.astro';
import Eyebrow from '@/components/ui/Eyebrow.astro';
import Button from '@/components/ui/Button.astro';
import SectionHeading from '@/components/ui/SectionHeading.astro';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.astro';
---
<Base title="setify | Premium Websites aus Köln" description="Designsystem-Vorschau">
  <main>
    <section class="section section--dark">
      <div class="container">
        <Eyebrow>Webagentur aus Köln</Eyebrow>
        <h1 class="font-display text-display mt-6">Websites, die man <span class="gold-gradient-text">nicht wegklickt.</span></h1>
        <div class="mt-10 flex gap-4"><Button href="#kontakt" magnetic>Projekt anfragen</Button><Button href="#work" variant="ghost">Referenzen ansehen</Button></div>
        <ImagePlaceholder id="hero-visual" ratio="4:5" label="Hero-Visual" alt="Platzhalter" class="mt-12 max-w-md" />
      </div>
    </section>
    <section class="section section--sand">
      <div class="container">
        <SectionHeading tone="sand" eyebrow="Leistungen" title="Alles, was dein Auftritt braucht." lead="Vorschau der Sand-Sektion." />
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 9: Prüfen**

Run: `pnpm check && pnpm build`
Expected: 0 Fehler. Danach `pnpm dev`, im Browser `http://localhost:4321`: Fraunces-Headline, Gold-Verlauf im Text, Sand-Sektion hell, Platzhalter mit Beschriftung `BILD: Hero-Visual, 4:5`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: Designsystem, Base-Layout und UI-Bausteine

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Inhalte zentral in site.ts

**Files:**
- Create: `src/content/site.ts`, `tests/unit/site-content.test.ts`

**Interfaces:**
- Produces: `export const site` mit Typ `SiteContent`. Alle Sektionen lesen nur hieraus. Feldnamen unten sind verbindlich für Task 4 bis 6.

- [ ] **Step 1: Test schreiben**

`tests/unit/site-content.test.ts`:
```ts
import { site } from '@/content/site';

describe('site content', () => {
  it('has 12 sections with unique ids matching nav anchors', () => {
    const ids = site.sections.map((s) => s.id);
    expect(ids).toHaveLength(12);
    expect(new Set(ids).size).toBe(12);
    for (const link of site.nav.links) {
      expect(ids).toContain(link.href.replace('#', ''));
    }
  });

  it('spells the brand lowercase everywhere', () => {
    const json = JSON.stringify(site);
    expect(json).not.toMatch(/Setify/);
  });

  it('contains no em dashes', () => {
    expect(JSON.stringify(site)).not.toMatch(/—/);
  });

  it('has prices from the spec', () => {
    const single = site.pricing.plans.find((p) => p.name === 'Website Single');
    const abo = site.pricing.plans.find((p) => p.name === 'Website Abo');
    expect(single?.price).toBe('4.790 €');
    expect(abo?.price).toBe('690 €');
    expect(abo?.recommended).toBe(true);
  });

  it('has unique image placeholder ids', () => {
    const ids = [
      site.hero.image.id,
      ...site.services.items.map((s) => s.image.id),
      ...site.work.items.map((w) => w.image.id),
      ...site.industries.items.map((i) => i.image.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `pnpm test`
Expected: FAIL, `Cannot find module '@/content/site'`.

- [ ] **Step 3: site.ts schreiben**

```ts
export type Tone = 'dark' | 'sand';
export type Ratio = '4:5' | '3:2' | '4:3' | '3:4' | '16:9' | '1:1';

export interface ImageRef { id: string; ratio: Ratio; label: string; alt: string }
export interface SectionMeta { id: string; tone: Tone }

export interface SiteContent {
  meta: { title: string; description: string; url: string; email: string; city: string };
  nav: { links: { label: string; href: string }[]; cta: { label: string; href: string } };
  sections: SectionMeta[];
  hero: { eyebrow: string; title: string; titleAccent: string; lead: string; primary: { label: string; href: string }; secondary: { label: string; href: string }; image: ImageRef };
  trust: { label: string; clients: string[] };
  manifest: { text: string; highlights: string[] };
  services: { eyebrow: string; title: string; lead: string; items: { number: string; title: string; text: string; points: string[]; image: ImageRef }[] };
  process: { eyebrow: string; title: string; steps: { number: string; title: string; text: string }[] };
  work: { eyebrow: string; title: string; items: { client: string; industry: string; text: string; quote: string; image: ImageRef }[]; testimonials: { quote: string; author: string; company: string }[] };
  numbers: { items: { value: number; suffix: string; label: string }[] };
  pricing: { eyebrow: string; title: string; note: string; plans: { name: string; price: string; prefix: string; period: string; text: string; features: string[]; cta: string; recommended: boolean }[] };
  industries: { eyebrow: string; title: string; items: { title: string; text: string; image: ImageRef }[] };
  faq: { eyebrow: string; title: string; items: { question: string; answer: string }[] };
  contact: { eyebrow: string; title: string; text: string; success: { title: string; text: string }; projectTypes: { value: string; label: string }[]; budgets: { value: string; label: string }[] };
  footer: { claim: string; legal: { label: string; href: string }[] };
}

export const site: SiteContent = {
  meta: {
    title: 'setify | Premium Websites aus Köln',
    description: 'setify baut Websites, die man nicht wegklickt. Konzept, Design und Code aus einer Hand, seit über 20 Jahren. Schnell, hochwertig, persönlich betreut.',
    url: 'https://setify.de',
    email: 'mail@setify.de',
    city: 'Köln',
  },
  nav: {
    links: [
      { label: 'Leistungen', href: '#leistungen' },
      { label: 'Prozess', href: '#prozess' },
      { label: 'Referenzen', href: '#referenzen' },
      { label: 'Preise', href: '#preise' },
      { label: 'FAQ', href: '#faq' },
    ],
    cta: { label: 'Projekt anfragen', href: '#kontakt' },
  },
  sections: [
    { id: 'hero', tone: 'dark' },
    { id: 'vertrauen', tone: 'dark' },
    { id: 'manifest', tone: 'dark' },
    { id: 'leistungen', tone: 'sand' },
    { id: 'prozess', tone: 'sand' },
    { id: 'referenzen', tone: 'dark' },
    { id: 'zahlen', tone: 'sand' },
    { id: 'preise', tone: 'dark' },
    { id: 'branchen', tone: 'sand' },
    { id: 'faq', tone: 'sand' },
    { id: 'kontakt', tone: 'dark' },
    { id: 'footer', tone: 'dark' },
  ],
  hero: {
    eyebrow: 'Webagentur aus Köln',
    title: 'Websites, die man',
    titleAccent: 'nicht wegklickt.',
    lead: 'setify baut digitale Auftritte für Unternehmen, die mehr wollen als Baukasten. Konzept, Design und Code aus einer Hand, seit über 20 Jahren.',
    primary: { label: 'Projekt anfragen', href: '#kontakt' },
    secondary: { label: 'Referenzen ansehen', href: '#referenzen' },
    image: { id: 'hero-visual', ratio: '4:5', label: 'Hero-Visual', alt: 'Arbeitsplatz mit Website-Entwurf auf großem Bildschirm' },
  },
  trust: {
    label: 'Vertrauen uns',
    clients: ['Tivendo', 'Blumen Strunck', 'Weinhof Rudolstadt', 'Berg-Loft Styles'],
  },
  manifest: {
    text: 'Eine Website ist kein Projekt, das fertig wird. Sie ist der erste Händedruck mit jedem Kunden. Deshalb bauen wir keine Vorlagen, sondern Auftritte, die zu dir passen, schnell laden und auch in drei Jahren noch überzeugen.',
    highlights: ['erste Händedruck', 'zu dir passen', 'schnell laden'],
  },
  services: {
    eyebrow: 'Leistungen',
    title: 'Alles, was dein Auftritt braucht.',
    lead: 'Vier Bausteine, ein Ansprechpartner. Du bekommst kein Puzzle aus Freelancern, sondern ein Ergebnis, das zusammenpasst.',
    items: [
      { number: '01', title: 'Strategie & Konzept', text: 'Bevor wir gestalten, verstehen wir. Zielgruppe, Wettbewerb, Ziele. Daraus wird eine Struktur, die führt statt verwirrt.', points: ['Briefing-Workshop', 'Seitenarchitektur', 'Content-Plan'], image: { id: 'service-strategie', ratio: '3:2', label: 'Strategie & Konzept', alt: 'Skizzen einer Seitenstruktur auf Papier' } },
      { number: '02', title: 'Design & UX', text: 'Gestaltung, die zu deiner Branche passt und deine Kunden ernst nimmt. Klar, hochwertig, wiedererkennbar.', points: ['Individuelles Design', 'Responsive für alle Geräte', 'Interaktion und Animation'], image: { id: 'service-design', ratio: '3:2', label: 'Design & UX', alt: 'Design-Entwurf einer Website auf Tablet und Laptop' } },
      { number: '03', title: 'Entwicklung & Performance', text: 'Sauberer Code statt Plugin-Stapel. Ladezeiten unter einer Sekunde, Bestwerte in Google PageSpeed, sicher gehostet.', points: ['Moderne Frameworks', 'Performance-Optimierung', 'SEO-Grundlagen'], image: { id: 'service-entwicklung', ratio: '3:2', label: 'Entwicklung & Performance', alt: 'Code-Editor mit Performance-Messung' } },
      { number: '04', title: 'Betreuung & Wachstum', text: 'Nach dem Launch geht es weiter. Updates, Backups, Anpassungen und Ideen, wie deine Seite mehr Anfragen bringt.', points: ['Monatliche Checks', 'Inhaltspflege', 'Weiterentwicklung'], image: { id: 'service-betreuung', ratio: '3:2', label: 'Betreuung & Wachstum', alt: 'Gespräch zwischen Berater und Kunde' } },
    ],
  },
  process: {
    eyebrow: 'So arbeiten wir',
    title: 'Vier Schritte bis zum Launch.',
    steps: [
      { number: '01', title: 'Anfrage', text: 'Du schreibst uns über das Formular. Wir melden uns innerhalb eines Werktags mit ersten Gedanken und einem Terminvorschlag.' },
      { number: '02', title: 'Briefing', text: 'In einem strukturierten Gespräch klären wir Ziele, Inhalte und Umfang. Danach bekommst du ein festes Angebot, kein Stundenschätzen.' },
      { number: '03', title: 'Umsetzung', text: 'Design und Entwicklung laufen transparent. Du siehst Zwischenstände live und gibst direkt Feedback.' },
      { number: '04', title: 'Launch & Betreuung', text: 'Wir gehen gemeinsam online, prüfen alles auf echten Geräten und bleiben danach ansprechbar.' },
    ],
  },
  work: {
    eyebrow: 'Referenzen',
    title: 'Ausgewählte Arbeiten.',
    items: [
      { client: 'Tivendo', industry: 'Industrie', text: 'Klare Produktkommunikation für Kunden und Bewerber.', quote: 'Zitat zur Freigabe: Endlich eine Seite, die unsere Produkte so erklärt, wie wir es im Gespräch tun.', image: { id: 'work-tivendo', ratio: '4:3', label: 'Screenshot Tivendo', alt: 'Startseite der Tivendo-Website' } },
      { client: 'Blumen Strunck', industry: 'Handwerk', text: 'Regionaler Auftritt mit Anfragen direkt über die Website.', quote: 'Zitat zur Freigabe: Seit dem Relaunch kommen Anfragen über die Seite, nicht mehr nur über Telefon.', image: { id: 'work-strunck', ratio: '4:3', label: 'Screenshot Blumen Strunck', alt: 'Startseite der Blumen Strunck Website' } },
      { client: 'Weinhof Rudolstadt', industry: 'Gastro & Event', text: 'Genuss und Veranstaltungen, stimmungsvoll inszeniert.', quote: 'Zitat zur Freigabe: Die Seite fühlt sich an wie ein Abend bei uns im Weinhof.', image: { id: 'work-weinhof', ratio: '4:3', label: 'Screenshot Weinhof Rudolstadt', alt: 'Startseite der Weinhof Rudolstadt Website' } },
      { client: 'Berg-Loft Styles', industry: 'Lifestyle', text: 'Ästhetik mit Liebe zum Detail, die sich vom Wettbewerb abhebt.', quote: 'Zitat zur Freigabe: Jedes Detail sitzt. Genau so wollten wir wahrgenommen werden.', image: { id: 'work-bergloft', ratio: '4:3', label: 'Screenshot Berg-Loft Styles', alt: 'Startseite der Berg-Loft Styles Website' } },
    ],
    testimonials: [
      { quote: 'Zitat zur Freigabe: Schnell, ehrlich, und das Ergebnis spricht für sich.', author: 'Marcel', company: 'Kunde' },
      { quote: 'Zitat zur Freigabe: Wir hatten einen Ansprechpartner und keine Überraschungen bei den Kosten.', author: 'Geschäftsführung', company: 'Tivendo' },
      { quote: 'Zitat zur Freigabe: Die Betreuung nach dem Launch ist Gold wert.', author: 'Inhaberin', company: 'Blumen Strunck' },
    ],
  },
  numbers: {
    items: [
      { value: 20, suffix: '+', label: 'Jahre Erfahrung' },
      { value: 100, suffix: '+', label: 'Projekte' },
      { value: 100, suffix: '', label: 'PageSpeed als Ziel' },
      { value: 1, suffix: '', label: 'Ansprechpartner' },
    ],
  },
  pricing: {
    eyebrow: 'Preise',
    title: 'Fair, transparent, ohne Kleingedrucktes.',
    note: 'Alle Preise netto zzgl. USt.',
    plans: [
      { name: 'Website Single', price: '4.790 €', prefix: 'ab', period: 'einmalig', text: 'Für Unternehmen, die einen starken Auftritt wollen und ihn selbst betreuen.', features: ['Konzept und Design', 'Entwicklung und Launch', 'Responsive und performance-optimiert', 'Einführung in die Pflege', 'Updates optional buchbar'], cta: 'Anfragen', recommended: false },
      { name: 'Website Abo', price: '690 €', prefix: 'ab', period: 'pro Monat, 12 Monate Mindestlaufzeit', text: 'Für alle, die sich um nichts kümmern wollen.', features: ['Alles aus Single', 'Hosting und Backups', 'Monatliche Updates und Checks', 'Inhaltspflege inklusive', 'Persönlicher Support'], cta: 'Anfragen', recommended: true },
      { name: 'Individuell', price: 'auf Anfrage', prefix: '', period: '', text: 'Für Shops, Portale oder Projekte mit besonderen Anforderungen.', features: ['Festpreis nach Briefing', 'Tages- oder Stundensatz möglich', 'Langfristige Zusammenarbeit'], cta: 'Gespräch vereinbaren', recommended: false },
    ],
  },
  industries: {
    eyebrow: 'Branchen',
    title: 'Zu Hause in deiner Branche.',
    items: [
      { title: 'Industrie', text: 'Komplexe Leistungen klar erklärt, für Kunden wie für Bewerber.', image: { id: 'industry-industrie', ratio: '3:4', label: 'Industrie', alt: 'Produktionshalle mit Maschinen' } },
      { title: 'Lifestyle', text: 'Ästhetik, die Marke wird. Jedes Detail sitzt.', image: { id: 'industry-lifestyle', ratio: '3:4', label: 'Lifestyle', alt: 'Stilvolles Interieur mit Produkten' } },
      { title: 'Handwerk', text: 'Gefunden werden, Vertrauen aufbauen, Anfragen direkt erhalten.', image: { id: 'industry-handwerk', ratio: '3:4', label: 'Handwerk', alt: 'Handwerker bei der Arbeit' } },
      { title: 'Gastro & Event', text: 'Stimmung, Qualität und Reservierung an einem Ort.', image: { id: 'industry-gastro', ratio: '3:4', label: 'Gastro & Event', alt: 'Gedeckter Tisch in stimmungsvollem Licht' } },
    ],
  },
  faq: {
    eyebrow: 'Fragen',
    title: 'Was du wissen willst.',
    items: [
      { question: 'Wie lange dauert eine Website?', answer: 'Eine Single-Website ist in der Regel nach 4 bis 6 Wochen online. Der größte Faktor ist, wie schnell Inhalte und Feedback bei uns landen.' },
      { question: 'WordPress oder eigener Code?', answer: 'Beides, je nach Anforderung. Wenn du Inhalte oft selbst pflegen willst, setzen wir auf WordPress mit schlankem Setup. Für maximale Geschwindigkeit bauen wir statisch mit modernen Frameworks.' },
      { question: 'Was kostet eine Website wirklich?', answer: 'Single ab 4.790 €, Abo ab 690 € im Monat. Nach dem Briefing bekommst du einen Festpreis. Keine Überraschungen.' },
      { question: 'Wem gehört die Website?', answer: 'Dir. Design, Code und Inhalte gehen mit dem Launch komplett in dein Eigentum über, auch im Abo nach Ende der Laufzeit.' },
      { question: 'Übernehmt ihr auch bestehende Seiten?', answer: 'Ja. Wir analysieren den aktuellen Stand und sagen dir ehrlich, ob sich ein Redesign lohnt oder ein Neustart günstiger ist.' },
      { question: 'Wie läuft die Betreuung im Abo?', answer: 'Monatlich prüfen wir Updates, Sicherheit, Ladezeit und Backups. Textänderungen und kleine Anpassungen sind inklusive, größere Erweiterungen bieten wir separat an.' },
    ],
  },
  contact: {
    eyebrow: 'Kontakt',
    title: 'Lass uns über dein Projekt sprechen.',
    text: 'Erzähl uns kurz, worum es geht. Wir antworten innerhalb eines Werktags, persönlich und ohne Verkaufsdruck.',
    success: { title: 'Danke, deine Anfrage ist da.', text: 'Wir melden uns innerhalb eines Werktags.' },
    projectTypes: [
      { value: 'website', label: 'Neue Website' },
      { value: 'redesign', label: 'Redesign bestehender Seite' },
      { value: 'shop', label: 'Shop oder Portal' },
      { value: 'performance', label: 'Performance und SEO' },
      { value: 'betreuung', label: 'Betreuung und Wartung' },
      { value: 'sonstiges', label: 'Sonstiges' },
    ],
    budgets: [
      { value: 'bis-5k', label: 'bis 5.000 €' },
      { value: '5k-10k', label: '5.000 bis 10.000 €' },
      { value: '10k-25k', label: '10.000 bis 25.000 €' },
      { value: 'ueber-25k', label: 'über 25.000 €' },
      { value: 'abo', label: 'Website Abo' },
      { value: 'offen', label: 'Noch offen' },
    ],
  },
  footer: {
    claim: 'Premium Websites aus Köln.',
    legal: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
    ],
  },
};
```

- [ ] **Step 4: Test laufen lassen**

Run: `pnpm test`
Expected: 5 Tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: zentrale Inhalte in site.ts mit Tests

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Nav, Footer, Seitenskelett, Playwright

**Files:**
- Create: `src/components/layout/Nav.astro`, `src/components/layout/Footer.astro`, `playwright.config.ts`, `tests/e2e/home.spec.ts`
- Modify: `src/pages/index.astro`, `.gitignore` (playwright-report, test-results bereits drin)

**Interfaces:**
- Consumes: `site` aus Task 3, `Base`, `Button`, `Eyebrow` aus Task 2.
- Produces: `index.astro` rendert 12 `<section id="...">` gemäß `site.sections`, Sektionen werden in Task 5 und 6 gegen echte Komponenten getauscht. `Nav.astro` Props `{ tone?: 'dark' | 'sand' }` (Standard `dark`; `sand` für Rechtsseiten mit dunklem Logo, dunklem Text und absoluten Anker-Links `/#...`), hat `data-motion="nav"`, Burger-Button `[data-nav-toggle]`, Overlay `[data-nav-overlay]`.

- [ ] **Step 1: Playwright-Konfiguration**

`playwright.config.ts`:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'pnpm dev --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
```

- [ ] **Step 2: E2E-Test schreiben**

`tests/e2e/home.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

const SECTION_IDS = ['hero', 'vertrauen', 'manifest', 'leistungen', 'prozess', 'referenzen', 'zahlen', 'preise', 'branchen', 'faq', 'kontakt', 'footer'];

test.describe('Startseite', () => {
  test('rendert alle 12 Sektionen', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
    await page.goto('/');
    for (const id of SECTION_IDS) {
      await expect(page.locator(`#${id}`), `Sektion #${id}`).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('Navigation verlinkt auf Anker', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(nav.getByRole('link', { name: 'Leistungen' })).toHaveAttribute('href', '#leistungen');
    await expect(nav.getByRole('link', { name: 'Projekt anfragen' })).toHaveAttribute('href', '#kontakt');
  });

  test('hat Titel und Description', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('setify | Premium Websites aus Köln');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /setify baut Websites/);
  });
});
```

- [ ] **Step 3: Test laufen lassen, muss fehlschlagen**

Run: `pnpm test:e2e`
Expected: FAIL, Sektionen fehlen.

- [ ] **Step 4: Nav.astro**

```astro
---
import { site } from '@/content/site';
import Button from '@/components/ui/Button.astro';
interface Props { tone?: 'dark' | 'sand' }
const { tone = 'dark' } = Astro.props;
const sand = tone === 'sand';
const logo = sand ? '/logo.svg' : '/logo-white.svg';
const linkColor = sand ? 'text-anthracite-950/80 hover:text-anthracite-950' : 'text-sand-100/80 hover:text-sand-100';
const bgColor = sand ? 'bg-sand-100/80 border-anthracite-950/10' : 'bg-anthracite-950/80 border-anthracite-800/60';
const barColor = sand ? 'bg-anthracite-950' : 'bg-sand-100';
const href = (h: string) => (sand ? `/${h}` : h);
---
<header class="fixed inset-x-0 top-0 z-50 transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)]" data-motion="nav" data-nav>
  <div class={`absolute inset-0 -z-10 opacity-0 backdrop-blur-xl transition-opacity duration-500 border-b ${bgColor}`} data-nav-bg aria-hidden="true"></div>
  <nav class="container flex h-20 items-center justify-between" aria-label="Hauptnavigation">
    <a href="/" class="flex items-center" aria-label="setify Startseite">
      <img src={logo} alt="setify" width="126" height="40" class="h-8 w-auto" />
    </a>
    <ul class="hidden items-center gap-8 lg:flex">
      {site.nav.links.map((l) => (
        <li>
          <a href={href(l.href)} class={`relative text-[0.9rem] font-medium transition-colors duration-300 ${linkColor} after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-gold-500 after:transition-[width] after:duration-500 hover:after:w-full`}>{l.label}</a>
        </li>
      ))}
    </ul>
    <div class="hidden lg:block">
      <Button href={href(site.nav.cta.href)} magnetic class="!px-6 !py-3">{site.nav.cta.label}</Button>
    </div>
    <button type="button" class="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden" aria-label="Menü öffnen" aria-expanded="false" aria-controls="nav-overlay" data-nav-toggle>
      <span class={`block h-px w-6 transition-transform duration-500 ${barColor}`} data-bar="1"></span>
      <span class={`block h-px w-6 transition-opacity duration-300 ${barColor}`} data-bar="2"></span>
      <span class={`block h-px w-6 transition-transform duration-500 ${barColor}`} data-bar="3"></span>
    </button>
  </nav>
  <div id="nav-overlay" class="fixed inset-0 z-[55] flex flex-col justify-between bg-anthracite-950 px-6 pb-10 pt-28 lg:hidden" hidden data-nav-overlay>
    <ul class="flex flex-col gap-6">
      {site.nav.links.map((l) => (
        <li data-nav-overlay-item>
          <a href={href(l.href)} class="font-display text-h2 text-sand-100" data-nav-link>{l.label}</a>
        </li>
      ))}
    </ul>
    <div data-nav-overlay-item>
      <Button href={href(site.nav.cta.href)} class="w-full">{site.nav.cta.label}</Button>
      <p class="mt-6 text-sm text-paper-muted">{site.meta.email} · {site.meta.city}</p>
    </div>
  </div>
</header>
```

- [ ] **Step 5: Footer.astro**

```astro
---
import { site } from '@/content/site';
const year = new Date().getFullYear();
---
<footer id="footer" class="section--dark relative border-t border-anthracite-800">
  <div class="gold-line absolute inset-x-0 top-0" aria-hidden="true"></div>
  <div class="container grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
    <div>
      <img src="/logo-white.svg" alt="setify" width="126" height="40" class="h-8 w-auto" />
      <p class="mt-5 max-w-xs text-paper-muted">{site.footer.claim}</p>
    </div>
    <nav aria-label="Footer Navigation">
      <p class="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold-500">Navigation</p>
      <ul class="mt-4 flex flex-col gap-2">
        {site.nav.links.map((l) => <li><a href={`/${l.href}`} class="text-sand-100/80 transition-colors hover:text-gold-300">{l.label}</a></li>)}
      </ul>
    </nav>
    <div>
      <p class="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold-500">Rechtliches</p>
      <ul class="mt-4 flex flex-col gap-2">
        {site.footer.legal.map((l) => <li><a href={l.href} class="text-sand-100/80 transition-colors hover:text-gold-300">{l.label}</a></li>)}
      </ul>
      <a href={`mailto:${site.meta.email}`} class="mt-6 inline-block text-sand-100/80 transition-colors hover:text-gold-300">{site.meta.email}</a>
    </div>
  </div>
  <div class="container flex flex-col gap-2 border-t border-anthracite-800 py-6 text-sm text-paper-muted md:flex-row md:justify-between">
    <p>© {year} setify</p>
    <p>Philipp Walter, {site.meta.city}</p>
  </div>
</footer>
```

- [ ] **Step 6: index.astro als Skelett**

```astro
---
import Base from '@/layouts/Base.astro';
import Nav from '@/components/layout/Nav.astro';
import Footer from '@/components/layout/Footer.astro';
import { site } from '@/content/site';
const bodySections = site.sections.filter((s) => s.id !== 'footer');
---
<Base title={site.meta.title} description={site.meta.description}>
  <Nav />
  <main>
    {bodySections.map((s) => (
      <section id={s.id} class={`section ${s.tone === 'dark' ? 'section--dark' : 'section--sand'}`}>
        <div class="container"><p class="text-paper-muted">Sektion {s.id}</p></div>
      </section>
    ))}
  </main>
  <Footer />
</Base>
```

- [ ] **Step 7: Tests laufen lassen**

Run: `pnpm check && pnpm test:e2e`
Expected: 3 E2E-Tests PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Navigation, Footer, Seitenskelett und Playwright

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Sektionen Hero, Vertrauensleiste, Manifest, Leistungen, Prozess

**Files:**
- Create: `src/components/sections/Hero.astro`, `src/components/sections/TrustMarquee.astro`, `src/components/sections/Manifest.astro`, `src/components/sections/Services.astro`, `src/components/sections/Process.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `site`, UI-Komponenten.
- Produces Hooks für Task 10 und 11 (verbindliche Attribute):
  - Hero: `data-motion="hero"`, Canvas `[data-hero-canvas]`, Headline `[data-hero-title]`, Bildwrapper `[data-hero-image]`, Scroll-Indikator `[data-hero-scroll]`.
  - TrustMarquee: `data-motion="marquee"`, Laufband `[data-marquee-track]` mit zwei identischen Gruppen `[data-marquee-group]`.
  - Manifest: `data-motion="manifest"`, Absatz `[data-manifest-text]`, Hervorhebungen in `<em>`.
  - Services: `data-motion="tilt"` auf dem Grid, Karten `[data-tilt-card]`, Glow `[data-tilt-glow]`.
  - Process: `data-motion="process"`, Track `[data-process-track]`, Karten `[data-process-card]`, Fortschrittslinie `[data-process-progress]`.

- [ ] **Step 1: Hero.astro**

```astro
---
import { site } from '@/content/site';
import Eyebrow from '@/components/ui/Eyebrow.astro';
import Button from '@/components/ui/Button.astro';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.astro';
const { hero } = site;
---
<section id="hero" class="section--dark relative flex min-h-svh items-center overflow-hidden pt-32 pb-20" data-motion="hero">
  <canvas class="pointer-events-none absolute inset-0 h-full w-full opacity-70 [filter:blur(70px)_saturate(1.1)]" data-hero-canvas aria-hidden="true"></canvas>
  <div class="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay" aria-hidden="true" style="background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%%22 height=%22100%%22 filter=%22url(%23n)%22/></svg>')"></div>
  <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#1a1b1e_100%)]" aria-hidden="true"></div>

  <div class="container relative grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
    <div>
      <Eyebrow>{hero.eyebrow}</Eyebrow>
      <h1 class="font-display text-display mt-8 text-balance" data-hero-title data-split>
        {hero.title} <span class="gold-gradient-text">{hero.titleAccent}</span>
      </h1>
      <p class="text-lead mt-8 max-w-xl text-paper-muted" data-reveal>{hero.lead}</p>
      <div class="mt-10 flex flex-wrap gap-4" data-reveal>
        <Button href={hero.primary.href} magnetic>{hero.primary.label}</Button>
        <Button href={hero.secondary.href} variant="ghost">{hero.secondary.label}</Button>
      </div>
    </div>
    <div class="relative mx-auto w-full max-w-md lg:max-w-none" data-hero-image>
      <ImagePlaceholder id={hero.image.id} ratio={hero.image.ratio} label={hero.image.label} alt={hero.image.alt} parallax />
      <div class="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(189,172,137,0.25),transparent_60%)]" aria-hidden="true"></div>
    </div>
  </div>

  <a href="#vertrauen" class="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-paper-muted" data-hero-scroll>
    <span>Scrollen</span>
    <span class="relative block h-12 w-px overflow-hidden bg-anthracite-800"><span class="absolute inset-x-0 top-0 h-1/2 bg-gold-500" data-hero-scroll-bar></span></span>
  </a>
</section>
```

Hinweis: Falls SplitText den Gold-Verlauf im `<span class="gold-gradient-text">` zerlegt und der Verlauf pro Wort neu startet, in `reveals.ts` nach dem Split die Klasse `gold-gradient-text` vom Span entfernen und auf jedes Wort in diesem Span setzen (`self.words.filter((w) => w.closest('.gold-gradient-text'))`).

- [ ] **Step 2: TrustMarquee.astro**

```astro
---
import { site } from '@/content/site';
const { trust } = site;
const groups = [0, 1];
---
<section id="vertrauen" class="section--dark relative overflow-hidden border-y border-anthracite-800/70 py-10" data-motion="marquee" aria-label={trust.label}>
  <div class="container mb-6">
    <p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-paper-muted">{trust.label}</p>
  </div>
  <div class="flex w-max will-change-transform" data-marquee-track>
    {groups.map((g) => (
      <ul class="flex shrink-0 items-center gap-12 pr-12" data-marquee-group aria-hidden={g === 1 ? 'true' : undefined}>
        {trust.clients.map((c) => (
          <li class="flex items-center gap-12">
            <span class="font-display whitespace-nowrap text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-light text-sand-100/80">{c}</span>
            <span class="block h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true"></span>
          </li>
        ))}
      </ul>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Manifest.astro**

Hervorhebungen werden serverseitig in `<em>` gewickelt:

```astro
---
import { site } from '@/content/site';
const { manifest } = site;

function markup(text: string, highlights: string[]): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let out = escape(text);
  for (const h of highlights) {
    out = out.replace(escape(h), `<em>${escape(h)}</em>`);
  }
  return out;
}
const html = markup(manifest.text, manifest.highlights);
---
<section id="manifest" class="section section--dark" data-motion="manifest">
  <div class="container">
    <p class="font-display text-[clamp(1.75rem,1rem+3vw,3.75rem)] leading-[1.15] font-light text-paper-muted [&_em]:not-italic [&_em]:text-inherit max-w-6xl" data-manifest-text set:html={html} />
  </div>
</section>
```

- [ ] **Step 4: Services.astro**

```astro
---
import { site } from '@/content/site';
import SectionHeading from '@/components/ui/SectionHeading.astro';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.astro';
const { services } = site;
---
<section id="leistungen" class="section section--sand">
  <div class="container">
    <SectionHeading tone="sand" eyebrow={services.eyebrow} title={services.title} lead={services.lead} />
    <div class="mt-16 grid gap-6 md:grid-cols-2" data-motion="tilt">
      {services.items.map((item) => (
        <article class="group relative flex flex-col overflow-hidden rounded-3xl bg-sand-200 p-7 transition-shadow duration-500 hover:shadow-[0_40px_80px_-40px_rgba(26,27,30,0.35)] will-change-transform [transform-style:preserve-3d]" data-tilt-card data-reveal>
          <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" data-tilt-glow aria-hidden="true" style="background: radial-gradient(400px circle at var(--gx, 50%) var(--gy, 50%), rgba(189,172,137,0.28), transparent 60%)"></div>
          <div class="flex items-center justify-between">
            <span class="font-display text-h3 text-gold-700">{item.number}</span>
            <span class="h-px w-16 bg-gold-700/40" aria-hidden="true"></span>
          </div>
          <ImagePlaceholder id={item.image.id} ratio={item.image.ratio} label={item.image.label} alt={item.image.alt} tone="sand" class="mt-6" />
          <h3 class="font-display text-h3 mt-7">{item.title}</h3>
          <p class="mt-3 text-ink-muted">{item.text}</p>
          <ul class="mt-6 flex flex-wrap gap-2">
            {item.points.map((p) => <li class="rounded-full border border-anthracite-950/15 px-3 py-1 text-[0.8rem] font-medium">{p}</li>)}
          </ul>
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Process.astro**

```astro
---
import { site } from '@/content/site';
import SectionHeading from '@/components/ui/SectionHeading.astro';
const { process } = site;
---
<section id="prozess" class="section section--sand overflow-hidden border-t border-anthracite-950/10" data-motion="process">
  <div class="container">
    <SectionHeading tone="sand" eyebrow={process.eyebrow} title={process.title} />
    <div class="relative mt-6 h-px w-full bg-anthracite-950/10" aria-hidden="true">
      <div class="absolute inset-y-0 left-0 w-full origin-left scale-x-0 bg-gold-700" data-process-progress></div>
    </div>
  </div>
  <div class="mt-12 lg:mt-16">
    <ol class="container flex flex-col gap-6 lg:w-max lg:max-w-none lg:flex-row lg:gap-8 lg:pr-[20vw]" data-process-track>
      {process.steps.map((step) => (
        <li class="flex flex-col justify-between rounded-3xl border border-anthracite-950/10 bg-sand-50 p-8 lg:h-[26rem] lg:w-[24rem] lg:shrink-0" data-process-card data-reveal>
          <span class="font-display text-[4rem] leading-none font-light text-gold-700">{step.number}</span>
          <div>
            <h3 class="font-display text-h3">{step.title}</h3>
            <p class="mt-4 text-ink-muted">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  </div>
</section>
```

- [ ] **Step 6: index.astro erweitern**

Die ersten fünf Skelett-Sektionen ersetzen. Restliche Skelette bleiben bis Task 6:

```astro
---
import Base from '@/layouts/Base.astro';
import Nav from '@/components/layout/Nav.astro';
import Footer from '@/components/layout/Footer.astro';
import Hero from '@/components/sections/Hero.astro';
import TrustMarquee from '@/components/sections/TrustMarquee.astro';
import Manifest from '@/components/sections/Manifest.astro';
import Services from '@/components/sections/Services.astro';
import Process from '@/components/sections/Process.astro';
import { site } from '@/content/site';
const done = new Set(['hero', 'vertrauen', 'manifest', 'leistungen', 'prozess', 'footer']);
const skeleton = site.sections.filter((s) => !done.has(s.id));
---
<Base title={site.meta.title} description={site.meta.description}>
  <Nav />
  <main>
    <Hero />
    <TrustMarquee />
    <Manifest />
    <Services />
    <Process />
    {skeleton.map((s) => (
      <section id={s.id} class={`section ${s.tone === 'dark' ? 'section--dark' : 'section--sand'}`}>
        <div class="container"><p class="text-paper-muted">Sektion {s.id}</p></div>
      </section>
    ))}
  </main>
  <Footer />
</Base>
```

- [ ] **Step 7: Prüfen**

Run: `pnpm check && pnpm test:e2e`
Expected: PASS. Sichtprüfung im Browser: Hero füllt Viewport, Laufband statisch sichtbar, Manifest-Text lesbar, 4 Leistungskarten, Prozess-Karten auf Desktop in einer Reihe (überstehen rechts, ist gewollt bis Pinning kommt).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Sektionen Hero, Vertrauen, Manifest, Leistungen, Prozess

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Sektionen Referenzen, Zahlen, Preise, Branchen, FAQ, Kontakt

**Files:**
- Create: `src/components/sections/Work.astro`, `src/components/sections/Numbers.astro`, `src/components/sections/Pricing.astro`, `src/components/sections/Industries.astro`, `src/components/sections/Faq.astro`, `src/components/sections/Contact.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces Hooks:
  - Work: `data-motion="tilt"` auf Grid, Karten `[data-tilt-card]`, Bilder mit `parallax`.
  - Numbers: `data-motion="counters"`, Zahl `[data-counter][data-value][data-suffix]`.
  - Faq: `data-motion="accordion"`, Items `[data-accordion-item]`, Trigger `<button aria-expanded>`, Panel `[data-accordion-panel]`.
  - Contact: `data-motion="hero"` NICHT, eigener Canvas nicht nötig, statischer Gradient-Fleck. Formular `<form data-contact-form action="/api/contact" method="post">`, Erfolg `[data-contact-success]`, Fehler-Summary `[data-contact-error]`, Felder aus Spec 3.4, Honeypot `website`, Turnstile-Container `.cf-turnstile`.

- [ ] **Step 1: Work.astro**

```astro
---
import { site } from '@/content/site';
import SectionHeading from '@/components/ui/SectionHeading.astro';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.astro';
const { work } = site;
---
<section id="referenzen" class="section section--dark">
  <div class="container">
    <SectionHeading tone="dark" eyebrow={work.eyebrow} title={work.title} />
    <div class="mt-16 grid gap-8 md:grid-cols-2 md:gap-x-10" data-motion="tilt">
      {work.items.map((item, i) => (
        <article class={`group relative ${i % 2 === 1 ? 'md:translate-y-[120px]' : ''}`} data-tilt-card data-reveal>
          <div class="relative overflow-hidden rounded-3xl">
            <ImagePlaceholder id={item.image.id} ratio={item.image.ratio} label={item.image.label} alt={item.image.alt} parallax class="transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-[1.03]" />
            <span class="absolute right-5 top-5 grid h-11 w-11 -translate-y-2 place-items-center rounded-full bg-gold-500 text-anthracite-950 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">
              <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M6 4h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </div>
          <div class="mt-6 flex items-baseline justify-between gap-4">
            <h3 class="font-display text-h3">{item.client}</h3>
            <span class="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold-500">{item.industry}</span>
          </div>
          <p class="mt-2 text-paper-muted">{item.text}</p>
          <blockquote class="mt-4 border-l border-gold-500/40 pl-4 text-sm italic text-sand-100/70">{item.quote}</blockquote>
        </article>
      ))}
    </div>

    <div class="mt-32 grid gap-8 md:mt-44 md:grid-cols-3">
      {work.testimonials.map((t) => (
        <figure class="rounded-3xl border border-anthracite-800 bg-anthracite-900 p-8" data-reveal>
          <span class="font-display text-[3rem] leading-none text-gold-500" aria-hidden="true">„</span>
          <blockquote class="mt-2 text-sand-100/90">{t.quote}</blockquote>
          <figcaption class="mt-6 text-sm text-paper-muted">{t.author}, {t.company}</figcaption>
        </figure>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 2: Numbers.astro**

```astro
---
import { site } from '@/content/site';
const { numbers } = site;
---
<section id="zahlen" class="section--sand border-y border-anthracite-950/10 py-16" data-motion="counters">
  <div class="container grid grid-cols-2 gap-10 md:grid-cols-4">
    {numbers.items.map((n) => (
      <div data-reveal>
        <p class="font-display text-[clamp(2.5rem,1.5rem+3vw,4.5rem)] leading-none text-gold-700">
          <span data-counter data-value={n.value} data-suffix={n.suffix}>{n.value}{n.suffix}</span>
        </p>
        <p class="mt-3 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">{n.label}</p>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Pricing.astro**

```astro
---
import { site } from '@/content/site';
import SectionHeading from '@/components/ui/SectionHeading.astro';
import Button from '@/components/ui/Button.astro';
const { pricing } = site;
---
<section id="preise" class="section section--dark">
  <div class="container">
    <SectionHeading tone="dark" eyebrow={pricing.eyebrow} title={pricing.title} align="center" />
    <div class="mt-16 grid gap-6 lg:grid-cols-3">
      {pricing.plans.map((plan) => (
        <article class={`relative flex flex-col rounded-3xl p-8 ${plan.recommended ? 'bg-anthracite-900 ring-1 ring-gold-500 shadow-[0_40px_120px_-40px_rgba(189,172,137,0.35)]' : 'border border-anthracite-800 bg-anthracite-950'}`} data-reveal>
          {plan.recommended && <span class="absolute -top-3 left-8 rounded-full bg-gold-500 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-anthracite-950">Empfohlen</span>}
          <h3 class="font-display text-h3">{plan.name}</h3>
          <p class="mt-6 flex flex-wrap items-baseline gap-2">
            {plan.prefix && <span class="text-sm text-paper-muted">{plan.prefix}</span>}
            <span class="font-display text-[2.75rem] leading-none text-gold-500">{plan.price}</span>
          </p>
          {plan.period && <p class="mt-2 text-sm text-paper-muted">{plan.period}</p>}
          <p class="mt-5 text-sand-100/80">{plan.text}</p>
          <ul class="mt-6 flex flex-col gap-3 text-sm">
            {plan.features.map((f) => (
              <li class="flex gap-3">
                <svg class="mt-1 h-3.5 w-3.5 shrink-0 text-gold-500" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div class="mt-8 pt-2">
            <Button href="#kontakt" variant={plan.recommended ? 'gold' : 'ghost'} class="w-full">{plan.cta}</Button>
          </div>
        </article>
      ))}
    </div>
    <p class="mt-8 text-center text-sm text-paper-muted">{pricing.note}</p>
  </div>
</section>
```

- [ ] **Step 4: Industries.astro**

```astro
---
import { site } from '@/content/site';
import SectionHeading from '@/components/ui/SectionHeading.astro';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder.astro';
const { industries } = site;
---
<section id="branchen" class="section section--sand">
  <div class="container">
    <SectionHeading tone="sand" eyebrow={industries.eyebrow} title={industries.title} />
    <ul class="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {industries.items.map((item) => (
        <li class="group relative overflow-hidden rounded-3xl" data-reveal>
          <ImagePlaceholder id={item.image.id} ratio={item.image.ratio} label={item.image.label} alt={item.image.alt} tone="sand" class="transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-[1.04]" />
          <div class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-anthracite-950/90 via-anthracite-950/40 to-transparent p-6 text-sand-100 transition-colors duration-500 group-hover:from-anthracite-950/95">
            <h3 class="font-display text-h3">{item.title}</h3>
            <p class="mt-2 max-h-0 overflow-hidden text-sm text-sand-100/80 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100 group-focus-within:max-h-24 group-focus-within:opacity-100">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 5: Faq.astro**

```astro
---
import { site } from '@/content/site';
import SectionHeading from '@/components/ui/SectionHeading.astro';
const { faq } = site;
---
<section id="faq" class="section section--sand">
  <div class="container grid gap-12 lg:grid-cols-[1fr_1.5fr]">
    <SectionHeading tone="sand" eyebrow={faq.eyebrow} title={faq.title} />
    <div class="divide-y divide-anthracite-950/10 border-y border-anthracite-950/10" data-motion="accordion">
      {faq.items.map((item, i) => (
        <div data-accordion-item data-reveal>
          <h3>
            <button type="button" class="flex w-full items-center justify-between gap-6 py-6 text-left" aria-expanded={i === 0 ? 'true' : 'false'} aria-controls={`faq-panel-${i}`} id={`faq-trigger-${i}`}>
              <span class="font-display text-[1.35rem] leading-tight">{item.question}</span>
              <span class="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold-700/50 text-gold-700" aria-hidden="true">
                <span class="absolute h-px w-3.5 bg-current"></span>
                <span class="absolute h-3.5 w-px bg-current transition-transform duration-500" data-accordion-icon></span>
              </span>
            </button>
          </h3>
          <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-trigger-${i}`} class="overflow-hidden" data-accordion-panel hidden={i === 0 ? undefined : true}>
            <p class="pb-6 text-ink-muted">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 6: Contact.astro**

```astro
---
import { site } from '@/content/site';
import Eyebrow from '@/components/ui/Eyebrow.astro';
import Input from '@/components/ui/Input.astro';
const { contact, meta } = site;
const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
---
<section id="kontakt" class="section section--dark relative overflow-hidden">
  <div class="pointer-events-none absolute -left-40 top-1/2 h-[60rem] w-[60rem] -translate-y-1/2 rounded-full opacity-40 [filter:blur(120px)]" aria-hidden="true" style="background: radial-gradient(circle, rgba(189,172,137,0.55), rgba(122,106,76,0.2) 45%, transparent 70%)"></div>
  <div class="container relative grid gap-14 lg:grid-cols-[1fr_1.1fr]">
    <div>
      <Eyebrow>{contact.eyebrow}</Eyebrow>
      <h2 class="font-display text-h2 mt-5 text-balance" data-split>{contact.title}</h2>
      <p class="text-lead mt-6 text-paper-muted" data-reveal>{contact.text}</p>
      <dl class="mt-10 flex flex-col gap-4 text-sand-100/80" data-reveal>
        <div><dt class="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold-500">E-Mail</dt><dd><a href={`mailto:${meta.email}`} class="hover:text-gold-300">{meta.email}</a></dd></div>
        <div><dt class="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-gold-500">Standort</dt><dd>{meta.city}</dd></div>
      </dl>
    </div>

    <div class="relative rounded-3xl bg-sand-100 p-6 text-anthracite-950 md:p-10 [color-scheme:light]" data-reveal>
      <form class="grid gap-5" action="/api/contact" method="post" novalidate data-contact-form>
        <div class="grid gap-5 md:grid-cols-2">
          <Input name="name" label="Name" required autocomplete="name" />
          <Input name="email" label="E-Mail" type="email" required autocomplete="email" />
        </div>
        <div class="grid gap-5 md:grid-cols-2">
          <Input name="phone" label="Telefon" type="tel" autocomplete="tel" />
          <Input name="projectType" label="Projektart" type="select" required options={contact.projectTypes} />
        </div>
        <Input name="budget" label="Budget" type="select" required options={contact.budgets} />
        <Input name="message" label="Nachricht" type="textarea" required placeholder="Worum geht es, was ist dein Ziel, bis wann soll es fertig sein?" />

        <div class="hidden" aria-hidden="true">
          <label for="field-website">Website</label>
          <input id="field-website" name="website" type="text" tabindex="-1" autocomplete="off" />
        </div>

        <label class="flex items-start gap-3 text-sm text-ink-muted">
          <input type="checkbox" name="consent" value="on" required class="mt-1 h-4 w-4 accent-gold-700" />
          <span>Ich habe die <a href="/datenschutz" class="underline decoration-gold-700/50 underline-offset-2 hover:text-anthracite-950">Datenschutzerklärung</a> gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage einverstanden. *</span>
        </label>
        <p class="min-h-[1.25rem] text-[0.8rem] text-red-700" data-error-for="consent" aria-live="polite"></p>

        {siteKey && <div class="cf-turnstile" data-sitekey={siteKey} data-theme="light" data-size="flexible"></div>}

        <p class="hidden rounded-xl border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert" data-contact-error></p>

        <button type="submit" class="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-7 py-4 font-semibold text-anthracite-950 transition-[background-color,transform] duration-500 hover:bg-gold-300 disabled:opacity-60" data-magnetic>
          <span data-submit-label>Anfrage senden</span>
          <svg class="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </form>

      <div class="absolute inset-0 grid place-items-center rounded-3xl bg-sand-100 p-10 text-center" hidden data-contact-success>
        <div>
          <svg class="mx-auto h-16 w-16 text-gold-700" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="1.5" data-success-circle />
            <path d="M20 33l8 8 16-18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-success-check />
          </svg>
          <h3 class="font-display text-h3 mt-6">{contact.success.title}</h3>
          <p class="mt-3 text-ink-muted">{contact.success.text}</p>
        </div>
      </div>
    </div>
  </div>
  {siteKey && <script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>}
</section>
```

- [ ] **Step 7: index.astro finalisieren**

```astro
---
import Base from '@/layouts/Base.astro';
import Nav from '@/components/layout/Nav.astro';
import Footer from '@/components/layout/Footer.astro';
import Hero from '@/components/sections/Hero.astro';
import TrustMarquee from '@/components/sections/TrustMarquee.astro';
import Manifest from '@/components/sections/Manifest.astro';
import Services from '@/components/sections/Services.astro';
import Process from '@/components/sections/Process.astro';
import Work from '@/components/sections/Work.astro';
import Numbers from '@/components/sections/Numbers.astro';
import Pricing from '@/components/sections/Pricing.astro';
import Industries from '@/components/sections/Industries.astro';
import Faq from '@/components/sections/Faq.astro';
import Contact from '@/components/sections/Contact.astro';
import { site } from '@/content/site';
---
<Base title={site.meta.title} description={site.meta.description}>
  <Nav />
  <main>
    <Hero />
    <TrustMarquee />
    <Manifest />
    <Services />
    <Process />
    <Work />
    <Numbers />
    <Pricing />
    <Industries />
    <Faq />
    <Contact />
  </main>
  <Footer />
</Base>
```

- [ ] **Step 8: E2E ergänzen und prüfen**

In `tests/e2e/home.spec.ts` Test ergänzen:
```ts
  test('FAQ öffnet zweiten Eintrag', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('#faq-trigger-1');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#faq-panel-1')).toBeVisible();
  });
```
Dieser Test schlägt bis Task 11 (Accordion-Skript) fehl. Mit `test.fixme()` markieren und in Task 11 aktivieren:
```ts
  test.fixme('FAQ öffnet zweiten Eintrag', async ({ page }) => {
```

Run: `pnpm check && pnpm test && pnpm test:e2e`
Expected: PASS (fixme wird übersprungen). Sichtprüfung: alle Sektionen, Formular auf Sand-Karte, Turnstile-Widget sichtbar wenn `.env` aus `.env.example` kopiert wurde (`cp .env.example .env`).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: Sektionen Referenzen, Zahlen, Preise, Branchen, FAQ, Kontakt

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Kontakt-Schema (TDD)

**Files:**
- Create: `src/lib/contact-schema.ts`, `tests/unit/contact-schema.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const PROJECT_TYPES = ['website','redesign','shop','performance','betreuung','sonstiges'] as const;
  export const BUDGETS = ['bis-5k','5k-10k','10k-25k','ueber-25k','abo','offen'] as const;
  export type ContactInput = { name: string; email: string; phone?: string; projectType: typeof PROJECT_TYPES[number]; budget: typeof BUDGETS[number]; message: string; consent: true; turnstileToken?: string };
  export type ParseResult = { ok: true; data: ContactInput; honeypot: false } | { ok: true; data: null; honeypot: true } | { ok: false; fieldErrors: Record<string, string> };
  export function parseContactInput(raw: Record<string, unknown>): ParseResult;
  export function formDataToObject(fd: FormData): Record<string, unknown>;
  ```

- [ ] **Step 1: Tests schreiben**

`tests/unit/contact-schema.test.ts`:
```ts
import { parseContactInput, formDataToObject } from '@/lib/contact-schema';

const valid = {
  name: 'Maria Muster',
  email: 'maria@example.com',
  phone: '+49 221 123456',
  projectType: 'website',
  budget: '5k-10k',
  message: 'Wir brauchen eine neue Website für unser Handwerksunternehmen.',
  consent: 'on',
  'cf-turnstile-response': 'token-123',
  website: '',
};

describe('parseContactInput', () => {
  it('accepts valid input and normalizes it', () => {
    const r = parseContactInput(valid);
    expect(r.ok).toBe(true);
    if (r.ok && !r.honeypot) {
      expect(r.data.name).toBe('Maria Muster');
      expect(r.data.consent).toBe(true);
      expect(r.data.turnstileToken).toBe('token-123');
      expect(r.data.phone).toBe('+49 221 123456');
    }
  });

  it('accepts boolean consent from JSON clients', () => {
    const r = parseContactInput({ ...valid, consent: true });
    expect(r.ok).toBe(true);
  });

  it('treats empty phone as undefined', () => {
    const r = parseContactInput({ ...valid, phone: '' });
    expect(r.ok && !r.honeypot && r.data.phone).toBeUndefined();
  });

  it('flags honeypot without field errors', () => {
    const r = parseContactInput({ ...valid, website: 'http://spam.example' });
    expect(r).toEqual({ ok: true, data: null, honeypot: true });
  });

  it.each([
    ['name', 'M', 'name'],
    ['name', 'x'.repeat(101), 'name'],
    ['email', 'keine-mail', 'email'],
    ['phone', 'abc', 'phone'],
    ['projectType', 'raumschiff', 'projectType'],
    ['budget', 'unendlich', 'budget'],
    ['message', 'zu kurz', 'message'],
    ['message', 'x'.repeat(3001), 'message'],
    ['consent', 'off', 'consent'],
    ['consent', false, 'consent'],
  ])('rejects invalid %s = %j', (field, value, errorKey) => {
    const r = parseContactInput({ ...valid, [field]: value });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fieldErrors)).toContain(errorKey);
  });

  it('reports missing required fields', () => {
    const r = parseContactInput({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.fieldErrors).sort()).toEqual(['budget', 'consent', 'email', 'message', 'name', 'projectType']);
    }
  });

  it('returns German error messages', () => {
    const r = parseContactInput({ ...valid, email: 'nope' });
    if (!r.ok) expect(r.fieldErrors.email).toBe('Bitte gib eine gültige E-Mail-Adresse ein.');
  });
});

describe('formDataToObject', () => {
  it('converts FormData to plain object', () => {
    const fd = new FormData();
    fd.set('name', 'A');
    fd.set('consent', 'on');
    expect(formDataToObject(fd)).toEqual({ name: 'A', consent: 'on' });
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `pnpm test tests/unit/contact-schema.test.ts`
Expected: FAIL, Modul fehlt.

- [ ] **Step 3: Schema implementieren**

`src/lib/contact-schema.ts`:
```ts
import { z } from 'zod';

export const PROJECT_TYPES = ['website', 'redesign', 'shop', 'performance', 'betreuung', 'sonstiges'] as const;
export const BUDGETS = ['bis-5k', '5k-10k', '10k-25k', 'ueber-25k', 'abo', 'offen'] as const;

const MESSAGES = {
  name: 'Bitte gib deinen Namen ein (2 bis 100 Zeichen).',
  email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  phone: 'Bitte gib eine gültige Telefonnummer ein.',
  projectType: 'Bitte wähle eine Projektart.',
  budget: 'Bitte wähle einen Budgetrahmen.',
  message: 'Bitte beschreibe dein Projekt (20 bis 3000 Zeichen).',
  consent: 'Bitte bestätige die Datenschutzerklärung.',
} as const;

const trimmed = z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string());
const optionalTrimmed = z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : typeof v === 'string' ? v.trim() : v), z.string().optional());

const schema = z.object({
  name: trimmed.pipe(z.string().min(2, MESSAGES.name).max(100, MESSAGES.name)),
  email: trimmed.pipe(z.email(MESSAGES.email).max(200, MESSAGES.email)),
  phone: optionalTrimmed.pipe(z.string().min(6, MESSAGES.phone).max(30, MESSAGES.phone).regex(/^[0-9+\-/ ()]+$/, MESSAGES.phone).optional()),
  projectType: z.enum(PROJECT_TYPES, { error: MESSAGES.projectType }),
  budget: z.enum(BUDGETS, { error: MESSAGES.budget }),
  message: trimmed.pipe(z.string().min(20, MESSAGES.message).max(3000, MESSAGES.message)),
  consent: z.preprocess((v) => v === true || v === 'on' || v === 'true', z.literal(true, { error: MESSAGES.consent })),
  turnstileToken: z.string().optional(),
});

export type ContactInput = z.infer<typeof schema>;

export type ParseResult =
  | { ok: true; data: ContactInput; honeypot: false }
  | { ok: true; data: null; honeypot: true }
  | { ok: false; fieldErrors: Record<string, string> };

export function formDataToObject(fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  fd.forEach((value, key) => {
    if (typeof value === 'string') out[key] = value;
  });
  return out;
}

export function parseContactInput(raw: Record<string, unknown>): ParseResult {
  const honeypot = raw.website;
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return { ok: true, data: null, honeypot: true };
  }

  const candidate = {
    ...raw,
    turnstileToken: raw.turnstileToken ?? raw['cf-turnstile-response'],
  };

  const result = schema.safeParse(candidate);
  if (result.success) {
    return { ok: true, data: result.data, honeypot: false };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!fieldErrors[key]) {
      fieldErrors[key] = MESSAGES[key as keyof typeof MESSAGES] ?? issue.message;
    }
  }
  return { ok: false, fieldErrors };
}
```

- [ ] **Step 4: Tests laufen lassen**

Run: `pnpm test tests/unit/contact-schema.test.ts`
Expected: alle PASS. Falls `z.email` in der installierten Zod-Version fehlt, `z.string().email(MESSAGES.email)` verwenden.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Zod-Schema für Kontaktanfragen

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Mail-Builder, Turnstile, Rate-Limit (TDD)

**Files:**
- Create: `src/lib/mail.ts`, `src/lib/turnstile.ts`, `src/lib/rate-limit.ts`, `tests/unit/mail.test.ts`, `tests/unit/rate-limit.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // mail.ts
  export interface MailEnv { RESEND_API_KEY?: string; RESEND_FROM?: string; CONTACT_TO?: string }
  export interface MailPayload { from: string; to: string[]; replyTo?: string; subject: string; html: string; text: string }
  export function buildContactEmails(data: ContactInput, env: MailEnv): { toOwner: MailPayload; toSender: MailPayload };
  export async function sendContactEmails(data: ContactInput, env: MailEnv): Promise<{ sent: boolean; dryRun: boolean }>;
  // turnstile.ts
  export async function verifyTurnstile(token: string | undefined, secret: string | undefined, ip?: string): Promise<{ ok: boolean; skipped: boolean }>;
  // rate-limit.ts
  export function checkRateLimit(key: string, opts?: { limit?: number; windowMs?: number; now?: number }): { allowed: boolean; remaining: number };
  export function resetRateLimit(): void;
  ```

- [ ] **Step 1: Tests schreiben**

`tests/unit/mail.test.ts`:
```ts
import { buildContactEmails } from '@/lib/mail';
import type { ContactInput } from '@/lib/contact-schema';

const data: ContactInput = {
  name: 'Maria <Muster>',
  email: 'maria@example.com',
  phone: '+49 221 123456',
  projectType: 'redesign',
  budget: '10k-25k',
  message: 'Zeile eins.\nZeile zwei mit <b>HTML</b>.',
  consent: true,
  turnstileToken: 'x',
};
const env = { RESEND_FROM: 'setify <hallo@setify.de>', CONTACT_TO: 'mail@setify.de' };

describe('buildContactEmails', () => {
  it('addresses owner mail with reply-to sender', () => {
    const { toOwner } = buildContactEmails(data, env);
    expect(toOwner.to).toEqual(['mail@setify.de']);
    expect(toOwner.from).toBe('setify <hallo@setify.de>');
    expect(toOwner.replyTo).toBe('maria@example.com');
    expect(toOwner.subject).toBe('Neue Anfrage: Redesign bestehender Seite, Maria <Muster>');
  });

  it('includes all fields with labels in owner mail', () => {
    const { toOwner } = buildContactEmails(data, env);
    for (const s of ['Maria &lt;Muster&gt;', 'maria@example.com', '+49 221 123456', 'Redesign bestehender Seite', '10.000 bis 25.000 €', 'Zeile eins.<br>Zeile zwei mit &lt;b&gt;HTML&lt;/b&gt;.']) {
      expect(toOwner.html).toContain(s);
    }
    expect(toOwner.text).toContain('Telefon: +49 221 123456');
  });

  it('writes brand lowercase and no em dashes', () => {
    const { toOwner, toSender } = buildContactEmails(data, env);
    for (const m of [toOwner, toSender]) {
      expect(m.html + m.text + m.subject).not.toMatch(/Setify|—/);
    }
  });

  it('sends confirmation to sender without reply-to', () => {
    const { toSender } = buildContactEmails(data, env);
    expect(toSender.to).toEqual(['maria@example.com']);
    expect(toSender.replyTo).toBeUndefined();
    expect(toSender.subject).toBe('Deine Anfrage bei setify');
    expect(toSender.text).toContain('innerhalb eines Werktags');
  });

  it('falls back to defaults when env is empty', () => {
    const { toOwner } = buildContactEmails(data, {});
    expect(toOwner.to).toEqual(['mail@setify.de']);
    expect(toOwner.from).toBe('setify <onboarding@resend.dev>');
  });

  it('omits phone line when phone missing', () => {
    const { toOwner } = buildContactEmails({ ...data, phone: undefined }, env);
    expect(toOwner.text).not.toContain('Telefon:');
  });
});
```

`tests/unit/rate-limit.test.ts`:
```ts
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

beforeEach(() => resetRateLimit());

describe('checkRateLimit', () => {
  it('allows up to limit within window', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 1000, now: 0 }).allowed).toBe(true);
    }
    expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 1000, now: 10 }).allowed).toBe(false);
  });

  it('resets after window', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('k', { limit: 5, windowMs: 1000, now: 0 });
    expect(checkRateLimit('k', { limit: 5, windowMs: 1000, now: 1001 }).allowed).toBe(true);
  });

  it('tracks keys independently', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('a', { limit: 5, windowMs: 1000, now: 0 });
    expect(checkRateLimit('b', { limit: 5, windowMs: 1000, now: 0 }).allowed).toBe(true);
  });

  it('reports remaining', () => {
    expect(checkRateLimit('r', { limit: 3, windowMs: 1000, now: 0 }).remaining).toBe(2);
  });
});
```

- [ ] **Step 2: Tests laufen lassen, müssen fehlschlagen**

Run: `pnpm test`
Expected: FAIL, Module fehlen.

- [ ] **Step 3: mail.ts**

```ts
import { Resend } from 'resend';
import type { ContactInput } from './contact-schema';

export interface MailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  CONTACT_TO?: string;
}

export interface MailPayload {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

const PROJECT_LABELS: Record<ContactInput['projectType'], string> = {
  website: 'Neue Website',
  redesign: 'Redesign bestehender Seite',
  shop: 'Shop oder Portal',
  performance: 'Performance und SEO',
  betreuung: 'Betreuung und Wartung',
  sonstiges: 'Sonstiges',
};

const BUDGET_LABELS: Record<ContactInput['budget'], string> = {
  'bis-5k': 'bis 5.000 €',
  '5k-10k': '5.000 bis 10.000 €',
  '10k-25k': '10.000 bis 25.000 €',
  'ueber-25k': 'über 25.000 €',
  abo: 'Website Abo',
  offen: 'Noch offen',
};

const DEFAULT_FROM = 'setify <onboarding@resend.dev>';
const DEFAULT_TO = 'mail@setify.de';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f3eee4;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#1a1b1e">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fbf9f4;border-radius:16px;overflow:hidden">
<tr><td style="height:4px;background:linear-gradient(90deg,#7a6a4c,#bdac89,#e3d6b8)"></td></tr>
<tr><td style="padding:32px">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7a6a4c;font-weight:700">setify</p>
<h1 style="margin:0 0 24px;font-family:Georgia,serif;font-weight:400;font-size:26px;line-height:1.2">${title}</h1>
${body}
<p style="margin:32px 0 0;font-size:12px;color:#6b665c">setify, Philipp Walter, Linder Weg 16a, 51147 Köln, mail@setify.de</p>
</td></tr></table></td></tr></table></body></html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6b665c;vertical-align:top;width:140px">${label}</td><td style="padding:8px 0;font-size:15px;line-height:1.5">${value}</td></tr>`;
}

export function buildContactEmails(data: ContactInput, env: MailEnv): { toOwner: MailPayload; toSender: MailPayload } {
  const from = env.RESEND_FROM || DEFAULT_FROM;
  const to = env.CONTACT_TO || DEFAULT_TO;
  const project = PROJECT_LABELS[data.projectType];
  const budget = BUDGET_LABELS[data.budget];

  const ownerRows = [
    row('Name', escapeHtml(data.name)),
    row('E-Mail', `<a href="mailto:${escapeHtml(data.email)}" style="color:#7a6a4c">${escapeHtml(data.email)}</a>`),
    data.phone ? row('Telefon', escapeHtml(data.phone)) : '',
    row('Projektart', escapeHtml(project)),
    row('Budget', escapeHtml(budget)),
    row('Nachricht', nl2br(data.message)),
  ].join('');

  const ownerText = [
    `Neue Anfrage über setify.de`,
    ``,
    `Name: ${data.name}`,
    `E-Mail: ${data.email}`,
    data.phone ? `Telefon: ${data.phone}` : null,
    `Projektart: ${project}`,
    `Budget: ${budget}`,
    ``,
    `Nachricht:`,
    data.message,
  ].filter((l) => l !== null).join('\n');

  const toOwner: MailPayload = {
    from,
    to: [to],
    replyTo: data.email,
    subject: `Neue Anfrage: ${project}, ${data.name}`,
    html: layout('Neue Anfrage über setify.de', `<table role="presentation" cellspacing="0" cellpadding="0" width="100%">${ownerRows}</table>`),
    text: ownerText,
  };

  const senderBody = `<p style="font-size:15px;line-height:1.6;margin:0 0 16px">Hallo ${escapeHtml(data.name)},</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 16px">danke für deine Anfrage. Sie ist bei uns angekommen. Wir melden uns innerhalb eines Werktags persönlich bei dir.</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 16px">Zur Erinnerung, das hast du uns geschrieben:</p>
<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:2px solid #bdac89;background:#f3eee4;font-size:14px;line-height:1.6">${nl2br(data.message)}</blockquote>
<p style="font-size:15px;line-height:1.6;margin:0">Bis bald,<br>Philipp von setify</p>`;

  const toSender: MailPayload = {
    from,
    to: [data.email],
    subject: 'Deine Anfrage bei setify',
    html: layout('Deine Anfrage ist angekommen.', senderBody),
    text: `Hallo ${data.name},\n\ndanke für deine Anfrage. Sie ist bei uns angekommen. Wir melden uns innerhalb eines Werktags persönlich bei dir.\n\nDas hast du uns geschrieben:\n${data.message}\n\nBis bald,\nPhilipp von setify\n\nsetify, Philipp Walter, Linder Weg 16a, 51147 Köln, mail@setify.de`,
  };

  return { toOwner, toSender };
}

export async function sendContactEmails(data: ContactInput, env: MailEnv): Promise<{ sent: boolean; dryRun: boolean }> {
  const { toOwner, toSender } = buildContactEmails(data, env);

  if (!env.RESEND_API_KEY) {
    console.info('[contact] RESEND_API_KEY fehlt, Dry-Run. Owner-Mail:', toOwner.subject, 'an', toOwner.to.join(','));
    return { sent: false, dryRun: true };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const owner = await resend.emails.send({ from: toOwner.from, to: toOwner.to, replyTo: toOwner.replyTo, subject: toOwner.subject, html: toOwner.html, text: toOwner.text });
  if (owner.error) {
    throw new Error(`Resend owner mail failed: ${owner.error.message}`);
  }
  const sender = await resend.emails.send({ from: toSender.from, to: toSender.to, subject: toSender.subject, html: toSender.html, text: toSender.text });
  if (sender.error) {
    console.warn('[contact] Bestätigungsmail fehlgeschlagen:', sender.error.message);
  }
  return { sent: true, dryRun: false };
}
```

- [ ] **Step 4: turnstile.ts**

```ts
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string | undefined, secret: string | undefined, ip?: string): Promise<{ ok: boolean; skipped: boolean }> {
  if (!secret) {
    return { ok: true, skipped: true };
  }
  if (!token) {
    return { ok: false, skipped: false };
  }
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body });
    const json = (await res.json()) as { success?: boolean };
    return { ok: json.success === true, skipped: false };
  } catch (err) {
    console.error('[turnstile] verify failed', err);
    return { ok: false, skipped: false };
  }
}
```

- [ ] **Step 5: rate-limit.ts**

```ts
interface Bucket { count: number; resetAt: number }

const buckets = new Map<string, Bucket>();

export function resetRateLimit(): void {
  buckets.clear();
}

export function checkRateLimit(key: string, opts: { limit?: number; windowMs?: number; now?: number } = {}): { allowed: boolean; remaining: number } {
  const limit = opts.limit ?? 5;
  const windowMs = opts.windowMs ?? 10 * 60 * 1000;
  const now = opts.now ?? Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
```

- [ ] **Step 6: Tests laufen lassen**

Run: `pnpm test`
Expected: alle PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Mail-Builder mit Resend, Turnstile-Check, Rate-Limit

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: API-Route und Formular-Frontend

**Files:**
- Create: `src/pages/api/contact.ts`, `src/scripts/contact-form.ts`, `tests/e2e/contact.spec.ts`
- Modify: `src/components/sections/Contact.astro` (Script einbinden)

**Interfaces:**
- Consumes: `parseContactInput`, `formDataToObject`, `sendContactEmails`, `verifyTurnstile`, `checkRateLimit`.
- Produces: `POST /api/contact` antwortet JSON `{ ok: true }` oder `{ ok: false, fieldErrors?: Record<string,string>, message?: string }`. Bei klassischem Form-POST (Accept ohne `application/json`) Redirect 303 auf `/?sent=1#kontakt` bzw. `/?error=1#kontakt`.

- [ ] **Step 1: E2E-Test schreiben**

`tests/e2e/contact.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test.describe('Kontaktformular', () => {
  test('zeigt Feldfehler bei leerem Absenden', async ({ page }) => {
    await page.goto('/#kontakt');
    await page.getByRole('button', { name: 'Anfrage senden' }).click();
    await expect(page.locator('[data-error-for="name"]')).toHaveText(/Namen/);
    await expect(page.locator('[data-error-for="email"]')).toHaveText(/E-Mail/);
  });

  test('sendet gültige Anfrage und zeigt Erfolg', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      const body = route.request().postDataJSON();
      expect(body.name).toBe('Maria Muster');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });
    await page.goto('/#kontakt');
    await page.fill('#field-name', 'Maria Muster');
    await page.fill('#field-email', 'maria@example.com');
    await page.selectOption('#field-projectType', 'website');
    await page.selectOption('#field-budget', '5k-10k');
    await page.fill('#field-message', 'Wir brauchen eine neue Website für unser Unternehmen in Köln.');
    await page.check('input[name="consent"]');
    await page.getByRole('button', { name: 'Anfrage senden' }).click();
    await expect(page.locator('[data-contact-success]')).toBeVisible();
    await expect(page.locator('[data-contact-success]')).toContainText('Danke, deine Anfrage ist da.');
  });

  test('zeigt Serverfehler', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false, message: 'Versand fehlgeschlagen.' }) }),
    );
    await page.goto('/#kontakt');
    await page.fill('#field-name', 'Maria Muster');
    await page.fill('#field-email', 'maria@example.com');
    await page.selectOption('#field-projectType', 'website');
    await page.selectOption('#field-budget', '5k-10k');
    await page.fill('#field-message', 'Wir brauchen eine neue Website für unser Unternehmen in Köln.');
    await page.check('input[name="consent"]');
    await page.getByRole('button', { name: 'Anfrage senden' }).click();
    await expect(page.locator('[data-contact-error]')).toBeVisible();
    await expect(page.locator('[data-contact-error]')).toContainText('Versand fehlgeschlagen.');
  });

  test('API lehnt ungültige Daten mit 400 ab', async ({ request }) => {
    const res = await request.post('/api/contact', { data: { name: 'x' }, headers: { accept: 'application/json' } });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.fieldErrors.email).toBeTruthy();
  });

  test('API akzeptiert gültige Daten im Dry-Run', async ({ request }) => {
    const res = await request.post('/api/contact', {
      headers: { accept: 'application/json' },
      data: {
        name: 'Maria Muster',
        email: 'maria@example.com',
        projectType: 'website',
        budget: '5k-10k',
        message: 'Wir brauchen eine neue Website für unser Unternehmen in Köln.',
        consent: true,
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
      },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true, dryRun: true });
  });
});
```

Hinweis: Der Dry-Run-Test setzt voraus, dass lokal kein `RESEND_API_KEY` gesetzt ist und `TURNSTILE_SECRET_KEY` entweder leer oder der Cloudflare-Testkey `1x0000000000000000000000000000000AA` ist (akzeptiert jedes Token).

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `pnpm test:e2e tests/e2e/contact.spec.ts`
Expected: FAIL, 404 auf `/api/contact`, keine Feldfehler.

- [ ] **Step 3: API-Route**

`src/pages/api/contact.ts`:
```ts
export const prerender = false;

import type { APIRoute } from 'astro';
import { parseContactInput, formDataToObject } from '@/lib/contact-schema';
import { sendContactEmails } from '@/lib/mail';
import { verifyTurnstile } from '@/lib/turnstile';
import { checkRateLimit } from '@/lib/rate-limit';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

function wantsJson(request: Request): boolean {
  const accept = request.headers.get('accept') ?? '';
  const type = request.headers.get('content-type') ?? '';
  return accept.includes('application/json') || type.includes('application/json');
}

function redirect(path: string): Response {
  return new Response(null, { status: 303, headers: { location: path } });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const asJson = wantsJson(request);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'unknown';

  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return asJson ? json({ ok: false, message: 'Zu viele Anfragen. Bitte versuche es in ein paar Minuten erneut.' }, 429) : redirect('/?error=rate#kontakt');
  }

  let raw: Record<string, unknown>;
  try {
    const type = request.headers.get('content-type') ?? '';
    raw = type.includes('application/json') ? ((await request.json()) as Record<string, unknown>) : formDataToObject(await request.formData());
  } catch {
    return asJson ? json({ ok: false, message: 'Ungültige Anfrage.' }, 400) : redirect('/?error=1#kontakt');
  }

  const parsed = parseContactInput(raw);
  if (!parsed.ok) {
    return asJson ? json({ ok: false, fieldErrors: parsed.fieldErrors }, 400) : redirect('/?error=1#kontakt');
  }
  if (parsed.honeypot) {
    return asJson ? json({ ok: true }) : redirect('/?sent=1#kontakt');
  }

  const env = {
    RESEND_API_KEY: import.meta.env.RESEND_API_KEY,
    RESEND_FROM: import.meta.env.RESEND_FROM,
    CONTACT_TO: import.meta.env.CONTACT_TO,
  };

  const turnstile = await verifyTurnstile(parsed.data.turnstileToken, import.meta.env.TURNSTILE_SECRET_KEY, ip);
  if (!turnstile.ok) {
    return asJson ? json({ ok: false, message: 'Die Spam-Prüfung ist fehlgeschlagen. Bitte lade die Seite neu und versuche es erneut.' }, 400) : redirect('/?error=1#kontakt');
  }

  try {
    const result = await sendContactEmails(parsed.data, env);
    return asJson ? json({ ok: true, dryRun: result.dryRun }) : redirect('/?sent=1#kontakt');
  } catch (err) {
    console.error('[contact] send failed', err);
    return asJson ? json({ ok: false, message: 'Versand fehlgeschlagen. Bitte schreib uns direkt an mail@setify.de.' }, 502) : redirect('/?error=1#kontakt');
  }
};
```

- [ ] **Step 4: Frontend-Skript**

`src/scripts/contact-form.ts`:
```ts
import { parseContactInput } from '@/lib/contact-schema';

type ApiResponse = { ok: true; dryRun?: boolean } | { ok: false; fieldErrors?: Record<string, string>; message?: string };

function showErrors(form: HTMLFormElement, errors: Record<string, string>): void {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
    const name = el.dataset.errorFor!;
    el.textContent = errors[name] ?? '';
    const field = form.elements.namedItem(name) as HTMLElement | RadioNodeList | null;
    if (field && 'setAttribute' in field) {
      field.setAttribute('aria-invalid', errors[name] ? 'true' : 'false');
    }
  });
  const first = Object.keys(errors)[0];
  if (first) {
    const el = form.elements.namedItem(first) as HTMLElement | null;
    el?.focus?.();
  }
}

function setBanner(form: HTMLFormElement, message: string | null): void {
  const banner = form.querySelector<HTMLElement>('[data-contact-error]');
  if (!banner) return;
  banner.textContent = message ?? '';
  banner.classList.toggle('hidden', !message);
}

function showSuccess(root: HTMLElement): void {
  const success = root.querySelector<HTMLElement>('[data-contact-success]');
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!success || !form) return;
  form.setAttribute('aria-hidden', 'true');
  form.style.visibility = 'hidden';
  success.hidden = false;
  success.classList.add('is-visible');
  success.focus?.();
}

export function initContactForm(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return () => {};

  const params = new URLSearchParams(location.search);
  if (params.get('sent') === '1') showSuccess(root);
  if (params.get('error')) setBanner(form, 'Da ist etwas schiefgelaufen. Bitte prüfe deine Angaben oder schreib uns direkt an mail@setify.de.');

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setBanner(form, null);

    const fd = new FormData(form);
    const raw: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (typeof v === 'string') raw[k] = v; });

    const parsed = parseContactInput(raw);
    if (!parsed.ok) {
      showErrors(form, parsed.fieldErrors);
      return;
    }
    showErrors(form, {});

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const label = form.querySelector<HTMLElement>('[data-submit-label]');
    const original = label?.textContent ?? '';
    if (button) button.disabled = true;
    if (label) label.textContent = 'Wird gesendet';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ ...raw, turnstileToken: raw['cf-turnstile-response'] }),
      });
      const data = (await res.json()) as ApiResponse;
      if (data.ok) {
        showSuccess(root);
        return;
      }
      if (data.fieldErrors) showErrors(form, data.fieldErrors);
      setBanner(form, data.message ?? 'Bitte prüfe deine Angaben.');
    } catch {
      setBanner(form, 'Keine Verbindung. Bitte versuche es erneut oder schreib uns an mail@setify.de.');
    } finally {
      if (button) button.disabled = false;
      if (label) label.textContent = original;
    }
  };

  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}
```

- [ ] **Step 5: Skript in Contact.astro einbinden**

Am Ende von `Contact.astro` vor dem Turnstile-Script ergänzen:
```astro
<script>
  import { initContactForm } from '@/scripts/contact-form';
  let cleanup: (() => void) | undefined;
  const setup = () => {
    cleanup?.();
    const root = document.getElementById('kontakt');
    cleanup = root ? initContactForm(root) : undefined;
  };
  document.addEventListener('astro:page-load', setup);
  document.addEventListener('astro:before-swap', () => cleanup?.());
</script>
```

Hinweis zum Turnstile-Widget: Cloudflare schreibt das Token in ein verstecktes Input `cf-turnstile-response` innerhalb `.cf-turnstile`, das liegt im Formular und landet dadurch in `FormData`.

- [ ] **Step 6: Tests laufen lassen**

Run: `pnpm check && pnpm test && pnpm test:e2e`
Expected: alle PASS. Bei `pnpm dev` muss kein `.env` vorhanden sein (Dry-Run). Manuell prüfen: Formular ohne JS (DevTools JS aus) sendet als klassischer POST und landet auf `/?sent=1#kontakt` mit Erfolgsanzeige.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Kontakt-API mit Resend und Turnstile, Formular-Frontend

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Motion-Kern: GSAP-Setup, Registry, Lenis, Reveals, Nav, Preloader

**Files:**
- Create: `src/scripts/motion/gsap-setup.ts`, `src/scripts/motion/registry.ts` (ersetzt Platzhalter), `src/scripts/lenis.ts`, `src/scripts/motion/reveals.ts`, `src/scripts/motion/nav.ts`, `src/scripts/motion/preloader.ts`, `src/components/layout/Preloader.astro`
- Modify: `src/layouts/Base.astro` (Preloader einbinden)

**Interfaces:**
- Produces:
  ```ts
  // gsap-setup.ts
  export { gsap, ScrollTrigger, SplitText };
  export const reducedMotion: () => boolean;
  export const isDesktop: () => boolean;      // min-width 1024px
  export const canHover: () => boolean;       // hover: hover and pointer: fine
  export const motionEnabled: () => boolean;  // !reducedMotion()
  // registry.ts
  export type MotionInit = (root: HTMLElement) => (() => void) | void;
  export function registerMotion(name: string, init: MotionInit): void;
  // lenis.ts
  export function initLenis(): () => void;
  export function scrollToHash(hash: string): void;
  ```
- Jedes Motion-Modul exportiert `default: MotionInit` und wird in `registry.ts` unter seinem `data-motion`-Namen eingetragen.

- [ ] **Step 1: gsap-setup.ts**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });

export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isDesktop = (): boolean => window.matchMedia('(min-width: 1024px)').matches;
export const canHover = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const motionEnabled = (): boolean => !reducedMotion();

export { gsap, ScrollTrigger, SplitText };
```

- [ ] **Step 2: lenis.ts**

```ts
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reducedMotion } from './motion/gsap-setup';

let lenis: Lenis | null = null;

export function scrollToHash(hash: string): void {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: -80, duration: 1.2 });
  } else {
    target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

export function initLenis(): () => void {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (reducedMotion() || isTouch) {
    lenis = null;
    return () => {};
  }

  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}
```

- [ ] **Step 3: registry.ts**

```ts
import { gsap, ScrollTrigger, reducedMotion } from './gsap-setup';
import { initLenis, scrollToHash } from '../lenis';
import reveals from './reveals';
import nav from './nav';
import preloader from './preloader';

export type MotionInit = (root: HTMLElement) => (() => void) | void;

const modules = new Map<string, MotionInit>();
export function registerMotion(name: string, init: MotionInit): void {
  modules.set(name, init);
}

registerMotion('nav', nav);
registerMotion('preloader', preloader);

let cleanups: Array<() => void> = [];

function onAnchorClick(event: MouseEvent): void {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]');
  if (!link) return;
  const hash = link.getAttribute('href')!.replace(/^\//, '');
  if (hash.length < 2 || !document.querySelector(hash)) return;
  event.preventDefault();
  history.pushState(null, '', hash);
  scrollToHash(hash);
}

function setup(): void {
  cleanups.forEach((fn) => fn());
  cleanups = [];

  cleanups.push(initLenis());
  cleanups.push(reveals(document.body) ?? (() => {}));

  document.querySelectorAll<HTMLElement>('[data-motion]').forEach((root) => {
    const names = root.dataset.motion!.split(/\s+/);
    for (const name of names) {
      const init = modules.get(name);
      if (!init) continue;
      const cleanup = init(root);
      if (cleanup) cleanups.push(cleanup);
    }
  });

  document.addEventListener('click', onAnchorClick);
  cleanups.push(() => document.removeEventListener('click', onAnchorClick));

  document.documentElement.classList.add('motion-ready');
  requestAnimationFrame(() => ScrollTrigger.refresh());

  if (location.hash && document.querySelector(location.hash)) {
    setTimeout(() => scrollToHash(location.hash), 100);
  }
}

function teardown(): void {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
  document.documentElement.classList.remove('motion-ready');
}

document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', teardown);

if (reducedMotion()) {
  document.documentElement.classList.add('reduced-motion');
}
```

Sektions-Module aus Task 11 werden hier später per `registerMotion` ergänzt.

- [ ] **Step 4: reveals.ts**

```ts
import { gsap, ScrollTrigger, SplitText, motionEnabled } from './gsap-setup';

export default function reveals(root: HTMLElement): () => void {
  const splits: SplitText[] = [];
  const triggers: ScrollTrigger[] = [];

  const revealEls = root.querySelectorAll<HTMLElement>('[data-reveal]');
  const splitEls = root.querySelectorAll<HTMLElement>('[data-split]');

  if (!motionEnabled()) {
    gsap.set([...revealEls, ...splitEls], { clearProps: 'all', opacity: 1, visibility: 'visible' });
    return () => {};
  }

  revealEls.forEach((el) => {
    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    );
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  splitEls.forEach((el) => {
    gsap.set(el, { visibility: 'visible' });
    const split = SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.words, {
          yPercent: 110,
          opacity: 0,
          filter: 'blur(8px)',
          duration: 1.1,
          stagger: 0.035,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
    splits.push(split);
  });

  return () => {
    splits.forEach((s) => s.revert());
    triggers.forEach((t) => t.kill());
  };
}
```

- [ ] **Step 5: nav.ts**

```ts
import { gsap, ScrollTrigger, motionEnabled } from './gsap-setup';

export default function nav(root: HTMLElement): () => void {
  const bg = root.querySelector<HTMLElement>('[data-nav-bg]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const overlay = root.querySelector<HTMLElement>('[data-nav-overlay]');
  const items = overlay?.querySelectorAll<HTMLElement>('[data-nav-overlay-item]') ?? [];
  let open = false;

  const trigger = ScrollTrigger.create({
    start: 80,
    end: 'max',
    onUpdate(self) {
      const scrolled = self.scroll() > 80;
      if (bg) bg.style.opacity = scrolled ? '1' : '0';
      const hide = self.direction === 1 && self.scroll() > 200 && !open;
      root.style.transform = hide ? 'translateY(-100%)' : 'translateY(0)';
    },
    onLeaveBack() {
      if (bg) bg.style.opacity = '0';
      root.style.transform = 'translateY(0)';
    },
  });

  const setOpen = (next: boolean) => {
    open = next;
    if (!toggle || !overlay) return;
    toggle.setAttribute('aria-expanded', String(next));
    toggle.setAttribute('aria-label', next ? 'Menü schließen' : 'Menü öffnen');
    document.documentElement.style.overflow = next ? 'hidden' : '';
    const bars = toggle.querySelectorAll<HTMLElement>('[data-bar]');
    bars[0]?.style.setProperty('transform', next ? 'translateY(7px) rotate(45deg)' : '');
    bars[1]?.style.setProperty('opacity', next ? '0' : '1');
    bars[2]?.style.setProperty('transform', next ? 'translateY(-7px) rotate(-45deg)' : '');

    if (next) {
      overlay.hidden = false;
      if (motionEnabled()) {
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        gsap.fromTo(items, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, delay: 0.1 });
      }
    } else if (motionEnabled()) {
      gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: () => { overlay.hidden = true; } });
    } else {
      overlay.hidden = true;
    }
  };

  const onToggle = () => setOpen(!open);
  const onLink = () => open && setOpen(false);
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && open && setOpen(false);

  toggle?.addEventListener('click', onToggle);
  overlay?.querySelectorAll('a').forEach((a) => a.addEventListener('click', onLink));
  document.addEventListener('keydown', onKey);

  return () => {
    trigger.kill();
    toggle?.removeEventListener('click', onToggle);
    overlay?.querySelectorAll('a').forEach((a) => a.removeEventListener('click', onLink));
    document.removeEventListener('keydown', onKey);
    document.documentElement.style.overflow = '';
  };
}
```

- [ ] **Step 6: Preloader.astro und preloader.ts**

`src/components/layout/Preloader.astro`:
```astro
<div class="fixed inset-0 z-[100] flex items-center justify-center bg-anthracite-950" data-motion="preloader" data-preloader aria-hidden="true">
  <div class="relative flex flex-col items-center gap-6">
    <img src="/logo-white.svg" alt="" width="220" height="70" class="h-12 w-auto opacity-0" data-preloader-logo />
    <span class="block h-px w-40 overflow-hidden bg-anthracite-800"><span class="block h-full w-full origin-left scale-x-0 bg-[image:var(--gold-gradient)]" data-preloader-bar></span></span>
  </div>
</div>
```

`src/scripts/motion/preloader.ts`:
```ts
import { gsap, motionEnabled } from './gsap-setup';

const KEY = 'setify:preloaded';

export default function preloader(root: HTMLElement): () => void {
  const seen = sessionStorage.getItem(KEY) === '1';
  if (seen || !motionEnabled()) {
    root.remove();
    return () => {};
  }
  sessionStorage.setItem(KEY, '1');
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
```

In `Base.astro` direkt nach `<body ...>` einfügen, nur auf der Startseite sichtbar:
```astro
    {Astro.url.pathname === '/' && <Preloader />}
```
mit Import `import Preloader from '@/components/layout/Preloader.astro';`.

- [ ] **Step 7: Prüfen**

Run: `pnpm check && pnpm test:e2e`
Expected: PASS. Browser: Preloader beim ersten Laden, danach Hero-Headline wortweise, Reveals beim Scrollen, Nav blendet Hintergrund ein, verschwindet beim Runterscrollen. Anker-Links scrollen weich. Mit DevTools "Emulate prefers-reduced-motion" alles sofort sichtbar, kein Smooth Scroll. Danach `test.fixme` in `home.spec.ts` bleibt bis Task 11.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Motion-Kern mit GSAP, Lenis, Reveals, Nav und Preloader

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Motion-Module pro Sektion

**Files:**
- Create: `src/scripts/motion/hero-gradient.ts`, `src/scripts/motion/marquee.ts`, `src/scripts/motion/manifest-scrub.ts`, `src/scripts/motion/process-pin.ts`, `src/scripts/motion/counters.ts`, `src/scripts/motion/magnetic.ts`, `src/scripts/motion/tilt.ts`, `src/scripts/motion/parallax.ts`, `src/scripts/motion/accordion.ts`
- Modify: `src/scripts/motion/registry.ts`, `tests/e2e/home.spec.ts` (fixme entfernen), `src/styles/global.css` (Success-Animation)

**Interfaces:**
- Consumes Hooks aus Task 5 und 6.
- Registry-Namen: `hero`, `marquee`, `manifest`, `process`, `counters`, `tilt`, `accordion`. `magnetic` und `parallax` sind global (suchen `[data-magnetic]` und `[data-parallax]` im ganzen Dokument) und werden in `setup()` wie `reveals` aufgerufen.

- [ ] **Step 1: hero-gradient.ts**

```ts
import { motionEnabled, isDesktop } from './gsap-setup';

interface Blob { x: number; y: number; r: number; color: string; vx: number; vy: number; phase: number }

export default function heroGradient(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  const scrollBar = root.querySelector<HTMLElement>('[data-hero-scroll-bar]');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  if (!motionEnabled()) {
    canvas.style.background = 'radial-gradient(circle at 30% 40%, rgba(189,172,137,0.5), transparent 60%), radial-gradient(circle at 70% 60%, rgba(122,106,76,0.5), transparent 60%)';
    return () => {};
  }

  const SCALE = 0.15;
  const blobs: Blob[] = [
    { x: 0.3, y: 0.4, r: 0.45, color: '189,172,137', vx: 0.00012, vy: 0.00009, phase: 0 },
    { x: 0.7, y: 0.6, r: 0.5, color: '122,106,76', vx: -0.0001, vy: 0.00013, phase: 2 },
    { x: 0.55, y: 0.25, r: 0.35, color: '227,214,184', vx: 0.00008, vy: -0.0001, phase: 4 },
  ];

  let w = 0, h = 0, raf = 0, last = 0, visible = true;
  const fps = isDesktop() ? 30 : 20;
  const interval = 1000 / fps;

  const resize = () => {
    w = Math.max(1, Math.floor(root.clientWidth * SCALE));
    h = Math.max(1, Math.floor(root.clientHeight * SCALE));
    canvas.width = w;
    canvas.height = h;
  };

  const draw = (t: number) => {
    raf = requestAnimationFrame(draw);
    if (!visible || t - last < interval) return;
    last = t;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      const px = (b.x + Math.sin(t * b.vx + b.phase) * 0.18) * w;
      const py = (b.y + Math.cos(t * b.vy + b.phase) * 0.18) * h;
      const pr = b.r * Math.max(w, h);
      const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, `rgba(${b.color},0.9)`);
      g.addColorStop(1, `rgba(${b.color},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  };

  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
  io.observe(root);

  resize();
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(draw);

  scrollBar?.animate([{ transform: 'translateY(-100%)' }, { transform: 'translateY(200%)' }], { duration: 1600, iterations: Infinity, easing: 'ease-in-out' });

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('resize', resize);
  };
}
```

- [ ] **Step 2: marquee.ts**

```ts
import { gsap, motionEnabled } from './gsap-setup';

export default function marquee(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('[data-marquee-track]');
  if (!track || !motionEnabled()) return () => {};

  const tween = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  const pause = () => tween.pause();
  const play = () => tween.play();
  root.addEventListener('pointerenter', pause);
  root.addEventListener('pointerleave', play);

  return () => {
    tween.kill();
    root.removeEventListener('pointerenter', pause);
    root.removeEventListener('pointerleave', play);
  };
}
```

- [ ] **Step 3: manifest-scrub.ts**

```ts
import { gsap, SplitText, motionEnabled } from './gsap-setup';

export default function manifestScrub(root: HTMLElement): () => void {
  const text = root.querySelector<HTMLElement>('[data-manifest-text]');
  if (!text) return () => {};

  if (!motionEnabled()) {
    text.style.color = '#f3eee4';
    text.querySelectorAll('em').forEach((em) => { (em as HTMLElement).style.color = '#bdac89'; });
    return () => {};
  }

  const split = SplitText.create(text, {
    type: 'words',
    autoSplit: true,
    onSplit(self) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: text, start: 'top 75%', end: 'bottom 45%', scrub: 0.6 },
      });
      self.words.forEach((word, i) => {
        const gold = !!(word as HTMLElement).closest('em');
        tl.to(word, { color: gold ? '#bdac89' : '#f3eee4', duration: 1, ease: 'none' }, i * 0.25);
      });
      return tl;
    },
  });

  return () => split.revert();
}
```

- [ ] **Step 4: process-pin.ts**

```ts
import { gsap, ScrollTrigger, motionEnabled, isDesktop } from './gsap-setup';

export default function processPin(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('[data-process-track]');
  const progress = root.querySelector<HTMLElement>('[data-process-progress]');
  if (!track) return () => {};

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 96);
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate(self) {
          if (progress) progress.style.transform = `scaleX(${self.progress})`;
        },
      },
    });
    return () => tween.scrollTrigger?.kill();
  });

  mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
    if (!progress) return;
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top 60%',
      end: 'bottom 80%',
      onUpdate(self) { progress.style.transform = `scaleX(${self.progress})`; },
    });
    return () => st.kill();
  });

  return () => mm.revert();
}
```

- [ ] **Step 5: counters.ts**

```ts
import { gsap, motionEnabled } from './gsap-setup';

export default function counters(root: HTMLElement): () => void {
  const els = root.querySelectorAll<HTMLElement>('[data-counter]');
  if (!motionEnabled() || els.length === 0) return () => {};

  const tweens = Array.from(els).map((el) => {
    const value = Number(el.dataset.value ?? '0');
    const suffix = el.dataset.suffix ?? '';
    const state = { n: 0 };
    el.textContent = `0${suffix}`;
    return gsap.to(state, {
      n: value,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate() { el.textContent = `${Math.round(state.n)}${suffix}`; },
    });
  });

  return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
}
```

- [ ] **Step 6: magnetic.ts**

```ts
import { gsap, motionEnabled, canHover, isDesktop } from './gsap-setup';

export default function magnetic(root: HTMLElement): () => void {
  if (!motionEnabled() || !canHover() || !isDesktop()) return () => {};
  const els = root.querySelectorAll<HTMLElement>('[data-magnetic]');
  const cleanups: Array<() => void> = [];

  els.forEach((el) => {
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      gsap.to(el, { x: dx * 8, y: dy * 8, duration: 0.4, ease: 'power2.out' });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set(el, { clearProps: 'x,y' });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
```

- [ ] **Step 7: tilt.ts**

```ts
import { gsap, motionEnabled, canHover, isDesktop } from './gsap-setup';

export default function tilt(root: HTMLElement): () => void {
  if (!motionEnabled() || !canHover() || !isDesktop()) return () => {};
  const cards = root.querySelectorAll<HTMLElement>('[data-tilt-card]');
  const cleanups: Array<() => void> = [];

  cards.forEach((card) => {
    const glow = card.querySelector<HTMLElement>('[data-tilt-glow]');
    const move = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      gsap.to(card, { rotateY: (px - 0.5) * 6, rotateX: (0.5 - py) * 6, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
      if (glow) {
        glow.style.setProperty('--gx', `${px * 100}%`);
        glow.style.setProperty('--gy', `${py * 100}%`);
      }
    };
    const leave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerleave', leave);
      gsap.set(card, { clearProps: 'transform' });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
```

- [ ] **Step 8: parallax.ts**

```ts
import { gsap, motionEnabled } from './gsap-setup';

export default function parallax(root: HTMLElement): () => void {
  if (!motionEnabled()) return () => {};
  const els = root.querySelectorAll<HTMLElement>('[data-parallax]');
  const tweens = Array.from(els).map((el) => {
    gsap.set(el, { scale: 1.15 });
    return gsap.fromTo(el, { yPercent: -8 }, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('figure') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
  return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); gsap.set(t.targets(), { clearProps: 'transform' }); });
}
```

- [ ] **Step 9: accordion.ts**

```ts
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
```

- [ ] **Step 10: Registry ergänzen**

In `registry.ts` importieren und registrieren:
```ts
import heroGradient from './hero-gradient';
import marquee from './marquee';
import manifestScrub from './manifest-scrub';
import processPin from './process-pin';
import counters from './counters';
import tilt from './tilt';
import accordion from './accordion';
import magnetic from './magnetic';
import parallax from './parallax';

registerMotion('hero', heroGradient);
registerMotion('marquee', marquee);
registerMotion('manifest', manifestScrub);
registerMotion('process', processPin);
registerMotion('counters', counters);
registerMotion('tilt', tilt);
registerMotion('accordion', accordion);
```
In `setup()` nach `reveals`:
```ts
  cleanups.push(magnetic(document.body) ?? (() => {}));
  cleanups.push(parallax(document.body) ?? (() => {}));
```

- [ ] **Step 11: Erfolgs-Animation im CSS**

In `global.css` ergänzen:
```css
[data-contact-success] [data-success-circle],
[data-contact-success] [data-success-check] {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
}
[data-contact-success].is-visible [data-success-circle] { animation: draw 1s var(--ease-out-expo) forwards; }
[data-contact-success].is-visible [data-success-check] { animation: draw 0.6s 0.6s var(--ease-out-expo) forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
```

- [ ] **Step 12: FAQ-Test aktivieren und prüfen**

In `tests/e2e/home.spec.ts` `test.fixme(` zurück zu `test(`.

Run: `pnpm check && pnpm test && pnpm test:e2e`
Expected: alle PASS. Browser-Sichtprüfung Desktop: Hero-Verlauf bewegt sich, Laufband läuft, Manifest färbt sich beim Scrollen, Prozess pinnt und schiebt horizontal, Zahlen zählen, Buttons magnetisch, Karten kippen mit Glow, Bilder Parallax, FAQ animiert, Formular-Erfolg zeichnet Haken. Mobil (DevTools 390 px): kein Pinning, kein Tilt, Laufband läuft, alles lesbar. Reduced Motion: alles statisch und sichtbar.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: Sektions-Animationen mit GSAP ScrollTrigger

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Rechtsseiten, JSON-LD, Favicon, OG-Bild

**Files:**
- Create: `src/pages/impressum.astro`, `src/pages/datenschutz.astro`, `src/layouts/Legal.astro`, `src/components/seo/JsonLd.astro`, `public/favicon.svg`, `scripts/og.mjs`, `public/og.png` (generiert)
- Modify: `src/pages/index.astro` (JsonLd einbinden), `tests/e2e/home.spec.ts`

**Interfaces:**
- Produces: `Legal.astro` Props `{ title: string; description: string; heading: string; updated: string }`, Slot für Inhalt mit Tailwind-Prose-Klassen aus `.legal` in global.css.

- [ ] **Step 1: E2E-Test für Rechtsseiten und Redirects**

In `tests/e2e/home.spec.ts` ergänzen:
```ts
test.describe('Rechtsseiten', () => {
  test('Impressum enthält Anbieterdaten', async ({ page }) => {
    await page.goto('/impressum');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Impressum');
    await expect(page.getByText('Philipp Walter')).toBeVisible();
    await expect(page.getByText('Linder Weg 16a')).toBeVisible();
  });

  test('Datenschutz nennt Vercel, Resend und Turnstile, aber kein Webflow', async ({ page }) => {
    await page.goto('/datenschutz');
    const body = await page.locator('main').innerText();
    expect(body).toContain('Vercel');
    expect(body).toContain('Resend');
    expect(body).toContain('Turnstile');
    expect(body).not.toContain('Webflow');
    expect(body).not.toContain('Google Analytics');
  });

  test('alte URLs leiten weiter', async ({ request }) => {
    const res = await request.get('/cookie-richtlinie-eu', { maxRedirects: 0 });
    expect([301, 302, 308]).toContain(res.status());
    expect(res.headers()['location']).toContain('/datenschutz');
  });

  test('Startseite hat JSON-LD', async ({ page }) => {
    await page.goto('/');
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toContain('ProfessionalService');
    expect(ld).toContain('Köln');
  });
});
```

- [ ] **Step 2: Test laufen lassen, muss fehlschlagen**

Run: `pnpm test:e2e`
Expected: FAIL, 404 auf `/impressum`.

- [ ] **Step 3: Legal.astro und CSS**

`src/layouts/Legal.astro`:
```astro
---
import Base from '@/layouts/Base.astro';
import Nav from '@/components/layout/Nav.astro';
import Footer from '@/components/layout/Footer.astro';
import Eyebrow from '@/components/ui/Eyebrow.astro';

interface Props { title: string; description: string; heading: string; updated: string }
const { title, description, heading, updated } = Astro.props;
---
<Base title={title} description={description} tone="sand">
  <Nav tone="sand" />
  <main class="section--sand pt-40 pb-24">
    <div class="container max-w-3xl">
      <a href="/" class="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-anthracite-950">
        <svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
        Zur Startseite
      </a>
      <Eyebrow class="mt-10">Rechtliches</Eyebrow>
      <h1 class="font-display text-h1 mt-5">{heading}</h1>
      <p class="mt-4 text-sm text-ink-muted">Stand: {updated}</p>
      <div class="legal mt-12">
        <slot />
      </div>
    </div>
  </main>
  <Footer />
</Base>
```

In `global.css` ergänzen:
```css
.legal h2 { font-family: var(--font-display); font-size: var(--text-h3); margin-top: 2.5rem; margin-bottom: 0.75rem; }
.legal h3 { font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.5rem; }
.legal p, .legal li { color: #3f3d38; line-height: 1.7; }
.legal p + p { margin-top: 0.9rem; }
.legal ul { list-style: disc; padding-left: 1.25rem; margin: 0.75rem 0; }
.legal a { color: #7a6a4c; text-decoration: underline; text-underline-offset: 3px; }
.legal address { font-style: normal; }
```

- [ ] **Step 4: impressum.astro**

```astro
---
import Legal from '@/layouts/Legal.astro';
---
<Legal title="Impressum | setify" description="Impressum und Anbieterkennzeichnung von setify, Philipp Walter, Köln." heading="Impressum" updated="September 2026">
  <h2>Angaben gemäß § 5 DDG</h2>
  <address>
    <p>setify<br />Philipp Walter<br />Linder Weg 16a<br />51147 Köln<br />Deutschland</p>
  </address>

  <h2>Kontakt</h2>
  <p>E-Mail: <a href="mailto:mail@setify.de">mail@setify.de</a></p>

  <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
  <p>Philipp Walter, Anschrift wie oben.</p>

  <h2>EU-Streitschlichtung</h2>
  <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: <a href="https://ec.europa.eu/consumers/odr/" rel="noopener" target="_blank">https://ec.europa.eu/consumers/odr/</a>. Unsere E-Mail-Adresse findest du oben.</p>

  <h2>Verbraucherstreitbeilegung</h2>
  <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

  <h2>Haftung für Inhalte</h2>
  <p>Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>

  <h2>Haftung für Links</h2>
  <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.</p>

  <h2>Urheberrecht</h2>
  <p>Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung.</p>
</Legal>
```

- [ ] **Step 5: datenschutz.astro**

```astro
---
import Legal from '@/layouts/Legal.astro';
---
<Legal title="Datenschutzerklärung | setify" description="Datenschutzerklärung von setify: welche Daten wir beim Besuch der Website und über das Kontaktformular verarbeiten." heading="Datenschutzerklärung" updated="September 2026">
  <p>Diese Datenschutzerklärung informiert dich über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf setify.de. Wir setzen keine Cookies und keine Tracking-Dienste ein.</p>

  <h2>1. Verantwortlicher</h2>
  <address>
    <p>Philipp Walter<br />setify<br />Linder Weg 16a<br />51147 Köln<br />Deutschland<br />E-Mail: <a href="mailto:mail@setify.de">mail@setify.de</a></p>
  </address>

  <h2>2. Hosting</h2>
  <p>Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf der Seite verarbeitet Vercel technisch notwendige Daten in Server-Logs: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp und Betriebssystem, Referrer. Diese Daten sind für die Auslieferung der Website erforderlich und werden nicht mit anderen Datenquellen zusammengeführt.</p>
  <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt im sicheren und stabilen Betrieb der Website. Die Datenübermittlung in die USA stützt sich auf das EU-US Data Privacy Framework, für das Vercel zertifiziert ist, sowie auf Standardvertragsklauseln. Weitere Informationen: <a href="https://vercel.com/legal/privacy-policy" rel="noopener" target="_blank">vercel.com/legal/privacy-policy</a>.</p>

  <h2>3. Kontaktformular</h2>
  <p>Wenn du uns über das Kontaktformular schreibst, verarbeiten wir die von dir eingegebenen Daten: Name, E-Mail-Adresse, optional Telefonnummer, Projektart, Budgetrahmen und deine Nachricht. Wir nutzen diese Daten ausschließlich zur Bearbeitung deiner Anfrage und für Anschlussfragen.</p>
  <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung eines Vertrags) sowie deine Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO, die du über die Checkbox im Formular erteilst.</p>
  <p>Der Versand der Nachricht an uns und der Bestätigungsmail an dich erfolgt über den Dienst Resend (Resend, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA). Resend verarbeitet dafür deine E-Mail-Adresse und den Inhalt der Nachricht als Auftragsverarbeiter auf Grundlage eines Vertrags nach Art. 28 DSGVO. Weitere Informationen: <a href="https://resend.com/legal/privacy-policy" rel="noopener" target="_blank">resend.com/legal/privacy-policy</a>.</p>
  <p>Deine Anfrage speichern wir so lange, wie es für die Bearbeitung nötig ist. Kommt kein Vertrag zustande, löschen wir die Daten spätestens nach 12 Monaten. Gesetzliche Aufbewahrungspflichten bleiben unberührt.</p>

  <h2>4. Spam-Schutz mit Cloudflare Turnstile</h2>
  <p>Zum Schutz des Formulars vor automatisierten Eingaben setzen wir Cloudflare Turnstile ein (Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA). Turnstile prüft anhand technischer Merkmale des Browsers, ob eine Eingabe von einem Menschen stammt. Dabei werden IP-Adresse und Browserinformationen an Cloudflare übermittelt. Turnstile setzt keine Tracking-Cookies.</p>
  <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt im Schutz vor Missbrauch und Spam. Weitere Informationen: <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener" target="_blank">cloudflare.com/privacypolicy</a>.</p>

  <h2>5. Kontakt per E-Mail</h2>
  <p>Wenn du uns direkt per E-Mail schreibst, verarbeiten wir deine Angaben zur Bearbeitung der Anfrage auf Grundlage von Art. 6 Abs. 1 lit. b oder lit. f DSGVO.</p>

  <h2>6. Cookies und Analyse</h2>
  <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Werbedienste. Schriften werden von unserem eigenen Server geladen, es findet kein Abruf bei Drittanbietern wie Google Fonts statt.</p>

  <h2>7. Deine Rechte</h2>
  <p>Du hast gegenüber uns folgende Rechte hinsichtlich der dich betreffenden personenbezogenen Daten:</p>
  <ul>
    <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
    <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
    <li>Recht auf Löschung (Art. 17 DSGVO)</li>
    <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
    <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
    <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
    <li>Recht auf Widerruf erteilter Einwilligungen mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)</li>
  </ul>
  <p>Du hast außerdem das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig für uns ist die Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße 2-4, 40213 Düsseldorf.</p>

  <h2>8. Datensicherheit</h2>
  <p>Die Übertragung aller Daten erfolgt verschlüsselt über HTTPS (TLS). Wir treffen technische und organisatorische Maßnahmen, um deine Daten gegen Verlust, Manipulation und unberechtigten Zugriff zu schützen.</p>

  <h2>9. Änderungen</h2>
  <p>Wir passen diese Datenschutzerklärung an, wenn sich die Rechtslage oder unsere Verarbeitung ändert. Es gilt die jeweils aktuelle Fassung auf dieser Seite.</p>
</Legal>
```

Hinweis für Philipp im Commit und README: Text ist eine Vorlage, keine Rechtsberatung, vor Livegang prüfen lassen.

- [ ] **Step 6: JsonLd.astro und Einbindung**

```astro
---
import { site } from '@/content/site';
const data = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'setify',
  description: site.meta.description,
  url: site.meta.url,
  email: site.meta.email,
  image: `${site.meta.url}/og.png`,
  logo: `${site.meta.url}/logo.svg`,
  founder: { '@type': 'Person', name: 'Philipp Walter' },
  address: { '@type': 'PostalAddress', streetAddress: 'Linder Weg 16a', postalCode: '51147', addressLocality: 'Köln', addressCountry: 'DE' },
  areaServed: 'DE',
  priceRange: '€€€',
  knowsAbout: ['Webdesign', 'Webentwicklung', 'Performance-Optimierung', 'UX Design'],
};
---
<script type="application/ld+json" set:html={JSON.stringify(data)} />
```

In `index.astro` im `<Base>` per Slot `head`:
```astro
<Base title={site.meta.title} description={site.meta.description}>
  <JsonLd slot="head" />
  ...
```
mit Import `import JsonLd from '@/components/seo/JsonLd.astro';`.

- [ ] **Step 7: favicon.svg**

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7a6a4c"/>
      <stop offset=".5" stop-color="#bdac89"/>
      <stop offset="1" stop-color="#e3d6b8"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#1a1b1e"/>
  <path d="M22 40c2.5 3.2 6.2 5 10.4 5 5.6 0 9.6-2.9 9.6-7.4 0-4.2-2.9-6.2-8.5-7.6l-3.4-.8c-3.3-.8-4.7-1.9-4.7-3.9 0-2.4 2.3-4 5.7-4 3 0 5.6 1.3 7.6 3.7l3.2-3.4C39.3 18.6 35.7 17 31.4 17c-6.2 0-10.6 3.4-10.6 8.3 0 4.4 2.9 6.6 8.3 7.9l3.4.8c3.5.8 5 1.9 5 4 0 2.4-2.4 4.1-6 4.1-3.4 0-6.4-1.5-8.4-4.3L22 40z" fill="url(#g)"/>
</svg>
```

- [ ] **Step 8: OG-Bild generieren**

`scripts/og.mjs`:
```js
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const logo = readFileSync(new URL('../public/logo-white.svg', import.meta.url), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace('<svg ', '<svg x="120" y="180" width="520" ');

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
  <text x="120" y="420" font-family="Georgia, serif" font-size="54" fill="#f3eee4">Websites, die man nicht wegklickt.</text>
  <text x="120" y="480" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#a8a49b">Premium Websites aus Köln. Konzept, Design und Code aus einer Hand.</text>
  <rect x="120" y="540" width="240" height="4" fill="url(#g)"/>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(new URL('../public/og.png', import.meta.url), png);
console.log('public/og.png geschrieben,', png.length, 'Bytes');
```

Run: `pnpm og`
Expected: `public/og.png geschrieben`. Datei öffnen und prüfen: Logo sichtbar, Text lesbar. Falls das Logo-SVG in sharp nicht rendert (CSS-Klassen in `<style>`), Logo weglassen und stattdessen `<text ... font-size="72" fill="url(#g)">setify</text>` verwenden.

- [ ] **Step 9: Prüfen**

Run: `pnpm check && pnpm test && pnpm test:e2e`
Expected: alle PASS. `pnpm build` erzeugt `dist/client/sitemap-index.xml` mit `/`, `/impressum`, `/datenschutz`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: Impressum, Datenschutz, JSON-LD, Favicon und OG-Bild

Datenschutztext ist Vorlage, vor Livegang rechtlich prüfen lassen.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: Qualität, README, Deploy-Vorbereitung

**Files:**
- Create: `README.md`, `.github/workflows/ci.yml`
- Modify: `package.json` (Script `lighthouse`)

**Interfaces:**
- Consumes: alles.
- Produces: CI auf GitHub (Check, Unit, E2E, Build), Lighthouse-Skript lokal, README mit Betriebsanleitung für Philipp.

- [ ] **Step 1: Lighthouse-Skript**

In `package.json` Scripts ergänzen:
```json
"lighthouse": "pnpm build && (pnpm preview --port 4321 & echo $! > .preview.pid; sleep 3; pnpm dlx lighthouse http://localhost:4321 --preset=desktop --quiet --chrome-flags='--headless' --output=json --output-path=./lighthouse.json; kill $(cat .preview.pid); rm .preview.pid; node -e \"const r=require('./lighthouse.json').categories;for(const k in r)console.log(k.padEnd(16),Math.round(r[k].score*100))\")"
```
`.gitignore` ergänzen: `lighthouse.json`, `.preview.pid`.

Run: `pnpm lighthouse`
Expected: vier Zeilen mit Werten. Ziel je 95 oder besser. Bei Performance unter 95 prüfen: Fonts (nur die zwei Familien, `full.css` von Fraunces ggf. durch `index.css` ersetzen wenn zu groß), Canvas-Blur (Hero-Canvas `SCALE` auf 0.1), GSAP-Bundle (nur importierte Plugins). Bei Accessibility unter 95 Kontraste und `aria`-Attribute prüfen.

- [ ] **Step 2: CI-Workflow**

`.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm test
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e
      - run: pnpm build
```

- [ ] **Step 3: README.md**

```markdown
# setify.de

Website von setify. Astro 7, Tailwind 4, GSAP, Lenis, Resend. Deploy auf Vercel.

## Entwicklung

```bash
pnpm install
cp .env.example .env
pnpm dev
```

- `pnpm check` Typen und Astro-Check
- `pnpm test` Unit-Tests (Vitest)
- `pnpm test:e2e` End-to-End (Playwright, startet Dev-Server selbst)
- `pnpm build` Produktions-Build
- `pnpm lighthouse` Lighthouse-Werte lokal
- `pnpm og` OG-Bild neu generieren

## Inhalte ändern

Alle Texte, Preise, FAQ und Referenzen stehen in `src/content/site.ts`. Sektionen lesen nur daraus.

## Bilder einsetzen

Jeder Platzhalter zeigt `BILD: <Name>, <Format>` und hat eine `id` in `site.ts`. Bild als `src/assets/images/<id>.jpg` (oder png, webp, avif) ablegen, fertig. Empfohlene Mindestbreite 1600 px, Format wie angegeben.

Liste der IDs: `hero-visual`, `service-strategie`, `service-design`, `service-entwicklung`, `service-betreuung`, `work-tivendo`, `work-strunck`, `work-weinhof`, `work-bergloft`, `industry-industrie`, `industry-lifestyle`, `industry-handwerk`, `industry-gastro`.

## Kontaktformular

`POST /api/contact` validiert mit Zod, prüft Cloudflare Turnstile, sendet über Resend an `CONTACT_TO` und eine Bestätigung an den Absender. Ohne `RESEND_API_KEY` läuft ein Dry-Run mit Log.

Einrichtung:
1. Resend-Account, Domain `setify.de` verifizieren (DKIM- und SPF-Einträge im DNS), API-Key erstellen.
2. Cloudflare Turnstile Widget für `setify.de` anlegen, Site-Key und Secret notieren.
3. Variablen in Vercel setzen (Production und Preview): `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`.

## Deploy

Vercel-Projekt mit diesem GitHub-Repo verbinden, Framework Astro wird erkannt. Jeder Push auf `main` deployt Production, jeder Branch bekommt eine Preview-URL.

Domainumzug: In Vercel `setify.de` und `www.setify.de` hinzufügen, DNS beim Registrar auf die angezeigten Werte setzen. Alte WordPress-Instanz erst nach erfolgreichem Umzug abschalten.

## Offen vor Livegang

- Bilder für alle Platzhalter
- Kundenzitate freigeben lassen (aktuell mit "Zitat zur Freigabe" markiert)
- Datenschutzerklärung rechtlich prüfen lassen
- Resend und Turnstile Keys in Vercel eintragen
```

- [ ] **Step 4: Abschlussprüfung**

Run: `pnpm check && pnpm test && pnpm test:e2e && pnpm build`
Expected: alles grün.

- [ ] **Step 5: Commit und Push**

```bash
git add -A
git commit -m "chore: CI, README, Lighthouse-Skript

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push
```

Erwartet: CI-Lauf auf GitHub grün.

---

## Nach dem Plan

- Vercel-Projekt anlegen (per Vercel-Integration mit GitHub-Repo `setify/setify.de`), Env-Variablen setzen, Preview prüfen.
- Philipp liefert Bilder, Keys, Freigaben (siehe README, Abschnitt "Offen vor Livegang").
- DNS-Umzug nach Freigabe.
