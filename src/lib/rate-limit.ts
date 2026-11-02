/**
 * Best-effort fixed-window rate limiter held in memory. Effective on a single
 * long-running Node.js server; it resets on restart and is not shared between
 * processes, so use a shared store (e.g. Redis) if the app runs on several.
 */
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function check(
    key: string,
    now = Date.now(),
  ): { ok: boolean; retryAfterS: number } {
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfterS: 0 };
    }
    entry.count += 1;
    return {
      ok: entry.count <= limit,
      retryAfterS: Math.ceil((entry.resetAt - now) / 1000),
    };
  };
}
