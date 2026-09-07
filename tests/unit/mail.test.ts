import { buildContactEmails } from '@/lib/mail';
import type { ContactInput } from '@/lib/contact-schema';

const data: ContactInput = {
  name: 'Maria <Muster>',
  email: 'maria@example.com',
  phone: '+49 221 123456',
  projectType: 'redesign',
  budget: '10k-25k',
  message: 'Zeile eins.\nZeile zwei mit <b>HTML</b>.',
  consent: true,
  turnstileToken: 'x',
};
const env = { RESEND_FROM: 'setify <hallo@setify.de>', CONTACT_TO: 'mail@setify.de' };

describe('buildContactEmails', () => {
  it('addresses owner mail with reply-to sender', () => {
    const { toOwner } = buildContactEmails(data, env);
    expect(toOwner.to).toEqual(['mail@setify.de']);
    expect(toOwner.from).toBe('setify <hallo@setify.de>');
    expect(toOwner.replyTo).toBe('maria@example.com');
    expect(toOwner.subject).toBe('Neue Anfrage: Redesign bestehender Seite, Maria <Muster>');
  });

  it('includes all fields with labels in owner mail', () => {
    const { toOwner } = buildContactEmails(data, env);
    for (const s of ['Maria &lt;Muster&gt;', 'maria@example.com', '+49 221 123456', 'Redesign bestehender Seite', '10.000 bis 25.000 €', 'Zeile eins.<br>Zeile zwei mit &lt;b&gt;HTML&lt;/b&gt;.']) {
      expect(toOwner.html).toContain(s);
    }
    expect(toOwner.text).toContain('Telefon: +49 221 123456');
  });

  it('writes brand lowercase and no em dashes', () => {
    const { toOwner, toSender } = buildContactEmails(data, env);
    for (const m of [toOwner, toSender]) {
      expect(m.html + m.text + m.subject).not.toMatch(/Setify|—/);
    }
  });

  it('sends confirmation to sender without reply-to', () => {
    const { toSender } = buildContactEmails(data, env);
    expect(toSender.to).toEqual(['maria@example.com']);
    expect(toSender.replyTo).toBeUndefined();
    expect(toSender.subject).toBe('Deine Anfrage bei setify');
    expect(toSender.text).toContain('innerhalb eines Werktags');
  });

  it('falls back to defaults when env is empty', () => {
    const { toOwner } = buildContactEmails(data, {});
    expect(toOwner.to).toEqual(['mail@setify.de']);
    expect(toOwner.from).toBe('setify <onboarding@resend.dev>');
  });

  it('omits phone line when phone missing', () => {
    const { toOwner } = buildContactEmails({ ...data, phone: undefined }, env);
    expect(toOwner.text).not.toContain('Telefon:');
  });
});
