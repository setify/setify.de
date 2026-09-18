# setify.de Relaunch: Design-Spec

Datum: 2026-09-07
Status: freigegeben (Philipp Walter, 2026-09-07)
Repo: https://github.com/setify/setify.de

## 1. Ziel

Relaunch der Agentur-Website setify.de als statische, hochperformante One-Page-Website mit zwei Rechtsseiten. Komplett neue Texte, neue Struktur, neue Typografie, stark animiertes Interface. Farbwelt bleibt bei der bestehenden Marke: Anthrazit, Gold, Sand. Kein Grün.

Erfolgskriterien:

- Lighthouse Performance, Accessibility, Best Practices, SEO jeweils 95 oder besser auf Mobil und Desktop.
- Alle Sektionen aus Abschnitt 4 vorhanden, mit neuen Texten und beschrifteten Bildplatzhaltern.
- Kontaktformular sendet über Resend an mail@setify.de und schickt Bestätigung an Absender.
- Animationen laufen mit 60 fps auf aktuellem MacBook und iPhone, `prefers-reduced-motion` wird respektiert.
- Deploy auf Vercel über Git-Integration, Preview pro Push.

Nicht Teil dieses Projekts: CMS, Blog, Mehrsprachigkeit, Kundenlogin, Analytics mit Cookies.

## 2. Marke

### 2.1 Farben

| Token | Hex | Verwendung |
|---|---|---|
| `anthracite-950` | `#1A1B1E` | Basis dunkler Sektionen, Text auf Sand |
| `anthracite-900` | `#232428` | Karten auf dunklen Sektionen |
| `anthracite-800` | `#2E3035` | Linien, Borders auf dunkel |
| `gold-500` | `#BDAC89` | Markenfarbe aus Logo, Akzente, Buttons |
| `gold-300` | `#E3D6B8` | Helles Gold, Hover, Verlauf-Ende |
| `gold-700` | `#7A6A4C` | Tiefes Gold, Verlauf-Start |
| `sand-100` | `#F3EEE4` | Hintergrund heller Sektionen |
| `sand-200` | `#EAE3D5` | Karten auf Sand |
| `sand-50` | `#FBF9F4` | Highlight, Formularfelder |
| `ink-muted` | `#6B665C` | Gedämpfter Text auf Sand |
| `paper-muted` | `#A8A49B` | Gedämpfter Text auf Anthrazit |

Gold-Verlauf: `linear-gradient(135deg, #7A6A4C 0%, #BDAC89 50%, #E3D6B8 100%)`, in Hero und CTA animiert (Position wandert langsam).

Regeln: Gold nie flächig als Hintergrund ganzer Sektionen. Sektionen wechseln zwischen Anthrazit und Sand. Verläufe nur in Hero, Kontakt-CTA, Button-Hover, Linien.

### 2.2 Typografie

| Rolle | Font | Gewichte | Details |
|---|---|---|---|
| Headlines | Space Grotesk (variable) | 500 bis 600 | Letterspacing -0.035em, Zeilenhöhe 0.95 bis 1.05 (Fraunces am 2026-09-08 ersetzt, Wunsch: nur Sans) |
| Text, UI | Manrope (variable) | 400 bis 700 | Zeilenhöhe 1.6 |
| Labels, Zahlen | Manrope | 600 | Uppercase, Letterspacing 0.12em, 12 bis 13 px |

Beide Fonts selbst gehostet über `@fontsource-variable/fraunces` und `@fontsource-variable/manrope`. Kein Google-Fonts-Request. `font-display: swap`, Preload der beiden Hauptdateien.

Typoskala (Desktop, fluid via `clamp`): Display 96 px, H1 72 px, H2 56 px, H3 32 px, Lead 22 px, Body 17 px, Small 14 px.

### 2.3 Logo

Bestehendes SVG-Logo wird übernommen (`setify_logo_1.svg`, `setify_logo_white.svg`). Verlauf im Logo bleibt Gold. Favicon und OG-Bild werden aus dem Logo generiert.

## 3. Technik

### 3.1 Stack

- Astro 5, TypeScript strict, Output `server` mit Vercel-Adapter, alle Seiten `prerender = true`, nur `/api/contact` dynamisch
- Tailwind CSS 4 mit Design-Tokens aus Abschnitt 2 als CSS-Variablen
- GSAP 3 mit ScrollTrigger, Lenis für Smooth Scroll, SplitType für Text-Splits
- Zod für Validierung, Resend SDK für Mail, Cloudflare Turnstile für Spam-Schutz
- `@astrojs/sitemap`, eigene Meta-Komponente, JSON-LD LocalBusiness
- Vitest für Unit-Tests, Playwright für Smoke-Tests
- pnpm als Paketmanager

### 3.2 Projektstruktur

```
src/
  components/
    layout/      Nav, Footer, Preloader, Cursor
    sections/    Hero, TrustMarquee, Manifest, Services, Process, Work, Numbers, Pricing, Industries, Faq, Contact
    ui/          Button, Card, Eyebrow, SectionHeading, ImagePlaceholder, Accordion, Input
    seo/         Meta, JsonLd
  content/
    site.ts      Alle Texte, Preise, FAQ, Referenzen als typisierte Daten
  layouts/
    Base.astro
  pages/
    index.astro
    impressum.astro
    datenschutz.astro
    api/contact.ts
  scripts/
    motion/      gsap-setup.ts, reveals.ts, hero-gradient.ts, marquee.ts, process-pin.ts, manifest-scrub.ts, counters.ts, magnetic.ts, tilt.ts
    lenis.ts
  styles/
    tokens.css, global.css
  lib/
    contact-schema.ts, turnstile.ts, mail.ts
tests/
  unit/    contact-schema.test.ts, mail.test.ts
  e2e/     home.spec.ts, contact.spec.ts
public/
  fonts (via fontsource, kein manuelles Kopieren), favicon, og.png, logo svgs
```

Texte liegen zentral in `src/content/site.ts`. Sektionen lesen nur daraus. So kann Philipp Texte an einer Stelle ändern.

### 3.3 Bildplatzhalter

Komponente `ImagePlaceholder` rendert ein SVG in Sand oder Anthrazit mit Gold-Rahmen, Seitenverhältnis und Beschriftung, zum Beispiel `BILD: Hero-Visual, 4:5`. Jeder Platzhalter hat eine `id`, die in `site.ts` dokumentiert ist. Ersetzen: Datei nach `src/assets/images/<id>.<ext>` legen, Komponente wechselt automatisch auf `<Image>` von Astro, sobald Datei existiert.

### 3.4 Kontaktformular

Frontend: Formular in Sektion Kontakt, progressive Enhancement. Ohne JS: normaler POST an `/api/contact`, Redirect auf `/?sent=1#kontakt`. Mit JS: fetch, Inline-Fehler, Erfolgszustand mit Animation.

Felder:

| Feld | Pflicht | Validierung |
|---|---|---|
| name | ja | 2 bis 100 Zeichen |
| email | ja | gültige E-Mail |
| phone | nein | 6 bis 30 Zeichen, nur Ziffern, Leerzeichen, +, -, / |
| projectType | ja | enum: `website`, `redesign`, `shop`, `performance`, `betreuung`, `sonstiges` |
| budget | ja | enum: `bis-5k`, `5k-10k`, `10k-25k`, `ueber-25k`, `abo`, `offen` |
| message | ja | 20 bis 3000 Zeichen |
| website | nein | Honeypot, muss leer sein |
| cf-turnstile-response | ja | Turnstile-Token |
| consent | ja | Checkbox Datenschutz |

Backend `POST /api/contact`:

1. Body parsen (JSON oder FormData), Zod-Schema prüfen. Fehler: 400 mit Feldfehlern.
2. Honeypot gefüllt: 200 zurückgeben, nichts senden (Bot soll Erfolg sehen).
3. Turnstile-Token bei Cloudflare verifizieren. Fehler: 400.
4. Resend: Mail an `CONTACT_TO` (mail@setify.de) mit allen Feldern, Reply-To auf Absender. Zweite Mail an Absender als Bestätigung, schlicht, Sand-Design als HTML.
5. Resend-Fehler: 502 mit generischer Meldung, Fehler in Vercel-Logs.
6. Rate Limit: 5 Requests pro IP und 10 Minuten, in-memory pro Instanz (reicht für Agentur-Seite).

Env-Variablen: `RESEND_API_KEY`, `RESEND_FROM` (z.B. `setify <hallo@setify.de>`), `CONTACT_TO`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`. Lokale Entwicklung: `.env` mit Turnstile-Testkeys, Resend im Dry-Run wenn `RESEND_API_KEY` fehlt (Logging statt Senden).

Voraussetzungen durch Philipp: Resend-Account, Domain setify.de in Resend verifizieren (DKIM, SPF DNS-Einträge), Turnstile-Widget in Cloudflare anlegen.

### 3.5 SEO und Meta

- Title: `setify | Premium Websites aus Köln`
- Description neu, 150 Zeichen, aus Hero-Subline abgeleitet
- Canonical, OG, Twitter Card, OG-Bild 1200x630 aus Logo auf Anthrazit mit Gold-Verlauf
- JSON-LD `ProfessionalService` mit Adresse aus Impressum
- `robots.txt`, Sitemap, `lang="de"`
- Rechtsseiten `noindex` nicht setzen, Standard indexierbar

### 3.6 Barrierefreiheit

- Kontraste: Gold `#BDAC89` auf Anthrazit `#1A1B1E` erreicht 7.6:1. Gedämpfter Text auf Sand mindestens 4.5:1. Gold auf Sand nur für dekorative Elemente, nie für Fließtext.
- Fokus-Zustände sichtbar in Gold, Tastaturbedienung für Akkordeon, Nav, Formular.
- Alle Animationen bei `prefers-reduced-motion: reduce` auf Opacity-Fades reduziert, Pinning und Smooth Scroll aus, Marquee statisch.
- Alt-Texte für Platzhalter beschreiben Inhalt, Platzhalter-Label ist `aria-hidden`.

## 4. Seitenstruktur und Inhalt

Alle Texte sind Erstfassung von Claude, Philipp gibt frei. Sprache: Deutsch, Du-Ansprache, kurz, konkret, kein Agentur-Jargon. Kundenzitate werden neu formuliert und müssen von den Kunden freigegeben werden, bis dahin als "Zitat zur Freigabe" markiert.

Farbrhythmus: 1 dunkel, 2 dunkel, 3 dunkel, 4 Sand, 5 Sand, 6 dunkel, 7 Sand, 8 dunkel, 9 Sand, 10 dunkel, 11 Sand, 12 dunkel, Footer dunkel.

### 4.1 Navigation

Sticky, transparent über Hero, nach 80 px Scroll Blur-Hintergrund in Anthrazit 80 Prozent. Logo links (weiß), Anker mittig: Leistungen, Prozess, Referenzen, Preise, FAQ. Rechts Gold-Button "Projekt anfragen" zu `#kontakt`. Mobil: Burger, Vollbild-Overlay mit gestaffelter Einblendung der Links.

### 4.2 Hero

Anthrazit. Hintergrund: animierter Gold-Verlauf auf Canvas (weiche Blobs, 3 Farben aus Gold-Palette, langsame Bewegung, Blur), Grain-Overlay 4 Prozent, Vignette zum Rand.

- Eyebrow: `Webagentur aus Köln`
- H1 (Fraunces): `Websites, die man nicht wegklickt.`
- Lead: `setify baut digitale Auftritte für Unternehmen, die mehr wollen als Baukasten. Konzept, Design und Code aus einer Hand, seit über 20 Jahren.`
- Buttons: `Projekt anfragen` (Gold, magnetisch), `Referenzen ansehen` (Ghost, Gold-Rahmen)
- Rechts: `[BILD: hero-visual, 4:5]`, mit Parallax
- Unten: Scroll-Indikator, dünne Gold-Linie animiert

Animation: Preloader (Logo zeichnet sich, Gold-Linie füllt), dann H1 Wort für Wort mit Blur-to-sharp, Lead und Buttons gestaffelt, Bild von unten mit Clip-Path.

### 4.3 Vertrauensleiste

Anthrazit, schmale Sektion. Label `Vertrauen uns`. Endloses Laufband der Kundennamen in Fraunces 300, Gold-Punkte als Trenner: Tivendo, Blumen Strunck, Weinhof Rudolstadt, Berg-Loft Styles. Pausiert bei Hover.

### 4.4 Manifest

Anthrazit. Ein Absatz in Fraunces, Display-Größe, Wörter starten in `paper-muted` und werden beim Scrollen nacheinander in Sand-Weiß und Schlüsselwörter in Gold gefärbt (ScrollTrigger scrub).

Text: `Eine Website ist kein Projekt, das fertig wird. Sie ist der erste Händedruck mit jedem Kunden. Deshalb bauen wir keine Vorlagen, sondern Auftritte, die zu dir passen, schnell laden und auch in drei Jahren noch überzeugen.`

Gold: `erste Händedruck`, `zu dir passen`, `schnell laden`.

### 4.5 Leistungen

Sand. Eyebrow `Leistungen`, H2 `Alles, was dein Auftritt braucht.` Vier Karten, 2x2 Grid, Hover-Tilt und Gold-Glow folgt Maus. Jede Karte: Nummer 01 bis 04, `[BILD: service-<slug>, 3:2]`, H3, Text, Liste mit 3 Punkten.

1. **Strategie & Konzept**: `Bevor wir gestalten, verstehen wir. Zielgruppe, Wettbewerb, Ziele. Daraus wird eine Struktur, die führt statt verwirrt.` Punkte: Briefing-Workshop, Seitenarchitektur, Content-Plan
2. **Design & UX**: `Gestaltung, die zu deiner Branche passt und deine Kunden ernst nimmt. Klar, hochwertig, wiedererkennbar.` Punkte: Individuelles Design, Responsive für alle Geräte, Interaktion und Animation
3. **Entwicklung & Performance**: `Sauberer Code statt Plugin-Stapel. Ladezeiten unter einer Sekunde, Bestwerte in Google PageSpeed, sicher gehostet.` Punkte: Moderne Frameworks, Performance-Optimierung, SEO-Grundlagen
4. **Betreuung & Wachstum**: `Nach dem Launch geht es weiter. Updates, Backups, Anpassungen und Ideen, wie deine Seite mehr Anfragen bringt.` Punkte: Monatliche Checks, Inhaltspflege, Weiterentwicklung

### 4.6 Prozess

Sand, horizontal gepinnt auf Desktop (Sektion bleibt stehen, Karten schieben von rechts), auf Mobil vertikale Liste. Eyebrow `So arbeiten wir`, H2 `Vier Schritte bis zum Launch.`

1. **Anfrage**: `Du schreibst uns über das Formular. Wir melden uns innerhalb eines Werktags mit ersten Gedanken und einem Terminvorschlag.`
2. **Briefing**: `In einem strukturierten Gespräch klären wir Ziele, Inhalte und Umfang. Danach bekommst du ein festes Angebot, kein Stundenschätzen.`
3. **Umsetzung**: `Design und Entwicklung laufen transparent. Du siehst Zwischenstände live und gibst direkt Feedback.`
4. **Launch & Betreuung**: `Wir gehen gemeinsam online, prüfen alles auf echten Geräten und bleiben danach ansprechbar.`

Fortschrittslinie in Gold füllt sich mit dem Scroll.

### 4.7 Referenzen

Anthrazit. Eyebrow `Referenzen`, H2 `Ausgewählte Arbeiten.` Vier Karten, versetzt (2 Spalten, rechte Spalte um 120 px nach unten), jede mit `[BILD: work-<slug>, 4:3]`, Kundenname, Branche, Ein-Satz-Beschreibung, Zitat zur Freigabe. Hover: Bild zoomt leicht, Gold-Pfeil erscheint.

1. Tivendo, Industrie: `Klare Produktkommunikation für Kunden und Bewerber.`
2. Blumen Strunck, Handwerk: `Regionaler Auftritt mit Anfragen direkt über die Website.`
3. Weinhof Rudolstadt, Gastro & Event: `Genuss und Veranstaltungen, stimmungsvoll inszeniert.`
4. Berg-Loft Styles, Lifestyle: `Ästhetik mit Liebe zum Detail, die sich vom Wettbewerb abhebt.`

Darunter Testimonial-Slider mit 3 Zitaten (zur Freigabe), Gold-Anführungszeichen in Fraunces.

### 4.8 Zahlen

Anthrazit, schmal. Vier Counter, zählen beim Erscheinen hoch: `20+ Jahre Erfahrung`, `100+ Projekte`, `100 PageSpeed als Ziel`, `1 Ansprechpartner`. Fraunces für Zahlen, Gold.

### 4.9 Preise

Sand. Eyebrow `Preise`, H2 `Fair, transparent, ohne Kleingedrucktes.` Drei Karten:

1. **Website Single**, `ab 4.790 €`, einmalig. `Für Unternehmen, die einen starken Auftritt wollen und ihn selbst betreuen.` Leistungen: Konzept und Design, Entwicklung und Launch, Responsive und performance-optimiert, Einführung in die Pflege, Updates optional buchbar. Button `Anfragen`.
2. **Website Abo**, `ab 690 €`, pro Monat, Mindestlaufzeit 12 Monate. Gold-Rahmen, Label `Empfohlen`. `Für alle, die sich um nichts kümmern wollen.` Leistungen: Alles aus Single, Hosting und Backups, Monatliche Updates und Checks, Inhaltspflege inklusive, Persönlicher Support. Button `Anfragen`, Gold.
3. **Individuell**, `auf Anfrage`. `Für Shops, Portale oder Projekte mit besonderen Anforderungen.` Leistungen: Festpreis nach Briefing, Tages- oder Stundensatz möglich, Langfristige Zusammenarbeit. Button `Gespräch vereinbaren`.

Hinweis unter den Karten: `Alle Preise netto zzgl. USt.`

### 4.10 Branchen

Anthrazit. Eyebrow `Branchen`, H2 `Zu Hause in deiner Branche.` Vier hohe Kacheln nebeneinander (Mobil 2x2), `[BILD: industry-<slug>, 3:4]` mit Anthrazit-Overlay, Hover hebt Overlay auf und zeigt Text.

1. **Industrie**: `Komplexe Leistungen klar erklärt, für Kunden wie für Bewerber.`
2. **Lifestyle**: `Ästhetik, die Marke wird. Jedes Detail sitzt.`
3. **Handwerk**: `Gefunden werden, Vertrauen aufbauen, Anfragen direkt erhalten.`
4. **Gastro & Event**: `Stimmung, Qualität und Reservierung an einem Ort.`

### 4.11 FAQ

Sand. Eyebrow `Fragen`, H2 `Was du wissen willst.` Akkordeon, ein Eintrag offen, Gold-Plus rotiert zu Minus.

1. `Wie lange dauert eine Website?` `Eine Single-Website ist in der Regel nach 4 bis 6 Wochen online. Der größte Faktor ist, wie schnell Inhalte und Feedback bei uns landen.`
2. `WordPress oder eigener Code?` `Beides, je nach Anforderung. Wenn du Inhalte oft selbst pflegen willst, setzen wir auf WordPress mit schlankem Setup. Für maximale Geschwindigkeit bauen wir statisch mit modernen Frameworks.`
3. `Was kostet eine Website wirklich?` `Single ab 4.790 €, Abo ab 690 € im Monat. Nach dem Briefing bekommst du einen Festpreis. Keine Überraschungen.`
4. `Wem gehört die Website?` `Dir. Design, Code und Inhalte gehen mit dem Launch komplett in dein Eigentum über, auch im Abo nach Ende der Laufzeit.`
5. `Übernehmt ihr auch bestehende Seiten?` `Ja. Wir analysieren den aktuellen Stand und sagen dir ehrlich, ob sich ein Redesign lohnt oder ein Neustart günstiger ist.`
6. `Wie läuft die Betreuung im Abo?` `Monatlich prüfen wir Updates, Sicherheit, Ladezeit und Backups. Textänderungen und kleine Anpassungen sind inklusive, größere Erweiterungen bieten wir separat an.`

### 4.12 Kontakt

Anthrazit mit Gold-Verlauf als großer weicher Fleck im Hintergrund. Zweispaltig: links Text, rechts Formular auf Sand-Karte.

- Eyebrow `Kontakt`
- H2 `Lass uns über dein Projekt sprechen.`
- Text: `Erzähl uns kurz, worum es geht. Wir antworten innerhalb eines Werktags, persönlich und ohne Verkaufsdruck.`
- Kontaktdaten: mail@setify.de, Köln
- Formular gemäß 3.4, Button `Anfrage senden` Gold
- Erfolg: Formular blendet aus, Gold-Haken zeichnet sich, Text `Danke, deine Anfrage ist da. Wir melden uns innerhalb eines Werktags.`

### 4.13 Footer

Anthrazit. Logo weiß, kurzer Satz `Premium Websites aus Köln.`, Anker-Links, Rechtliches: Impressum, Datenschutz. Zeile `© 2026 setify`. Gold-Linie oben.

### 4.14 Rechtsseiten

`/impressum` und `/datenschutz` im Sand-Layout mit schmaler Textspalte, Fraunces-Headlines, Zurück-Link. Inhalt aus der alten Seite übernommen. Impressum unverändert (Philipp Walter, Linder Weg 16a, 51147 Köln, mail@setify.de). Datenschutz bereinigt: alle nicht genutzten Dienste entfernt (Webflow, CloudFront, Google Analytics, Ads, Mailchimp, Amazon, Social Plugins, Zoom, Discord, Teams, Maps, Fonts, Soundcloud, Vimeo, YouTube). Ergänzt: Hosting Vercel, Kontaktformular mit Resend, Spam-Schutz Cloudflare Turnstile, keine Cookies. Text ist Vorlage, kein Rechtsrat, Philipp lässt prüfen. Keine Cookie-Seite, kein Banner.

## 5. Animation

Zentrale Datei `scripts/motion/gsap-setup.ts` registriert Plugins, prüft `prefers-reduced-motion` und Viewport, exportiert `motionEnabled`. Jede Sektion hat eigenes Modul mit `init()` und `destroy()`, wird über `data-motion="<name>"` am Root der Sektion gefunden. Astro View Transitions: `astro:page-load` ruft init, `astro:before-swap` ruft destroy.

| Effekt | Wo | Technik |
|---|---|---|
| Preloader | Erstbesuch | Logo-Pfade per stroke-dashoffset, Gold-Linie, dann Overlay hoch, sessionStorage merkt Besuch |
| Gradient-Hintergrund | Hero, Kontakt | Canvas 2D, 3 Radial-Gradients bewegen sich auf Noise-Pfaden, 30 fps, pausiert wenn nicht sichtbar |
| Grain | Hero, Kontakt | SVG feTurbulence als Overlay, statisch |
| Text-Reveal | Alle Headlines | SplitType Zeilen und Wörter, y 100 Prozent zu 0, Blur 8 px zu 0, stagger 0.04 |
| Scroll-Reveal | Karten, Absätze | ScrollTrigger start top 85 Prozent, y 40 zu 0, opacity |
| Manifest-Scrub | Manifest | Wörter einzeln, color-Tween, scrub 1 |
| Marquee | Vertrauensleiste | GSAP horizontalLoop, pausiert bei Hover |
| Pinning | Prozess | ScrollTrigger pin, horizontaler x-Tween, nur ab 1024 px |
| Counter | Zahlen | gsap.to innerText mit snap |
| Magnetisch | Buttons | pointermove, translate bis 8 px, elastic zurück |
| Tilt und Glow | Leistungen, Referenzen | rotateX/Y bis 6 Grad, radial-gradient folgt Maus, nur mit Hover-fähigem Gerät |
| Parallax | Hero-Bild, Referenz-Bilder | yPercent scrub |
| Smooth Scroll | Global | Lenis, mit ScrollTrigger synchronisiert, aus bei reduced-motion und Touch |
| Nav | Global | Blur-Hintergrund nach 80 px, Hide-on-scroll-down, Show-on-scroll-up |
| Akkordeon | FAQ | Höhe-Tween, Icon-Rotation |
| Formular-Erfolg | Kontakt | Haken per stroke-dashoffset, Text fade |

Reduced Motion: alle Tweens werden zu `duration 0.3, opacity only`. Pinning, Marquee, Parallax, Tilt, Magnetisch, Lenis, Canvas aus.

Mobil (unter 1024 px): kein Pinning, kein Tilt, kein Magnetisch, Canvas mit 20 fps.

## 6. Tests

- Unit (Vitest): `contact-schema.test.ts` deckt jedes Feld, gültige und ungültige Fälle, Honeypot. `mail.test.ts` prüft Payload-Aufbau für Resend (Empfänger, Reply-To, Betreff, Body enthält alle Felder).
- E2E (Playwright, Chromium): `home.spec.ts` prüft, dass alle 12 Sektionen mit ihren `id`s vorhanden sind, Nav-Anker scrollen, FAQ öffnet, keine Konsolenfehler. `contact.spec.ts` sendet Formular gegen gemockten Endpoint mit Turnstile-Testkey, prüft Erfolgszustand und Fehleranzeige.
- Lighthouse CI lokal vor Deploy, Ziel siehe Abschnitt 1.

## 7. Deploy

- GitHub Repo `setify/setify.de`, Branch `main`, Vercel-Projekt per Git-Integration
- Env-Variablen in Vercel für Production und Preview
- Domain setify.de nach Freigabe von Philipp auf Vercel umziehen (DNS bei aktuellem Registrar), alte WordPress-Instanz danach abschalten
- Redirects: `/kontakt` zu `/#kontakt`, `/cookie-richtlinie-eu/` zu `/datenschutz`, `/2024/08/10/hello-world/` zu `/`, `/category/*` zu `/`

## 8. Offene Punkte für Philipp

- Resend-Account anlegen, Domain verifizieren, API-Key liefern
- Turnstile-Widget anlegen, Site- und Secret-Key liefern
- Bilder für alle Platzhalter (Liste entsteht in `site.ts`)
- Kundenzitate freigeben lassen
- Datenschutztext rechtlich prüfen lassen
- Zeitpunkt für DNS-Umzug festlegen
