import { z } from 'zod';

export const PROJECT_TYPES = ['website', 'redesign', 'shop', 'performance', 'betreuung', 'sonstiges'] as const;

const MESSAGES = {
  firstName: 'Bitte gib deinen Vornamen ein (2 bis 60 Zeichen).',
  lastName: 'Bitte gib deinen Nachnamen ein (2 bis 60 Zeichen).',
  email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  phone: 'Bitte gib eine gültige Telefonnummer ein.',
  projectType: 'Bitte wähle eine Projektart.',
  message: 'Bitte beschreibe dein Projekt (20 bis 3000 Zeichen).',
  consent: 'Bitte bestätige die Datenschutzerklärung.',
} as const;

const trimmed = z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string());
const optionalTrimmed = z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : typeof v === 'string' ? v.trim() : v), z.string().optional());

const schema = z.object({
  firstName: trimmed.pipe(z.string().min(2, MESSAGES.firstName).max(60, MESSAGES.firstName)),
  lastName: trimmed.pipe(z.string().min(2, MESSAGES.lastName).max(60, MESSAGES.lastName)),
  email: trimmed.pipe(z.email(MESSAGES.email).max(200, MESSAGES.email)),
  phone: optionalTrimmed.pipe(z.string().min(6, MESSAGES.phone).max(30, MESSAGES.phone).regex(/^[0-9+\-/ ()]+$/, MESSAGES.phone).optional()),
  projectType: z.enum(PROJECT_TYPES, { error: MESSAGES.projectType }),
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
