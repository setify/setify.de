import { test, expect } from '@playwright/test';

test.describe('Kontaktformular', () => {
  test('zeigt Feldfehler bei leerem Absenden', async ({ page }) => {
    await page.goto('/#kontakt');
    await page.getByRole('button', { name: 'Anfrage senden' }).click();
    await expect(page.locator('[data-error-for="name"]')).toHaveText(/Namen/);
    await expect(page.locator('[data-error-for="email"]')).toHaveText(/E-Mail/);
  });

  test('sendet gültige Anfrage und zeigt Erfolg', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      const body = route.request().postDataJSON();
      expect(body.name).toBe('Maria Muster');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });
    await page.goto('/#kontakt');
    await page.fill('#field-name', 'Maria Muster');
    await page.fill('#field-email', 'maria@example.com');
    await page.selectOption('#field-projectType', 'website');
    await page.selectOption('#field-budget', '5k-10k');
    await page.fill('#field-message', 'Wir brauchen eine neue Website für unser Unternehmen in Köln.');
    await page.check('input[name="consent"]');
    await page.getByRole('button', { name: 'Anfrage senden' }).click();
    await expect(page.locator('[data-contact-success]')).toBeVisible();
    await expect(page.locator('[data-contact-success]')).toContainText('Danke, deine Anfrage ist da.');
  });

  test('zeigt Serverfehler', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false, message: 'Versand fehlgeschlagen.' }) }),
    );
    await page.goto('/#kontakt');
    await page.fill('#field-name', 'Maria Muster');
    await page.fill('#field-email', 'maria@example.com');
    await page.selectOption('#field-projectType', 'website');
    await page.selectOption('#field-budget', '5k-10k');
    await page.fill('#field-message', 'Wir brauchen eine neue Website für unser Unternehmen in Köln.');
    await page.check('input[name="consent"]');
    await page.getByRole('button', { name: 'Anfrage senden' }).click();
    await expect(page.locator('[data-contact-error]')).toBeVisible();
    await expect(page.locator('[data-contact-error]')).toContainText('Versand fehlgeschlagen.');
  });

  test('API lehnt ungültige Daten mit 400 ab', async ({ request }) => {
    const res = await request.post('/api/contact', { data: { name: 'x' }, headers: { accept: 'application/json' } });
    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.fieldErrors.email).toBeTruthy();
  });

  test('API akzeptiert gültige Daten im Dry-Run', async ({ request }) => {
    const res = await request.post('/api/contact', {
      headers: { accept: 'application/json' },
      data: {
        name: 'Maria Muster',
        email: 'maria@example.com',
        projectType: 'website',
        budget: '5k-10k',
        message: 'Wir brauchen eine neue Website für unser Unternehmen in Köln.',
        consent: true,
        turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX',
      },
    });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true, dryRun: true });
  });
});
