import { describe, expect, it } from 'vitest';
import { validateContact } from '@/lib/contact-rules';
import { parseContactInput } from '@/lib/contact-schema';

/**
 * Die schlanke Browser-Pruefung und das Zod-Schema auf dem Server muessen
 * dieselben Felder bemaengeln. Sonst meldet das Formular "alles gut" und der
 * Server antwortet trotzdem mit einem Fehler.
 */
const gueltig = {
  firstName: 'Maria',
  lastName: 'Muster',
  email: 'maria@example.com',
  phone: '+49 221 123456',
  projectType: 'redesign',
  message: 'Wir brauchen eine neue Website mit Shop und Terminbuchung.',
  consent: 'on',
};

const faelle: Record<string, Record<string, unknown>> = {
  'alles gueltig': gueltig,
  'ohne Telefon': { ...gueltig, phone: '' },
  'Vorname zu kurz': { ...gueltig, firstName: 'M' },
  'Nachname fehlt': { ...gueltig, lastName: '' },
  'E-Mail ohne Punkt': { ...gueltig, email: 'maria@example' },
  'E-Mail ohne At': { ...gueltig, email: 'maria.example.com' },
  'Telefon mit Buchstaben': { ...gueltig, phone: '0221 abc' },
  'Telefon zu kurz': { ...gueltig, phone: '12' },
  'Projektart unbekannt': { ...gueltig, projectType: 'irgendwas' },
  'Projektart leer': { ...gueltig, projectType: '' },
  'Nachricht zu kurz': { ...gueltig, message: 'Zu kurz.' },
  'Zustimmung fehlt': { ...gueltig, consent: '' },
  'alles leer': {},
};

const schemaFehler = (raw: Record<string, unknown>): string[] => {
  const parsed = parseContactInput(raw);
  return parsed.ok ? [] : Object.keys(parsed.fieldErrors).sort();
};

describe('contact rules', () => {
  for (const [name, raw] of Object.entries(faelle)) {
    it(`meldet dieselben Felder wie das Schema: ${name}`, () => {
      expect(Object.keys(validateContact(raw)).sort()).toEqual(schemaFehler(raw));
    });
  }

  it('nutzt denselben Meldungstext wie das Schema', () => {
    const raw = { ...gueltig, email: 'kaputt' };
    const parsed = parseContactInput(raw);
    expect(parsed.ok).toBe(false);
    if (parsed.ok) return;
    expect(validateContact(raw).email).toBe(parsed.fieldErrors.email);
  });

  it('laesst Leerraum am Rand durchgehen', () => {
    expect(validateContact({ ...gueltig, firstName: '  Maria  ' })).toEqual({});
  });
});
