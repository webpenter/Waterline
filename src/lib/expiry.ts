/**
 * §8.7 listing freshness: expiresAt = publishedAt + 180 days. At T-14 the
 * agency gets a one-click confirmation email; on expiry the listing leaves
 * search and its URL returns 410. Pure decision function — the cron applies it.
 */

export const REMINDER_WINDOW_DAYS = 14;

export interface ExpiryCandidate {
  status: string;
  expiresAt?: string | null;
  expiryReminderSentAt?: string | null;
  lastVerifiedAt?: string | null;
}

export type ExpiryAction = 'expire' | 'remind' | 'none';

// §14.5 sold lifecycle: the page stays live 90 days with a banner, goes
// noindex after 30, then 301s to the parent landing page. updatedAt stands in
// for the sold date — status changes touch updatedAt, and a later edit only
// extends the courtesy window (never truncates it).
export const SOLD_NOINDEX_AFTER_DAYS = 30;
export const SOLD_RETIRE_AFTER_DAYS = 90;

export interface SoldCandidate {
  status: string;
  updatedAt: string;
}

export function soldPageIsNoindex(listing: SoldCandidate, now: Date): boolean {
  if (listing.status !== 'sold') return false;
  const since = new Date(listing.updatedAt);
  if (Number.isNaN(since.getTime())) return false;
  return now.getTime() - since.getTime() >= SOLD_NOINDEX_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

export function soldPageShouldRetire(listing: SoldCandidate, now: Date): boolean {
  if (listing.status !== 'sold') return false;
  const since = new Date(listing.updatedAt);
  if (Number.isNaN(since.getTime())) return false;
  return now.getTime() - since.getTime() >= SOLD_RETIRE_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

export function decideExpiryAction(listing: ExpiryCandidate, now: Date): ExpiryAction {
  if (!['in_market', 'under_offer'].includes(listing.status)) return 'none';
  if (!listing.expiresAt) return 'none';

  const expiresAt = new Date(listing.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) return 'none';

  if (expiresAt <= now) return 'expire';

  const reminderThreshold = new Date(
    expiresAt.getTime() - REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
  if (now >= reminderThreshold) {
    // Remind once per expiry cycle: a confirmation (lastVerifiedAt bump via
    // the one-click link) pushes expiresAt forward, re-arming the reminder.
    const remindedAt = listing.expiryReminderSentAt
      ? new Date(listing.expiryReminderSentAt)
      : null;
    if (!remindedAt || remindedAt < reminderThreshold) return 'remind';
  }
  return 'none';
}
