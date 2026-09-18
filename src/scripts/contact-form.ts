import { validateContact } from '@/lib/contact-rules';

type ApiResponse = { ok: true; dryRun?: boolean } | { ok: false; fieldErrors?: Record<string, string>; message?: string };

const FELDER = ['firstName', 'lastName', 'email', 'phone', 'projectType', 'message', 'consent'] as const;

function werte(form: HTMLFormElement): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  new FormData(form).forEach((v, k) => { if (typeof v === 'string') raw[k] = v; });
  return raw;
}

/** Fehler eines einzelnen Feldes setzen oder loeschen, inklusive Haken. */
function setzeFehler(form: HTMLFormElement, name: string, message: string): void {
  const zeile = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  if (zeile) zeile.textContent = message;

  const feld = form.elements.namedItem(name);
  if (feld instanceof HTMLElement) feld.setAttribute('aria-invalid', message ? 'true' : 'false');

  const gruppe = form.querySelector<HTMLElement>(`[data-field="${name}"]`);
  if (!gruppe) return;
  const wert = String(werte(form)[name] ?? '').trim();
  if (!message && wert !== '') gruppe.setAttribute('data-valid', '');
  else gruppe.removeAttribute('data-valid');
}

/** Sammelmeldung zuruecknehmen, sobald keine Feldmeldung mehr steht. */
function aktualisiereBanner(form: HTMLFormElement): void {
  const banner = form.querySelector<HTMLElement>('[data-contact-error]');
  if (!banner || banner.classList.contains('hidden')) return;
  const offen = FELDER.some((name) => form.querySelector<HTMLElement>(`[data-error-for="${name}"]`)?.textContent);
  if (!offen) setBanner(form, null);
}

function alleFehler(form: HTMLFormElement): Record<string, string> {
  return validateContact(werte(form));
}

function showErrors(form: HTMLFormElement, errors: Record<string, string>): void {
  for (const name of FELDER) setzeFehler(form, name, errors[name] ?? '');
  const erstes = FELDER.find((name) => errors[name]);
  if (!erstes) return;
  const el = form.elements.namedItem(erstes);
  if (el instanceof HTMLElement) el.focus();
  else if (el instanceof RadioNodeList && el[0] instanceof HTMLElement) el[0].focus();
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

/** Textfeld waechst mit dem Inhalt, bis zur Hoehe aus der CSS-Regel. */
function passeHoeheAn(el: HTMLTextAreaElement): void {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

function zaehle(form: HTMLFormElement, el: HTMLTextAreaElement): void {
  const anzeige = form.querySelector<HTMLElement>(`[data-counter-for="${el.name}"]`);
  const min = Number(el.dataset.minLength ?? '0');
  if (!anzeige || !min) return;
  const laenge = el.value.trim().length;
  // Erst ab der ersten Eingabe zeigen, sonst wirkt das Feld wie eine Huerde.
  anzeige.textContent = laenge === 0 ? '' : laenge < min ? `noch ${min - laenge} Zeichen` : `${laenge} Zeichen`;
}

export function initContactForm(root: HTMLElement): () => void {
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return () => {};

  const params = new URLSearchParams(location.search);
  if (params.get('sent') === '1') showSuccess(root);
  if (params.get('error')) setBanner(form, 'Da ist etwas schiefgelaufen. Bitte prüfe deine Angaben oder schreib uns direkt an mail@setify.de.');

  const textfeld = form.querySelector<HTMLTextAreaElement>('textarea[data-min-length]');

  // Blur prueft nur befuellte Felder. Ein leeres Feld beim Durchtabben
  // anzumeckern waere richtig, aber unangenehm: der Fehler kommt dann beim
  // Absenden frueh genug.
  const onBlur = (event: FocusEvent) => {
    const ziel = event.target;
    if (!(ziel instanceof HTMLInputElement || ziel instanceof HTMLTextAreaElement)) return;
    const name = ziel.name as (typeof FELDER)[number];
    if (!FELDER.includes(name)) return;
    if (ziel.type !== 'checkbox' && ziel.value.trim() === '') return;
    setzeFehler(form, name, alleFehler(form)[name] ?? '');
    aktualisiereBanner(form);
  };

  // Nach einem gezeigten Fehler bei jeder Eingabe neu pruefen, damit die
  // Meldung verschwindet, sobald sie nicht mehr stimmt.
  const onInput = (event: Event) => {
    const ziel = event.target;
    if (!(ziel instanceof HTMLInputElement || ziel instanceof HTMLTextAreaElement)) return;
    const name = ziel.name as (typeof FELDER)[number];
    if (!FELDER.includes(name)) return;

    if (ziel === textfeld) {
      passeHoeheAn(textfeld);
      zaehle(form, textfeld);
    }

    const zeile = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    const hatteFehler = Boolean(zeile?.textContent);
    if (hatteFehler || ziel.type === 'radio' || ziel.type === 'checkbox') {
      setzeFehler(form, name, alleFehler(form)[name] ?? '');
      aktualisiereBanner(form);
    }
  };

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setBanner(form, null);

    const raw = werte(form);
    const fehler = validateContact(raw);
    if (Object.keys(fehler).length > 0) {
      showErrors(form, fehler);
      const anzahl = Object.keys(fehler).length;
      setBanner(form, anzahl === 1 ? 'Ein Feld fehlt noch.' : `${anzahl} Felder fehlen noch.`);
      return;
    }
    showErrors(form, {});

    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const label = form.querySelector<HTMLElement>('[data-submit-label]');
    const original = label?.textContent ?? '';
    form.setAttribute('aria-busy', 'true');
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
      form.removeAttribute('aria-busy');
      if (button) button.disabled = false;
      if (label) label.textContent = original;
    }
  };

  if (textfeld) passeHoeheAn(textfeld);
  form.addEventListener('focusout', onBlur);
  form.addEventListener('input', onInput);
  form.addEventListener('change', onInput);
  form.addEventListener('submit', onSubmit);

  return () => {
    form.removeEventListener('focusout', onBlur);
    form.removeEventListener('input', onInput);
    form.removeEventListener('change', onInput);
    form.removeEventListener('submit', onSubmit);
  };
}
