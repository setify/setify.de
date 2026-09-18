export type Tone = 'dark' | 'sand';
export type Ratio = '4:5' | '3:2' | '4:3' | '3:4' | '16:9' | '1:1';

/** `prompt` ist die Bildbeschreibung fuer die Produktion. Sie wird nur im
 *  Platzhalter angezeigt, solange unter src/assets/images/ kein Bild mit
 *  passender `id` liegt. */
export interface ImageRef { id: string; ratio: Ratio; label: string; alt: string; prompt?: string }
export interface SectionMeta { id: string; tone: Tone }

export interface KiServiceCard { id: string; number: string; title: string; text: string; points: string[]; icon: string }
export interface KiUseCase { id: string; label: string; title: string; text: string }
export interface KiStep { number: string; title: string; text: string; icon: string }

/** Eigenstaendiger Leistungsbereich unter `path`. Der Startseiten-Teaser
 *  referenziert Karten ueber `teaser.cardIds`, damit Inhalte nur einmal
 *  gepflegt werden. Bewusst ohne Preisfelder. */
export interface KiContent {
  path: string;
  anchor: string;
  navLabel: string;
  banner: { text: string; cta: { label: string; href: string }; dismissLabel: string };
  teaser: { eyebrow: string; title: string; titleAccent: string; lead: string; cardIds: string[]; cta: { label: string; href: string } };
  page: { meta: { title: string; description: string }; hero: { eyebrow: string; title: string; titleAccent: string; statement: string; lead: string; primary: { label: string; href: string }; secondary: { label: string; href: string } } };
  services: { eyebrow: string; title: string; lead: string; items: KiServiceCard[] };
  useCases: { eyebrow: string; title: string; lead: string; items: KiUseCase[] };
  process: { eyebrow: string; title: string; steps: KiStep[] };
  privacy: { eyebrow: string; title: string; text: string; points: string[] };
  faq: { eyebrow: string; title: string; items: { question: string; answer: string }[] };
  cta: { title: string; text: string; primary: { label: string; href: string } };
}

export interface SiteContent {
  meta: { title: string; description: string; url: string; email: string; city: string };
  nav: { links: { label: string; href: string }[]; cta: { label: string; href: string } };
  sections: SectionMeta[];
  hero: { eyebrow: string; title: string; titleAccent: string; lead: string; primary: { label: string; href: string }; secondary: { label: string; href: string }; image: ImageRef };
  trust: { label: string; clients: string[] };
  manifest: { text: string; highlights: string[] };
  services: { eyebrow: string; title: string; lead: string; items: { number: string; title: string; text: string; points: string[]; image: ImageRef }[] };
  process: { eyebrow: string; title: string; steps: { number: string; title: string; text: string; icon: string; image: ImageRef }[] };
  work: { eyebrow: string; title: string; items: { client: string; industry: string; text: string; quote: string; image: ImageRef }[]; testimonials: { quote: string; company: string; logo?: string; pending?: boolean }[] };
  numbers: { eyebrow: string; title: string; lead: string; items: { value: number; suffix: string; label: string; note: string }[] };
  pricing: { eyebrow: string; title: string; note: string; plans: { name: string; price: string; prefix: string; period: string; text: string; features: string[]; cta: string; recommended: boolean }[] };
  industries: { eyebrow: string; title: string; items: { title: string; text: string; image: ImageRef }[] };
  faq: { eyebrow: string; title: string; items: { question: string; answer: string }[] };
  contact: { eyebrow: string; title: string; text: string; success: { title: string; text: string }; projectTypes: { value: string; label: string }[] };
  footer: { claim: string; legal: { label: string; href: string }[] };
  ki: KiContent;
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
      { label: 'KI', href: '/ki' },
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
    { id: 'faq', tone: 'dark' },
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
      { number: '01', title: 'Strategie & Konzept', text: 'Bevor wir gestalten, verstehen wir. Zielgruppe, Wettbewerb, Ziele. Daraus wird eine Struktur, die führt statt verwirrt.', points: ['Briefing-Workshop', 'Seitenarchitektur', 'Content-Plan'], image: { id: 'service-strategie', ratio: '3:2', label: 'Strategie & Konzept', alt: 'Handgezeichnete Sitemap auf Papier mit Karteikarten und Fineliner auf einem Holztisch', prompt: 'Zwei Personen stehen ueber eine helle geoelte Eichenplatte gebeugt und arbeiten gemeinsam an einer Struktur: eine zeichnet mit einem Fineliner Kaesten und Verbindungspfeile in ein Sitemap-Diagramm auf sandfarbenem Papier (#f3eee4), die andere legt eine beschriebene Karteikarte an eine Stelle im Plan und spricht dabei. Halbnah von schraeg oben, Gesichter im Profil oder angeschnitten, kein Blick in die Kamera. Daneben ein Tablet aus gebuerstetem Aluminium mit derselben Struktur digitalisiert. Weiches Nordlicht von links, lange ruhige Schatten, kein Blitz. Palette: Sand #f3eee4 und #eae3d5, Anthrazit #1a1b1e, gebuerstetes Aluminium, ein Goldakzent #bdac89 an einem Messing-Lineal. 35mm, f/2.8, feine Koernung, editorial. Keine Pose, kein Daumen hoch, keine bunten Post-its, keine Stockfoto-Gestik, keine Logos.' } },
      { number: '02', title: 'Design & UX', text: 'Gestaltung, die zu deiner Branche passt und deine Kunden ernst nimmt. Klar, hochwertig, wiedererkennbar.', points: ['Individuelles Design', 'Responsive für alle Geräte', 'Interaktion und Animation'], image: { id: 'service-design', ratio: '3:2', label: 'Design & UX', alt: 'Laptop und Tablet auf Leinenstoff, beide zeigen denselben dunklen Website-Entwurf mit goldenen Akzenten', prompt: 'Zwei Personen an einem hellen Tisch mit sandfarbenem Leinen, im Gespraech ueber einen Entwurf: eine dreht ein Tablet aus gebuerstetem Aluminium zur anderen und deutet auf eine Stelle im Layout, die andere lehnt sich vor und schaut hin. Daneben ein aufgeklappter Laptop mit demselben Entwurf: tiefdunkle anthrazitfarbene Flaeche, blaumetallischer Wellenverlauf im unteren Drittel, grosse fette Headline in hellem Sand, ein Wort davon in Gold. Halbnah, leicht von der Seite, Gesichter im Profil, kein Kamerablick. Weiches Fensterlicht von rechts, weiche Schatten, kein harter Reflex auf den Schirmen. Palette: #f3eee4, #eae3d5, #1a1b1e, Blaumetall #4a5f7c, Akzent #bdac89. 35mm, f/2.8. Keine bunten UI-Kits, kein Neon, kein Glasmorphismus, keine gestellte Begeisterung, keine Logos.' } },
      { number: '03', title: 'Entwicklung & Performance', text: 'Sauberer Code statt Plugin-Stapel. Ladezeiten unter einer Sekunde, Bestwerte in Google PageSpeed, sicher gehostet.', points: ['Moderne Frameworks', 'Performance-Optimierung', 'SEO-Grundlagen'], image: { id: 'service-entwicklung', ratio: '3:2', label: 'Entwicklung & Performance', alt: 'Arbeitsplatz mit Mac mini und Display, im Code-Editor daneben eine Performance-Messung mit 100 Prozent' , prompt: 'Zwei Personen an einem aufgeraeumten Arbeitsplatz, konzentriert im Austausch: eine sitzt an der flachen Aluminiumtastatur, die andere steht daneben, stuetzt sich auf die Tischkante und zeigt auf eine Stelle im Code. Vor ihnen ein grosses Display im Cinema-Stil, gebuerstetes Aluminium, sehr duenner Rahmen, darauf ruhig gesetzter Code in wenigen gedeckten Syntaxfarben und am Rand ein Performance-Ring auf Wert 100. Links angeschnitten ein kleiner Aluminium-Wuerfelrechner im Mac-mini-Format. Gesichter im Profil, kein Kamerablick. Weiches Fensterlicht von rechts plus das kuehle Displaylicht. Palette: gebuerstetes Aluminium, Anthrazit #1a1b1e, Blaumetall #4a5f7c, Goldreflex #bdac89 auf der Aluminiumkante. 35mm, f/2.8. Kein Matrix-Gruen, keine Zahlenkaskaden, keine Hologramme, keine RGB-Beleuchtung, kein Kabelwirrwarr, keine Logos.' } },
      { number: '04', title: 'Betreuung & Wachstum', text: 'Nach dem Launch geht es weiter. Updates, Backups, Anpassungen und Ideen, wie deine Seite mehr Anfragen bringt.', points: ['Monatliche Checks', 'Inhaltspflege', 'Weiterentwicklung'], image: { id: 'service-betreuung', ratio: '3:2', label: 'Betreuung & Wachstum', alt: 'Zwei Personen im Gespräch an einem Tisch, eine zeigt auf den Bildschirm eines Laptops', prompt: 'Drei Personen an einem hellen Besprechungstisch mitten im Gespraech: eine zeigt auf den Bildschirm eines aufgeklappten Laptops und erklaert, eine zweite notiert mit, die dritte hoert zu und lacht kurz. Halbnah im Seitenprofil, Bewegung in Haenden und Haltung, kein Handschlag, kein Blick in die Kamera. Koelner Altbauraum mit hohen Fenstern, diffuses Tageslicht von hinten links, weiche Schatten. Kleidung gedeckt in Sand, Grau und Anthrazit. Palette: #fbf9f4, #eae3d5, #1a1b1e, Goldstich #7a6a4c. 50mm, f/2.8, ruhiger unaufgeraeumter Hintergrund. Keine Anzuege, kein Daumen hoch, keine Meeting-Stockfotografie, keine gestellte Runde um einen Tisch, keine Logos.' } },
    ],
  },
  process: {
    eyebrow: 'So arbeiten wir',
    title: 'Vier Schritte bis zum Launch.',
    steps: [
      { number: '01', title: 'Anfrage', icon: 'search', text: 'Du schreibst uns über das Formular, in zwei Sätzen reicht völlig. Wir melden uns innerhalb eines Werktags, nicht mit einem Standardtext, sondern mit ersten Gedanken zu deinem Vorhaben und einem Terminvorschlag. Wenn wir merken, dass wir nicht die Richtigen sind, sagen wir auch das.', image: { id: 'process-anfrage', ratio: '3:4', label: 'Anfrage', alt: 'Hand skizziert mit einem Stift auf einem Tablet, daneben ein zugeklappter Laptop auf einem Eichentisch', prompt: 'Hochformat 3:4, realistische Fotografie, sehr hell und luftig. Skandinavisches Loft mit weissen Waenden und grossen Industriefenstern mit schlanken schwarzen Sprossen, unscharf im Hintergrund. Im Vordergrund scharf eine Tischplatte aus heller Eiche: eine Hand schreibt mit einem Aluminiumstift Stichpunkte auf ein Tablet, daneben ein geschlossener Aluminium-Laptop, ein schlichtes Keramikgefaess und ein flaches Notizbuch. Viel weiches Tageslicht von links, weiche Schatten, gut durchgezeichnet. Palette: helle Eiche, Sand #f3eee4 und #eae3d5, Anthrazit #1a1b1e, ein Goldakzent #bdac89 an einem Messingdetail. 50mm, f/2.8, natuerliche Hauttoene, korrekte Haende. Nur eine Hand im Bild, kein Gesicht. Kein Altbau, kein Stuck, kein dunkles Holz, keine Aktenordner, kein Desktop-Rechner, keine bunten Post-its, keine Logos.' } },
      { number: '02', title: 'Briefing', icon: 'lightbulb', text: 'In einem strukturierten Gespräch klären wir Ziele, Zielgruppe, Inhalte und Umfang. Wir fragen dabei auch nach dem, was oft untergeht: wer bei dir Inhalte liefert und wie schnell. Danach bekommst du ein festes Angebot mit klarem Leistungsumfang, kein Stundenschätzen und keine Nachforderungen.', image: { id: 'process-briefing', ratio: '3:4', label: 'Briefing', alt: 'Zwei Personen lächeln sich an einem hellen Eichentisch an, zwischen ihnen ein Tablet mit einer Skizze', prompt: 'Hochformat 3:4, realistische Reportagefotografie, sehr hell und luftig. Zwei Personen Ende zwanzig bis Mitte dreissig halbnah im Seitenprofil an einem grossen Tisch aus heller Eiche, freundlich und konzentriert im Gespraech. Eine skizziert auf einem Tablet eine einfache Struktur, die andere lehnt sich vor und zeigt auf eine Stelle. Gesichter im Profil, kein Kamerablick. Skandinavisches Loft: weisse Waende, grosse Industriefenster mit schlanken schwarzen Sprossen, Designstuehle aus hellem Holz, ein Keramikgefaess mit getrockneten Graesern. Diffuses Tageslicht von links, weiche Schatten. Kleidung modern und leger: feiner Strickpullover, Leinenhemd, schlichtes T-Shirt, gedeckte Toene in Sand, Grau und Anthrazit. Palette: helle Eiche, #fbf9f4, #eae3d5, #1a1b1e, Goldstich #7a6a4c. 50mm, f/2.8, natuerliche Hauttoene, korrekte Haende. Kein Altbau, kein Stuck, keine Anzuege, keine Krawatten, kein Handschlag, kein Daumen hoch, keine Meeting-Stockfotografie, keine Logos.' } },
      { number: '03', title: 'Umsetzung', icon: 'penTool', text: 'Design und Entwicklung laufen transparent. Du bekommst früh einen Link auf den Zwischenstand und siehst die Seite wachsen, statt am Ende vor einem fertigen Entwurf zu stehen. Feedback gibst du direkt an der Stelle, an der es dir auffällt, und wir arbeiten es ein, bevor es teuer wird.', image: { id: 'process-umsetzung', ratio: '3:4', label: 'Umsetzung', alt: 'Blick über die Schulter auf einen Laptop mit dunklem Website-Entwurf, daneben ein Tablet mit Wireframe', prompt: 'Hochformat 3:4, realistische Fotografie, sehr hell und ruhig. Enger Ausschnitt ueber die Schulter einer sitzenden Person auf einen aufgeklappten Aluminium-Laptop. Der Bildschirm fuellt ein gutes Drittel des Bildes und zeigt einen Website-Entwurf mitten in Arbeit: dunkle anthrazitfarbene Flaeche, grosse helle Headline, eine goldene Akzentzeile, daneben ein schmales Raster aus Hilfslinien. Auf der Tischplatte aus heller Eiche liegt ein Tablet mit einer Handskizze derselben Seite. Sichtbar sind nur Schulter und Hand, kein Gesicht. Kuehles helles Tageslicht von links durch ein grosses Industriefenster mit schlanken schwarzen Sprossen, weiche Schatten, kein harter Reflex auf dem Schirm. Palette: helle Eiche, gebuerstetes Aluminium, Sand #f3eee4, Anthrazit #1a1b1e, Akzent #bdac89. 50mm, f/2.2, flache Schaerfe mit Fokus auf dem Bildschirm. Kein klobiger Monitor, kein Desktop-Rechner, kein Altbau, keine RGB-Beleuchtung, kein Kabelwirrwarr, keine Logos.' } },
      { number: '04', title: 'Launch & Betreuung', icon: 'rocket', text: 'Wir gehen gemeinsam online und prüfen alles auf echten Geräten, nicht nur im Simulator. Danach bleiben wir ansprechbar: Updates, Backups und Ladezeiten laufen weiter über uns, und wenn du etwas ändern willst, schreibst du einer Person, die dein Projekt kennt.', image: { id: 'process-launch', ratio: '3:4', label: 'Launch & Betreuung', alt: 'Person steht im Abendlicht am Fenster und betrachtet die fertige Website auf dem Smartphone', prompt: 'Hochformat 3:4, realistische Fotografie, warmes Licht am spaeten Nachmittag. Weite Aufnahme in einem hellen skandinavischen Loft: eine Person Mitte dreissig steht entspannt und leicht angelehnt an einem grossen Industriefenster und schaut auf ein Smartphone in der Hand, darauf die fertige Website als dunkle Flaeche mit heller Headline. Die Person steht klein im Bild, viel ruhiger Raum um sie herum. Im Hintergrund unscharf ein offenes Holzregal mit Keramik und ein Tisch aus heller Eiche mit zugeklapptem Laptop. Tief stehende Sonne von rechts wirft lange warme Lichtbahnen ueber den hellen Holzboden. Ganze Figur im Profil, entspannte Haltung, kein Kamerablick. Kleidung modern und leger: Leinenhemd mit hochgekrempelten Aermeln in gedecktem Ton. Palette: helle Eiche, Sand #f3eee4, Anthrazit #1a1b1e, warmer Goldakzent #bdac89. 35mm, f/4, durchgehend scharf. Kein Altbau, keine Anzuege, kein Konfetti, keine Jubelgeste, kein Daumen hoch, keine Logos.' } },
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
    // Wortlaut von setify.de uebernommen. `logo` verweist auf den Dateinamen
    // unter src/assets/logos/. `pending` bliebe fuer noch nicht freigegebene
    // Stimmen, diese fuenf stehen bereits oeffentlich auf der alten Seite.
    testimonials: [
      { quote: 'Wir arbeiten seit Jahren erfolgreich zusammen und konnten unzählige Onlineshops gemeinsam realisieren, die sowohl Besitzern und Kunden immer gefallen haben.', company: 'Tivendo', logo: 'tivendo' },
      { quote: 'Wir konnten uns durch unseren neuen Internetauftritt von der Masse an Wettbewerbern absetzen und unsere Kunden lieben unsere neue Website. Sie versprüht die Qualität unseres Geschäfts.', company: 'Blumen Strunck', logo: 'strunck' },
      { quote: 'Unser Onlineshop ist einfach gelungen. Die Zusammenarbeit und das fertige Ergebnis waren wirklich perfekt.', company: 'Weinhof Rudolstadt', logo: 'weinhof-rudolstadt' },
      { quote: 'Die neue Website mit Shop ist einfach klasse geworden. Unsere Kunden lieben den Shop und wir sind mehr als zufrieden mit dem Ergebnis.', company: 'Berg-Loft Styles', logo: 'berg-loft-styles' },
      { quote: 'Man spürt die Expertise, die in unsere eigenen Ideen mit eingeflossen ist und unsere Projekte wirklich rund gemacht haben.', company: 'Marcel', logo: 'marcel' },
    ],
  },
  numbers: {
    eyebrow: 'In Zahlen',
    title: 'Zwanzig Jahre, auf vier Zahlen gebracht.',
    lead: 'Keine Awards, keine Agenturfolklore. Nur das, was sich nachrechnen lässt.',
    items: [
      { value: 20, suffix: '+', label: 'Jahre Erfahrung', note: 'Vom ersten HTML bis zum heutigen Stack, ohne Unterbrechung.' },
      { value: 100, suffix: '+', label: 'Projekte', note: 'Websites und Shops, viele davon seit Jahren im Einsatz.' },
      { value: 100, suffix: '', label: 'PageSpeed als Ziel', note: 'Gemessen nach dem Launch, nicht im Angebot versprochen.' },
      { value: 1, suffix: '', label: 'Ansprechpartner', note: 'Kein Ticketsystem, keine Weiterleitung. Eine Nummer.' },
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
      { title: 'Industrie', text: 'Komplexe Leistungen klar erklärt, für Kunden wie für Bewerber.', image: { id: 'industry-industrie', ratio: '3:4', label: 'Industrie', alt: 'Facharbeiter mit Schutzbrille prüft ein Metallbauteil vor einer CNC-Maschine' , prompt: 'Hochformat 3:4, realistische Reportagefotografie, helle freundliche Gesamtstimmung. Eine einzelne Person in dunkelblauer Arbeitskleidung und Schutzbrille prueft ein glaenzendes Praezisionsbauteil aus Metall, das sie vor sich haelt. Dahinter klar erkennbar, leicht unscharf: eine moderne CNC-Fertigungsmaschine, Werkstuecke in einer Ablage, eine helle Werkhalle mit grossen Fenstern. Tageslicht flutet den Raum, weiche Schatten, keine Low-Key-Stimmung, gut durchgezeichnet bis in die Tiefen. Unteres Bilddrittel ruhig und detailarm, dort liegt spaeter weisse Schrift. Palette: Anthrazit #1a1b1e, Stahlgrau, Blaumetall #4a5f7c, Goldakzent #bdac89 als Messingreflex am Bauteil. 50mm, f/2.8, natuerliche Hauttoene, echte Materialien, korrekte Haende. Nur eine Person. Keine Funken, kein HDR, keine Warnwesten-Stockfotografie, keine Logos.' } },
      { title: 'Lifestyle', text: 'Ästhetik, die Marke wird. Jedes Detail sitzt.', image: { id: 'industry-lifestyle', ratio: '3:4', label: 'Lifestyle', alt: 'Person räumt Keramik in ein helles Holzregal in einem Concept Store am Schaufenster' , prompt: 'Hochformat 3:4, realistische Fotografie, hell und luftig. Ein kleiner Concept Store oder Showroom, klar als Laden erkennbar: ein offenes Holzregal mit sorgfaeltig praesentierten Produkten, Keramik und Textilien, daneben ein Ladentisch. Eine einzelne Person rueckt ein Objekt im Regal zurecht, halbnah von der Seite, Gesicht im Profil, kein Kamerablick. Grosses Schaufenster von rechts, viel weiches Tageslicht, helle Waende, lange klare Schatten. Unteres Bilddrittel ruhig und detailarm, dort liegt spaeter weisse Schrift. Palette: Sand #f3eee4 und #eae3d5, helles Holz, Anthrazit #1a1b1e, Goldakzent #bdac89 an einem Messingdetail. 50mm, f/2.5, natuerliche Hauttoene, korrekte Haende. Nur eine Person. Keine bunte Deko, kein Pflanzendschungel, keine leere Wohnzimmer-Stimmung, keine Logos.' } },
      { title: 'Handwerk', text: 'Gefunden werden, Vertrauen aufbauen, Anfragen direkt erhalten.', image: { id: 'industry-handwerk', ratio: '3:4', label: 'Handwerk', alt: 'Tischler zieht einen Handhobel über ein Brett, Späne auf der Hobelbank' , prompt: 'Hochformat 3:4, realistische Reportagefotografie, hell ausgeleuchtet. Eine einzelne Tischlerin oder ein Tischler zieht einen Handhobel ueber ein Brett, Spaene kringeln sich auf die Werkbank. Die Werkstatt ist klar erkennbar: Hobelbank, aufgereihte Stechbeitel an der Wand, gestapeltes Holz, alles unscharf im Hintergrund. Grosses Werkstattfenster von links, viel Tageslicht, feiner Staub in der Luft, weiche Schatten, gut durchgezeichnet, keine dunkle Hoehle. Halbnah, Gesicht im Profil, kein Kamerablick. Unteres Bilddrittel ruhig und detailarm, dort liegt spaeter weisse Schrift. Palette: helles Holz, Anthrazit #1a1b1e, Goldakzent #bdac89 an einem Messingwinkel. 50mm, f/2.5, natuerliche Hauttoene, korrekte Haende. Nur eine Person. Kein Daumen hoch, keine Bauhelm-Stockfotografie, keine Logos.' } },
      { title: 'Gastro & Event', text: 'Stimmung, Qualität und Reservierung an einem Ort.', image: { id: 'industry-gastro', ratio: '3:4', label: 'Gastro & Event', alt: 'Servicekraft deckt im Restaurant einen Tisch ein, im Hintergrund die Theke' , prompt: 'Hochformat 3:4, realistische Fotografie, helle warme Stimmung am spaeten Nachmittag. Ein Restaurantraum, klar als Gastronomie erkennbar: mehrere eingedeckte Tische mit Leinen und Glaesern, im Hintergrund unscharf eine Theke mit Flaschenregal. Eine einzelne Person im Service stellt ein Weinglas auf einen Tisch, halbnah von der Seite, Gesicht im Profil, kein Kamerablick. Grosse Fenster von rechts, viel Tageslicht, warme Holztoene, weiche Schatten, gut durchgezeichnet, keine Low-Key-Dunkelheit, keine Kerzen als einzige Lichtquelle. Unteres Bilddrittel ruhig und detailarm, dort liegt spaeter weisse Schrift. Palette: warmes Holz, Sand #eae3d5, Anthrazit #1a1b1e, Goldakzent #bdac89 auf Glas und Besteck. 50mm, f/2.5, natuerliche Hauttoene, korrekte Haende. Nur eine Person im Bild. Kein Essen in Nahaufnahme, keine Menschenmenge, kein Orange-Teal-Grading, keine Logos.' } },
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
  },
  footer: {
    claim: 'Premium Websites aus Köln.',
    legal: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
    ],
  },
  ki: {
    path: '/ki',
    anchor: 'ki',
    navLabel: 'KI',
    banner: {
      text: 'Neu: KI-Beratung und Automatisierung für den Mittelstand.',
      cta: { label: 'Ansehen', href: '/ki' },
      dismissLabel: 'Hinweis schließen',
    },
    teaser: {
      eyebrow: 'Neu im Programm',
      title: 'KI, die arbeitet.',
      titleAccent: 'Nicht beeindruckt.',
      lead: 'Die meisten KI-Projekte scheitern nicht an der Technik. Sie scheitern daran, dass niemand sie in den Alltag einbaut. Wir fangen beim Prozess an, nicht beim Modell.',
      cardIds: ['standort', 'automatisierung', 'assistenten'],
      cta: { label: 'KI-Bereich ansehen', href: '/ki' },
    },
    page: {
      meta: {
        title: 'KI & Automatisierung | setify',
        description: 'KI-Beratung, Workflow-Automatisierung und Assistenten auf deinen Daten. Wir fangen beim Prozess an, nicht beim Modell. Aus Köln, seit über 20 Jahren im Geschäft.',
      },
      hero: {
        eyebrow: 'KI & Automatisierung',
        title: 'KI, die arbeitet.',
        titleAccent: 'Nicht beeindruckt.',
        statement: 'Nicht jeder Prozess braucht KI. Aber fast jedes Unternehmen hat drei, die sie sofort tragen würden.',
        lead: 'Wir sind seit über 20 Jahren in den Abläufen mittelständischer Betriebe unterwegs. Das ist der Grund, warum wir bei KI nicht mit dem Werkzeug anfangen, sondern mit der Frage, wo bei dir tatsächlich Zeit verloren geht.',
        primary: { label: 'Erstgespräch vereinbaren', href: '#kontakt' },
        secondary: { label: 'Anwendungsfälle ansehen', href: '#ki-anwendungen' },
      },
    },
    services: {
      eyebrow: 'Leistungen',
      title: 'Vom Prozess zur Automatisierung.',
      lead: 'Vier Bausteine, die aufeinander aufbauen. Du kannst bei jedem einsteigen und nach jedem aufhören.',
      items: [
        {
          id: 'standort',
          icon: 'compass',
          number: '01',
          title: 'Standortbestimmung',
          text: 'Wir sehen uns an, wo bei dir Zeit verloren geht. Am Ende steht eine Liste mit Aufwand, Nutzen und Reihenfolge, nicht eine Liste mit Tools.',
          points: ['Prozess-Audit im Tagesgeschäft', 'Use-Cases bewertet nach Aufwand und Nutzen', 'Ehrliche Einschätzung, wo KI nichts bringt', 'Fahrplan mit Prioritäten'],
        },
        {
          id: 'automatisierung',
          icon: 'workflow',
          number: '02',
          title: 'Workflow-Automatisierung',
          text: 'Angebote, Rechnungen, Terminbestätigungen, Datenübergaben zwischen Systemen. Alles, was heute jemand von Hand kopiert, läuft danach von selbst.',
          points: ['Anbindung deiner bestehenden Systeme', 'Automatisierungen mit n8n oder Make', 'Fehlerbehandlung und Benachrichtigung', 'Dokumentierte Abläufe, kein Blackbox-Skript'],
        },
        {
          id: 'assistenten',
          icon: 'bot',
          number: '03',
          title: 'Assistenten auf deinen Daten',
          text: 'Ein Assistent, der deine Preisliste kennt, deine Verträge liest und deinem Team antwortet. Nicht das halbe Internet, sondern dein Wissen.',
          points: ['Chat-Assistent für Website oder intern', 'Dokumente auswerten statt durchsuchen', 'Angebunden an CRM, ERP oder Wissensablage', 'Antworten mit Quellenangabe'],
        },
        {
          id: 'betrieb',
          icon: 'graduationCap',
          number: '04',
          title: 'Betrieb & Schulung',
          text: 'Eine Automatisierung, die keiner versteht, wird nach drei Monaten abgeschaltet. Wir übergeben sie so, dass dein Team damit arbeitet.',
          points: ['Monitoring und Kostenkontrolle', 'Schulung für dein Team', 'Anpassung, wenn sich Abläufe ändern', 'DSGVO-Dokumentation inklusive'],
        },
      ],
    },
    useCases: {
      eyebrow: 'Anwendungsfälle',
      title: 'So sieht das in der Praxis aus.',
      lead: 'Vier Beispiele aus den Branchen, in denen wir ohnehin zu Hause sind.',
      items: [
        { id: 'handwerk', label: 'Handwerk', title: 'Angebot in 4 Minuten statt 40', text: 'Aufmaß rein, Angebot raus. Der Assistent zieht Preise aus der Kalkulation und schreibt den Text im Ton des Betriebs. Freigabe bleibt beim Chef.' },
        { id: 'industrie', label: 'Industrie', title: 'Anfragen sortieren sich selbst', text: 'Eingehende Mails werden gelesen, kategorisiert und samt Zusammenfassung an die richtige Person übergeben. Niemand sortiert mehr Posteingang.' },
        { id: 'gastro', label: 'Gastro & Event', title: 'Reservierungen ohne Rückruf', text: 'Anfragen laufen über ein Formular, der Assistent prüft Verfügbarkeit, bestätigt und trägt in den Kalender ein. Der Rückruf entfällt.' },
        { id: 'lifestyle', label: 'Lifestyle', title: 'Produkttexte in deiner Handschrift', text: 'Aus Stichpunkten werden Beschreibungen, die klingen wie deine Marke, weil der Assistent auf deinen bisherigen Texten sitzt.' },
      ],
    },
    process: {
      eyebrow: 'So arbeiten wir',
      title: 'Drei Schritte, kein Wasserfall.',
      steps: [
        { number: '01', title: 'Analyse', icon: 'search', text: 'Ein halber Tag, in dem wir deine Abläufe durchgehen. Danach weißt du, was sich lohnt und was nicht. Zum Festpreis.' },
        { number: '02', title: 'Pilot', icon: 'rocket', text: 'Wir setzen einen Anwendungsfall um, den du in zwei bis vier Wochen im Alltag messen kannst. Ein echter, kein Demoprojekt.' },
        { number: '03', title: 'Ausbau', icon: 'gauge', text: 'Was funktioniert, wird erweitert. Was nicht funktioniert, wird abgeschaltet statt schöngeredet.' },
      ],
    },
    privacy: {
      eyebrow: 'Datenschutz',
      title: 'Deine Daten bleiben deine Daten.',
      text: 'Der häufigste Grund, warum KI im Mittelstand liegen bleibt, ist nicht fehlender Nutzen. Es ist die Unsicherheit, wo die Daten landen. Deshalb klären wir das vor der ersten Zeile Code.',
      points: ['Verarbeitung in der EU, wo immer es geht', 'Keine Weitergabe deiner Inhalte an Modelltraining', 'Auftragsverarbeitungsvertrag inklusive', 'Auf Wunsch Modelle, die bei dir im Haus laufen'],
    },
    faq: {
      eyebrow: 'Fragen',
      title: 'Was du wissen willst.',
      items: [
        { question: 'Brauchen wir dafür eine eigene IT-Abteilung?', answer: 'Nein. Wir bauen, dokumentieren und übergeben. Was dein Team können muss, zeigen wir in einer Schulung. Danach reicht ein Ansprechpartner bei dir, der die Abläufe kennt.' },
        { question: 'Was kostet das?', answer: 'Die Analyse hat einen Festpreis. Für alles danach bekommst du ein Angebot, sobald wir wissen, was tatsächlich gebraucht wird. Kein Stundenschätzen.' },
        { question: 'Was, wenn sich herausstellt, dass sich KI nicht lohnt?', answer: 'Dann sagen wir das. Ein ehrliches Nein nach der Analyse ist günstiger als ein Projekt, das am Ende keiner nutzt.' },
        { question: 'Arbeitet ihr mit ChatGPT?', answer: 'Unter anderem. Wir wählen das Modell nach Aufgabe, Datenschutz und Kosten aus, nicht nach Bekanntheit. Für viele Aufgaben reicht ein kleines, günstiges Modell völlig.' },
        { question: 'Was passiert mit unseren Daten?', answer: 'Sie bleiben deine. Wir verarbeiten in der EU, wo es geht, und deine Inhalte fließen nicht in Modelltraining. Den Auftragsverarbeitungsvertrag bekommst du vor dem Start.' },
        { question: 'Wie schnell sehen wir Ergebnisse?', answer: 'Der erste Anwendungsfall läuft in der Regel nach zwei bis vier Wochen im Alltag. Nicht als Demo, sondern mit echten Daten und echten Nutzern.' },
      ],
    },
    cta: {
      title: 'Lass uns eine Stunde über deine Abläufe reden.',
      text: 'Kostenlos, unverbindlich und ohne Folienschlacht. Danach weißt du, ob sich KI bei dir lohnt und womit du anfangen solltest.',
      primary: { label: 'Erstgespräch vereinbaren', href: '#kontakt' },
    },
  },
};

/** Karten des Startseiten-Teasers, aufgeloest aus `ki.teaser.cardIds`,
 *  damit Teaser und Unterseite dieselben Objekte teilen. */
export const kiTeaserCards = (): KiServiceCard[] =>
  site.ki.teaser.cardIds
    .map((id) => site.ki.services.items.find((s) => s.id === id))
    .filter((s): s is KiServiceCard => Boolean(s));

