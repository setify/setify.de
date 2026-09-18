import { z } from 'zod';
import { LIMITS, MESSAGES, PHONE_PATTERN, PROJECT_TYPES } from './contact-rules';

export { PROJECT_TYPES };

const trimmed = z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string());
const optionalTrimmed = z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : typeof v === 'string' ? v.trim() : v), z.string().optional());

const schema = z.object({
  firstName: trimmed.pipe(z.string().min(LIMITS.name.min, MESSAGES.firstName).max(LIMITS.name.max, MESSAGES.firstName)),
  lastName: trimmed.pipe(z.string().min(LIMITS.name.min, MESSAGES.lastName).max(LIMITS.name.max, MESSAGES.lastName)),
  email: trimmed.pipe(z.email(MESSAGES.email).max(LIMITS.email.max, MESSAGES.email)),
  phone: optionalTrimmed.pipe(z.string().min(LIMITS.phone.min, MESSAGES.phone).max(LIMITS.phone.max, MESSAGES.phone).regex(PHONE_PATTERN, MESSAGES.phone).optional()),
  projectType: z.enum(PROJECT_TYPES, { error: MESSAGES.projectType }),
  message: trimmed.pipe(z.string().min(LIMITS.message.min, MESSAGES.message).max(LIMITS.message.max, MESSAGES.message)),
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
