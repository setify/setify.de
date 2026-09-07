import { site } from '@/content/site';

describe('site content', () => {
  it('has 12 sections with unique ids matching nav anchors', () => {
    const ids = site.sections.map((s) => s.id);
    expect(ids).toHaveLength(12);
    expect(new Set(ids).size).toBe(12);
    for (const link of site.nav.links) {
      expect(ids).toContain(link.href.replace('#', ''));
    }
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
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
