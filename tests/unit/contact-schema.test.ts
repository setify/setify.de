import { parseContactInput, formDataToObject } from '@/lib/contact-schema';

const valid = {
  name: 'Maria Muster',
  email: 'maria@example.com',
  phone: '+49 221 123456',
  projectType: 'website',
  budget: '5k-10k',
  message: 'Wir brauchen eine neue Website für unser Handwerksunternehmen.',
  consent: 'on',
  'cf-turnstile-response': 'token-123',
  website: '',
};

describe('parseContactInput', () => {
  it('accepts valid input and normalizes it', () => {
    const r = parseContactInput(valid);
    expect(r.ok).toBe(true);
    if (r.ok && !r.honeypot) {
      expect(r.data.name).toBe('Maria Muster');
      expect(r.data.consent).toBe(true);
      expect(r.data.turnstileToken).toBe('token-123');
      expect(r.data.phone).toBe('+49 221 123456');
    }
  });

  it('accepts boolean consent from JSON clients', () => {
    const r = parseContactInput({ ...valid, consent: true });
    expect(r.ok).toBe(true);
  });

  it('treats empty phone as undefined', () => {
    const r = parseContactInput({ ...valid, phone: '' });
    expect(r.ok && !r.honeypot && r.data.phone).toBeUndefined();
  });

  it('flags honeypot without field errors', () => {
    const r = parseContactInput({ ...valid, website: 'http://spam.example' });
    expect(r).toEqual({ ok: true, data: null, honeypot: true });
  });

  it.each([
    ['name', 'M', 'name'],
    ['name', 'x'.repeat(101), 'name'],
    ['email', 'keine-mail', 'email'],
    ['phone', 'abc', 'phone'],
    ['projectType', 'raumschiff', 'projectType'],
    ['budget', 'unendlich', 'budget'],
    ['message', 'zu kurz', 'message'],
    ['message', 'x'.repeat(3001), 'message'],
    ['consent', 'off', 'consent'],
    ['consent', false, 'consent'],
  ])('rejects invalid %s = %j', (field, value, errorKey) => {
    const r = parseContactInput({ ...valid, [field]: value });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fieldErrors)).toContain(errorKey);
  });

  it('reports missing required fields', () => {
    const r = parseContactInput({});
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.fieldErrors).sort()).toEqual(['budget', 'consent', 'email', 'message', 'name', 'projectType']);
    }
  });

  it('returns German error messages', () => {
    const r = parseContactInput({ ...valid, email: 'nope' });
    if (!r.ok) expect(r.fieldErrors.email).toBe('Bitte gib eine gültige E-Mail-Adresse ein.');
  });
});

describe('formDataToObject', () => {
  it('converts FormData to plain object', () => {
    const fd = new FormData();
    fd.set('name', 'A');
    fd.set('consent', 'on');
    expect(formDataToObject(fd)).toEqual({ name: 'A', consent: 'on' });
  });
});
