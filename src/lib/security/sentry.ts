/**
 * §16.1 error monitoring with PII scrubbing.
 *
 * Every payload leaving the process goes through these scrubbers first —
 * emails, phone numbers, IPs and credential-ish values never reach Sentry
 * or the logs. The Sentry SDK itself is wired at deploy time (Prompt 19)
 * via SENTRY_DSN with `beforeSend: scrubEvent`; until then captureException
 * still logs the scrubbed error so failures are never swallowed.
 */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const IP_RE = /\b\d{1,3}(?:\.\d{1,3}){3}\b/g;
const PHONE_RE = /\+?\d[\d\s().-]{6,}\d/g;
const TOKEN_RE = /\b(bearer|token|secret|api_?key)\s*[=:]\s*[A-Za-z0-9._-]+/gi;

const SENSITIVE_KEY_RE = /password|token|secret|authorization|cookie|api[-_]?key|session/i;

/** Redact PII from a plain string. */
export function scrubPii(text: string): string {
  return text
    .replace(EMAIL_RE, '[EMAIL_REDACTED]')
    .replace(IP_RE, '[IP_REDACTED]')
    .replace(TOKEN_RE, '$1=[TOKEN_REDACTED]')
    .replace(PHONE_RE, '[PHONE_REDACTED]');
}

/** Deep-clone an object, redacting sensitive keys and scrubbing all strings. */
export function scrubPiiFromObject<T>(value: T): T {
  if (typeof value === 'string') {
    return scrubPii(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => scrubPiiFromObject(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = SENSITIVE_KEY_RE.test(key) ? '[REDACTED]' : scrubPiiFromObject(entry);
    }
    return out as unknown as T;
  }
  return value;
}

interface MonitoringEvent {
  user?: { id?: string; email?: string; ip_address?: string };
  request?: { headers?: Record<string, string>; cookies?: Record<string, string> };
  extra?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Sentry beforeSend hook: strip identity, headers, cookies; scrub the rest. */
export function scrubEvent<T extends MonitoringEvent>(event: T): T {
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
  }
  if (event.request?.headers) {
    for (const key of Object.keys(event.request.headers)) {
      if (SENSITIVE_KEY_RE.test(key) || /^x-(forwarded-for|real-ip)$/i.test(key)) {
        delete event.request.headers[key];
      }
    }
  }
  if (event.request?.cookies) {
    event.request.cookies = {};
  }
  if (event.extra) {
    event.extra = scrubPiiFromObject(event.extra);
  }
  return event;
}

/** Report an error with scrubbed context — logs in every environment. */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const scrubbed = context ? scrubPiiFromObject(context) : undefined;
  const message = error instanceof Error ? error.message : String(error);
  console.error('[monitoring]', scrubPii(message), scrubbed ?? '');
}
