import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit';

beforeEach(() => resetRateLimit());

describe('checkRateLimit', () => {
  it('allows up to limit within window', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 1000, now: 0 }).allowed).toBe(true);
    }
    expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 1000, now: 10 }).allowed).toBe(false);
  });

  it('resets after window', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('k', { limit: 5, windowMs: 1000, now: 0 });
    expect(checkRateLimit('k', { limit: 5, windowMs: 1000, now: 1001 }).allowed).toBe(true);
  });

  it('tracks keys independently', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('a', { limit: 5, windowMs: 1000, now: 0 });
    expect(checkRateLimit('b', { limit: 5, windowMs: 1000, now: 0 }).allowed).toBe(true);
  });

  it('reports remaining', () => {
    expect(checkRateLimit('r', { limit: 3, windowMs: 1000, now: 0 }).remaining).toBe(2);
  });
});
