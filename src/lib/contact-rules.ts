/**
 * Regeln und Texte des Kontaktformulars, ohne Abhaengigkeiten.
 *
 * Bewusst getrennt von contact-schema.ts: das Zod-Schema laeuft auf dem Server
 * und ist dort die verbindliche Pruefung. Der Browser braucht dieselben Regeln
 * nur, um frueh Rueckmeldung zu geben, und wuerde mit Zod rund 80 KB
 * zusaetzliches JavaScript laden. Beide Seiten lesen hier dieselben Grenzen
 * und Meldungen, damit sie nicht auseinanderlaufen.
 */

export const PROJECT_TYPES = ['website', 'redesign', 'shop', 'performance', 'betreuung', 'sonstiges'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const MESSAGES = {
  firstName: 'Bitte gib deinen Vornamen ein (2 bis 60 Zeichen).',
  lastName: 'Bitte gib deinen Nachnamen ein (2 bis 60 Zeichen).',
  email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  phone: 'Bitte gib eine gültige Telefonnummer ein.',
  projectType: 'Bitte wähle eine Projektart.',
  message: 'Bitte beschreibe dein Projekt (20 bis 3000 Zeichen).',
  consent: 'Bitte bestätige die Datenschutzerklärung.',
} as const;

export const LIMITS = {
  name: { min: 2, max: 60 },
  email: { max: 200 },
  phone: { min: 6, max: 30 },
  message: { min: 20, max: 3000 },
} as const;

export const PHONE_PATTERN = /^[0-9+\-/ ()]+$/;

/** Bewusst genuegsam. Die verbindliche Pruefung macht Zod auf dem Server. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Prueft die Eingaben und liefert je Feld hoechstens eine Meldung.
 * Ein leeres Ergebnis heisst: aus Sicht des Browsers vollstaendig.
 */
export function validateContact(raw: Record<string, unknown>): Record<string, string> {
  const fehler: Record<string, string> = {};

  const firstName = text(raw.firstName);
  if (firstName.length < LIMITS.name.min || firstName.length > LIMITS.name.max) fehler.firstName = MESSAGES.firstName;

  const lastName = text(raw.lastName);
  if (lastName.length < LIMITS.name.min || lastName.length > LIMITS.name.max) fehler.lastName = MESSAGES.lastName;

  const email = text(raw.email);
  if (!EMAIL_PATTERN.test(email) || email.length > LIMITS.email.max) fehler.email = MESSAGES.email;

  // Telefon ist freiwillig, wird aber geprueft, sobald etwas dort steht.
  const phone = text(raw.phone);
  if (phone !== '' && (phone.length < LIMITS.phone.min || phone.length > LIMITS.phone.max || !PHONE_PATTERN.test(phone))) {
    fehler.phone = MESSAGES.phone;
  }

  const projectType = text(raw.projectType);
  if (!(PROJECT_TYPES as readonly string[]).includes(projectType)) fehler.projectType = MESSAGES.projectType;

  const message = text(raw.message);
  if (message.length < LIMITS.message.min || message.length > LIMITS.message.max) fehler.message = MESSAGES.message;

  const consent = raw.consent;
  if (!(consent === true || consent === 'on' || consent === 'true')) fehler.consent = MESSAGES.consent;

  return fehler;
}
