import { Resend } from 'resend';
import type { ContactInput } from './contact-schema';

export interface MailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  CONTACT_TO?: string;
}

export interface MailPayload {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

const PROJECT_LABELS: Record<ContactInput['projectType'], string> = {
  website: 'Neue Website',
  redesign: 'Redesign bestehender Seite',
  shop: 'Shop oder Portal',
  performance: 'Performance und SEO',
  betreuung: 'Betreuung und Wartung',
  sonstiges: 'Sonstiges',
};

const DEFAULT_FROM = 'setify <onboarding@resend.dev>';
const DEFAULT_TO = 'mail@setify.de';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f3eee4;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#1a1b1e">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fbf9f4;border-radius:16px;overflow:hidden">
<tr><td style="height:4px;background:linear-gradient(90deg,#7a6a4c,#bdac89,#e3d6b8)"></td></tr>
<tr><td style="padding:32px">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7a6a4c;font-weight:700">setify</p>
<h1 style="margin:0 0 24px;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-weight:600;font-size:26px;line-height:1.2">${title}</h1>
${body}
<p style="margin:32px 0 0;font-size:12px;color:#6b665c">setify, Philipp Walter, Linder Weg 16a, 51147 Köln, mail@setify.de</p>
</td></tr></table></td></tr></table></body></html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#6b665c;vertical-align:top;width:140px">${label}</td><td style="padding:8px 0;font-size:15px;line-height:1.5">${value}</td></tr>`;
}

export function buildContactEmails(data: ContactInput, env: MailEnv): { toOwner: MailPayload; toSender: MailPayload } {
  const from = env.RESEND_FROM || DEFAULT_FROM;
  const to = env.CONTACT_TO || DEFAULT_TO;
  const project = PROJECT_LABELS[data.projectType];
  const name = `${data.firstName} ${data.lastName}`;

  const ownerRows = [
    row('Name', escapeHtml(name)),
    row('E-Mail', `<a href="mailto:${escapeHtml(data.email)}" style="color:#7a6a4c">${escapeHtml(data.email)}</a>`),
    data.phone ? row('Telefon', escapeHtml(data.phone)) : '',
    row('Projektart', escapeHtml(project)),
    row('Nachricht', nl2br(data.message)),
  ].join('');

  const ownerText = [
    `Neue Anfrage über setify.de`,
    ``,
    `Name: ${name}`,
    `E-Mail: ${data.email}`,
    data.phone ? `Telefon: ${data.phone}` : null,
    `Projektart: ${project}`,
    ``,
    `Nachricht:`,
    data.message,
  ].filter((l) => l !== null).join('\n');

  const toOwner: MailPayload = {
    from,
    to: [to],
    replyTo: data.email,
    subject: `Neue Anfrage: ${project}, ${name}`,
    html: layout('Neue Anfrage über setify.de', `<table role="presentation" cellspacing="0" cellpadding="0" width="100%">${ownerRows}</table>`),
    text: ownerText,
  };

  const senderBody = `<p style="font-size:15px;line-height:1.6;margin:0 0 16px">Hallo ${escapeHtml(data.firstName)},</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 16px">danke für deine Anfrage. Sie ist bei uns angekommen. Wir melden uns innerhalb eines Werktags persönlich bei dir.</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 16px">Zur Erinnerung, das hast du uns geschrieben:</p>
<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:2px solid #bdac89;background:#f3eee4;font-size:14px;line-height:1.6">${nl2br(data.message)}</blockquote>
<p style="font-size:15px;line-height:1.6;margin:0">Bis bald,<br>Philipp von setify</p>`;

  const toSender: MailPayload = {
    from,
    to: [data.email],
    subject: 'Deine Anfrage bei setify',
    html: layout('Deine Anfrage ist angekommen.', senderBody),
    text: `Hallo ${data.firstName},\n\ndanke für deine Anfrage. Sie ist bei uns angekommen. Wir melden uns innerhalb eines Werktags persönlich bei dir.\n\nDas hast du uns geschrieben:\n${data.message}\n\nBis bald,\nPhilipp von setify\n\nsetify, Philipp Walter, Linder Weg 16a, 51147 Köln, mail@setify.de`,
  };

  return { toOwner, toSender };
}

export async function sendContactEmails(data: ContactInput, env: MailEnv): Promise<{ sent: boolean; dryRun: boolean }> {
  const { toOwner, toSender } = buildContactEmails(data, env);

  if (!env.RESEND_API_KEY) {
    console.info('[contact] RESEND_API_KEY fehlt, Dry-Run. Owner-Mail:', toOwner.subject, 'an', toOwner.to.join(','));
    return { sent: false, dryRun: true };
  }

  const resend = new Resend(env.RESEND_API_KEY);
  const owner = await resend.emails.send({ from: toOwner.from, to: toOwner.to, replyTo: toOwner.replyTo, subject: toOwner.subject, html: toOwner.html, text: toOwner.text });
  if (owner.error) {
    throw new Error(`Resend owner mail failed: ${owner.error.message}`);
  }
  const sender = await resend.emails.send({ from: toSender.from, to: toSender.to, subject: toSender.subject, html: toSender.html, text: toSender.text });
  if (sender.error) {
    console.warn('[contact] Bestätigungsmail fehlgeschlagen:', sender.error.message);
  }
  return { sent: true, dryRun: false };
}
