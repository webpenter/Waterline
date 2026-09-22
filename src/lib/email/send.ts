import { brand } from '@/config/brand';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** §8.9: lead mail goes out from our domain with reply-to the enquirer. */
  replyTo?: string;
}

/**
 * Transactional email seam. With RESEND_API_KEY set it sends through Resend;
 * without it the message is logged and dropped so cron jobs and imports never
 * fail on mail. Templates live in ./templates and render to html + the
 * required plain-text fallback (§11.5).
 */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith('re_dev')) {
    console.info(`[email:noop] to=${message.to} subject="${message.subject}"`);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.AGENCY_NOTIFY_FROM ?? brand.email.noreply,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn(`[email] Resend responded ${res.status} for "${message.subject}"`);
    }
    return res.ok;
  } catch (err) {
    console.warn('[email] send failed:', err);
    return false;
  }
}
