const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string | undefined, secret: string | undefined, ip?: string): Promise<{ ok: boolean; skipped: boolean }> {
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY fehlt, Pruefung uebersprungen');
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
