import { site } from '@/content/site';

describe('site content', () => {
  it('has unique section ids', () => {
    const ids = site.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Seit /ki kann ein Menuepunkt entweder eine Sprungmarke auf der Startseite
  // oder ein eigener Pfad sein. Beides muss ein Ziel haben.
  it('points every nav link at an existing anchor or page', () => {
    const anker = new Set(site.sections.map((s) => s.id));
    const seiten = new Set([site.ki.path]);
    for (const link of site.nav.links) {
      if (link.href.startsWith('#')) {
        expect(anker).toContain(link.href.slice(1));
      } else {
        expect(seiten).toContain(link.href);
      }
    }
  });

  it('keeps the KI teaser anchor addressable', () => {
    expect(site.ki.anchor).toBe('ki');
    expect(site.ki.teaser.cta.href).toBe(site.ki.path);
  });

  it('spells the brand lowercase everywhere', () => {
    const json = JSON.stringify(site);
    expect(json).not.toMatch(/Setify/);
  });

  it('contains no em dashes', () => {
    expect(JSON.stringify(site)).not.toMatch(/—/);
  });

  it('has prices from the spec', () => {
    const single = site.pricing.plans.find((p) => p.name === 'Website Single');
    const abo = site.pricing.plans.find((p) => p.name === 'Website Abo');
    expect(single?.price).toBe('4.790 €');
    expect(abo?.price).toBe('690 €');
    expect(abo?.recommended).toBe(true);
  });

  it('has unique image placeholder ids', () => {
    const ids = [
      site.hero.image.id,
      ...site.services.items.map((s) => s.image.id),
      ...site.work.items.map((w) => w.image.id),
      ...site.industries.items.map((i) => i.image.id),
      ...site.process.steps.map((p) => p.image.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
