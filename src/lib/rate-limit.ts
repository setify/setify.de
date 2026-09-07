interface Bucket { count: number; resetAt: number }

const buckets = new Map<string, Bucket>();

export function resetRateLimit(): void {
  buckets.clear();
}

export function checkRateLimit(key: string, opts: { limit?: number; windowMs?: number; now?: number } = {}): { allowed: boolean; remaining: number } {
  const limit = opts.limit ?? 5;
  const windowMs = opts.windowMs ?? 10 * 60 * 1000;
  const now = opts.now ?? Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
