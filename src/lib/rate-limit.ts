import { NextResponse, type NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const stores = new Map<string, Map<string, number[]>>();

/**
 * In-memory sliding-window rate limiter per key namespace.
 * E.g., rateLimit(req, 'search', { windowMs: 60000, max: 60 })
 */
export function checkRateLimit(
  request: NextRequest,
  namespace: string,
  config: RateLimitConfig,
): { success: boolean; limit: number; remaining: number; reset: number } {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  const store = stores.get(namespace)!;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const now = Date.now();
  const windowStart = now - config.windowMs;

  const timestamps = (store.get(ip) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  store.set(ip, timestamps);

  // Periodic cleanup of stale IPs from store
  if (store.size > 5000) {
    for (const [key, times] of store.entries()) {
      if (!times.some((t) => t > windowStart)) {
        store.delete(key);
      }
    }
  }

  const success = timestamps.length <= config.max;
  const remaining = Math.max(0, config.max - timestamps.length);
  const reset = Math.ceil((now + config.windowMs) / 1000);

  return { success, limit: config.max, remaining, reset };
}

export function rateLimitResponse(limitResult: ReturnType<typeof checkRateLimit>): NextResponse {
  return NextResponse.json(
    { ok: false, error: 'Too Many Requests' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limitResult.limit),
        'X-RateLimit-Remaining': String(limitResult.remaining),
        'X-RateLimit-Reset': String(limitResult.reset),
        'Retry-After': String(Math.ceil((limitResult.reset * 1000 - Date.now()) / 1000)),
      },
    },
  );
}
