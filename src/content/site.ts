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
