import { timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export type WebhookSecretType = 'revalidate' | 'cron' | 'feed_ingest';

const SECRET_ENV_MAP: Record<WebhookSecretType, string> = {
  revalidate: 'REVALIDATE_SECRET',
  cron: 'CRON_SECRET',
  feed_ingest: 'FEED_INGEST_SECRET',
};

/**
 * Spec §16.1 Signed Webhooks:
 * Validates incoming webhook authorization token / secret using timing-safe comparison.
 */
export function verifyWebhookSignature(
  request: NextRequest,
  type: WebhookSecretType,
  providedToken?: string,
): boolean {
  const envKey = SECRET_ENV_MAP[type];
  const expectedSecret = process.env[envKey];

  if (!expectedSecret) {
    // If no expected secret configured, reject requests in production or allow when explicitly tested
    return false;
  }

  // Check query parameter, Authorization header (Bearer ...), or explicitly passed token
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : undefined;

  const queryToken = request.nextUrl.searchParams.get('secret');

  const tokenToVerify = providedToken || tokenFromHeader || queryToken;

  if (!tokenToVerify) return false;

  try {
    const expectedBuf = Buffer.from(expectedSecret);
    const actualBuf = Buffer.from(tokenToVerify);

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }

    return timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}
