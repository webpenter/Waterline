'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { leadSchema } from '@/lib/schemas/lead';

interface EnquiryFormLabels {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  consentRequired: string;
}

interface EnquiryFormProps {
  /** Omitted for landing-page/contact leads — routed to the internal desk. */
  propertyId?: number;
  source?: 'property' | 'landing' | 'contact' | 'list_with_us';
  locale: string;
  labels: EnquiryFormLabels;
}

/**
 * The listing enquiry form (§10.3, copy §11.2). Posts to /api/leads with a
 * honeypot; consent is mandatory before anything is sent. All labels arrive
 * translated as props — no intl runtime on the client.
 */
export function EnquiryForm({ propertyId, source = 'property', locale, labels }: EnquiryFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'consent'>(
    'idle',
  );
  // Anti-bot timing check: stamped after hydration so SSR markup stays stable.
  const [startedAt, setStartedAt] = useState<number | undefined>(undefined);
  useEffect(() => setStartedAt(Date.now()), []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (data.get('consent') !== 'on') {
      setStatus('consent');
      return;
    }

    const candidate = {
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone') || undefined,
      message: data.get('message') || undefined,
      propertyId,
      source,
      consent: true as const,
      locale,
      website: data.get('website') || undefined,
      startedAt,
    };

    // Shared-schema validation (client side of /src/lib/schemas/lead.ts);
    // the API re-validates authoritatively.
    const parsed = leadSchema.safeParse(candidate);
    if (!parsed.success) {
      setStatus('error');
      return;
    }

    setStatus('sending');
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p role="status" className="border border-success/40 bg-success/10 p-4 text-sm text-success">
        {labels.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <label className="flex flex-col gap-1 text-sm text-ink">
        {labels.name}
        <input
          name="name"
          required
          minLength={2}
          autoComplete="name"
          className="h-10 rounded-md border border-line bg-white px-3 text-base text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        {labels.email}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-10 rounded-md border border-line bg-white px-3 text-base text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        {labels.phone}
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          className="h-10 rounded-md border border-line bg-white px-3 text-base text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink">
        {labels.message}
        <textarea
          name="message"
          rows={4}
          className="rounded-md border border-line bg-white px-3 py-2 text-base text-ink"
        />
      </label>
      {/* Honeypot: visually hidden, tab-skipped; bots fill it, humans never see it. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />
      <label className="flex items-start gap-2 text-xs text-ink-soft">
        <input type="checkbox" name="consent" className="mt-0.5" />
        <span>{labels.consent}</span>
      </label>
      {status === 'consent' ? (
        <p role="alert" className="text-xs text-danger">
          {labels.consentRequired}
        </p>
      ) : null}
      {status === 'error' ? (
        <p role="alert" className="text-xs text-danger">
          {labels.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-abyss px-4 py-3 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-60"
      >
        {status === 'sending' ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
