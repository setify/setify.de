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
  let ip = 'unknown';
  try {
    ip = clientAddress || ip;
  } catch {
    /* clientAddress unavailable in this environment */
  }
  if (ip === 'unknown') {
    ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  }

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
