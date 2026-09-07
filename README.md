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
