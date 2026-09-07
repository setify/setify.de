import { parseContactInput } from '@/lib/contact-schema';

type ApiResponse = { ok: true; dryRun?: boolean } | { ok: false; fieldErrors?: Record<string, string>; message?: string };

function showErrors(form: HTMLFormElement, errors: Record<string, string>): void {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => {
    const name = el.dataset.errorFor!;
    el.textContent = errors[name] ?? '';
    const field = form.elements.namedItem(name) as HTMLElement | RadioNodeList | null;
    if (field && 'setAttribute' in field) {
      field.setAttribute('aria-invalid', errors[name] ? 'true' : 'false');
    }
  });
  const first = Object.keys(errors)[0];
  if (first) {
    const el = form.elements.namedItem(first) as HTMLElement | null;
    el?.focus?.();
  }
}

function setBanner(form: HTMLFormElement, message: string | null): void {
  const banner = form.querySelector<HTMLElement>('[data-contact-error]');
  if (!banner) return;
  banner.textContent = message ?? '';
  banner.classList.toggle('hidden', !message);
}

function showSuccess(root: HTMLElement): void {
  const success = root.querySelector<HTMLElement>('[data-contact-success]');
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!success || !form) return;
  form.setAttribute('aria-hidden', 'true');
  form.style.visibility = 'hidden';
  success.hidden = false;
  success.classList.add('is-visible');
  success.focus?.();
}

export function initContactForm(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return () => {};

  const params = new URLSearchParams(location.search);
  if (params.get('sent') === '1') showSuccess(root);
  if (params.get('error')) setBanner(form, 'Da ist etwas schiefgelaufen. Bitte prüfe deine Angaben oder schreib uns direkt an mail@setify.de.');

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setBanner(form, null);

    const fd = new FormData(form);
    const raw: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (typeof v === 'string') raw[k] = v; });

    const parsed = parseContactInput(raw);
    if (!parsed.ok) {
      showErrors(form, parsed.fieldErrors);
      return;
    }
    showErrors(form, {});

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const label = form.querySelector<HTMLElement>('[data-submit-label]');
    const original = label?.textContent ?? '';
    if (button) button.disabled = true;
    if (label) label.textContent = 'Wird gesendet';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ ...raw, turnstileToken: raw['cf-turnstile-response'] }),
      });
      const data = (await res.json()) as ApiResponse;
      if (data.ok) {
        showSuccess(root);
        return;
      }
      if (data.fieldErrors) showErrors(form, data.fieldErrors);
      setBanner(form, data.message ?? 'Bitte prüfe deine Angaben.');
    } catch {
      setBanner(form, 'Keine Verbindung. Bitte versuche es erneut oder schreib uns an mail@setify.de.');
    } finally {
      if (button) button.disabled = false;
      if (label) label.textContent = original;
    }
  };

  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}
