import { test, expect } from '@playwright/test';

const SECTION_IDS = ['hero', 'vertrauen', 'manifest', 'leistungen', 'prozess', 'referenzen', 'zahlen', 'preise', 'branchen', 'faq', 'kontakt', 'footer'];

test.describe('Startseite', () => {
  test('rendert alle 12 Sektionen', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
    await page.goto('/');
    for (const id of SECTION_IDS) {
      await expect(page.locator(`#${id}`), `Sektion #${id}`).toHaveCount(1);
    }
    expect(errors).toEqual([]);
  });

  test('Navigation verlinkt auf Anker', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Hauptnavigation' });
    await expect(nav.getByRole('link', { name: 'Leistungen' })).toHaveAttribute('href', '#leistungen');
    await expect(nav.getByRole('link', { name: 'Projekt anfragen' })).toHaveAttribute('href', '#kontakt');
  });

  test('hat Titel und Description', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('setify | Premium Websites aus Köln');
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /setify baut Websites/);
  });

  test('FAQ öffnet zweiten Eintrag', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('#faq-trigger-1');
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#faq-panel-1')).toBeVisible();
  });
});

test.describe('Rechtsseiten', () => {
  test('Impressum enthält Anbieterdaten', async ({ page }) => {
    await page.goto('/impressum');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Impressum');
    await expect(page.getByText('Philipp Walter').first()).toBeVisible();
    await expect(page.getByText('Linder Weg 16a').first()).toBeVisible();
  });

  test('Datenschutz nennt Vercel, Resend und Turnstile, aber kein Webflow', async ({ page }) => {
    await page.goto('/datenschutz');
    const body = await page.locator('main').innerText();
    expect(body).toContain('Vercel');
    expect(body).toContain('Resend');
    expect(body).toContain('Turnstile');
    expect(body).not.toContain('Webflow');
    expect(body).not.toContain('Google Analytics');
  });

  test('alte URLs leiten weiter', async ({ request }) => {
    const res = await request.get('/cookie-richtlinie-eu', { maxRedirects: 0 });
    expect([301, 302, 308]).toContain(res.status());
    expect(res.headers()['location']).toContain('/datenschutz');
  });

  test('Startseite hat JSON-LD', async ({ page }) => {
    await page.goto('/');
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toContain('ProfessionalService');
    expect(ld).toContain('Köln');
  });
});
