import type { Instrumentation } from 'next';

/**
 * §16.1/§17 server-side error monitoring (Prompt 19).
 *
 * Next invokes onRequestError for every unhandled server error. Errors are
 * PII-scrubbed (lib/security/sentry) and, when SENTRY_DSN is set, forwarded
 * to Sentry via its envelope endpoint with a plain fetch — the full
 * @sentry/nextjs SDK would wrap the client bundle and threaten the §12.1
 * budgets, and its server half duplicates what this hook already receives.
 * Without a DSN the scrubbed error still lands in the structured logs
 * (Vercel captures stderr), so nothing is ever swallowed.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const { scrubPii, scrubPiiFromObject } = await import('@/lib/security/sentry');

  const message = error instanceof Error ? error.message : String(error);
  const scrubbedMessage = scrubPii(message);
  const meta = scrubPiiFromObject({
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
  });

  console.error('[server-error]', scrubbedMessage, JSON.stringify(meta));

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  try {
    // Minimal Sentry envelope: https://develop.sentry.dev/sdk/envelopes/
    const { host, pathname, username } = new URL(dsn);
    const projectId = pathname.replace(/\//g, '');
    const endpoint = `https://${host}/api/${projectId}/envelope/?sentry_key=${username}&sentry_version=7`;
    const eventId = crypto.randomUUID().replace(/-/g, '');
    const timestamp = new Date().toISOString();

    const event = {
      event_id: eventId,
      timestamp,
      platform: 'node',
      level: 'error',
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      exception: {
        values: [
          {
            type: error instanceof Error ? error.name : 'Error',
            value: scrubbedMessage,
            stacktrace:
              error instanceof Error && error.stack
                ? { frames: [{ function: scrubPii(error.stack).slice(0, 2000) }] }
                : undefined,
          },
        ],
      },
      extra: meta,
    };

    const envelope =
      JSON.stringify({ event_id: eventId, sent_at: timestamp }) +
      '\n' +
      JSON.stringify({ type: 'event' }) +
      '\n' +
      JSON.stringify(event) +
      '\n';

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body: envelope,
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Monitoring must never take the request down with it.
  }
};
