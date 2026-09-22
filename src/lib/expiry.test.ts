import { describe, expect, it } from 'vitest';

import { decideExpiryAction } from './expiry';

const NOW = new Date('2026-09-22T12:00:00Z');
const daysFromNow = (days: number) =>
  new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

describe('decideExpiryAction (§8.7)', () => {
  it('expires a backdated listing (the acceptance case)', () => {
    expect(decideExpiryAction({ status: 'in_market', expiresAt: daysFromNow(-1) }, NOW)).toBe(
      'expire',
    );
  });

  it('reminds inside the T-14 window, once per cycle', () => {
    const listing = { status: 'in_market', expiresAt: daysFromNow(10) };
    expect(decideExpiryAction(listing, NOW)).toBe('remind');
    expect(
      decideExpiryAction({ ...listing, expiryReminderSentAt: daysFromNow(-1) }, NOW),
    ).toBe('none');
  });

  it('re-arms the reminder after a confirmation pushes expiresAt forward', () => {
    expect(
      decideExpiryAction(
        {
          status: 'in_market',
          expiresAt: daysFromNow(10),
          // Reminder from the PREVIOUS cycle, before this cycle's threshold.
          expiryReminderSentAt: daysFromNow(-170),
        },
        NOW,
      ),
    ).toBe('remind');
  });

  it('does nothing outside the window or for non-live statuses', () => {
    expect(decideExpiryAction({ status: 'in_market', expiresAt: daysFromNow(60) }, NOW)).toBe(
      'none',
    );
    expect(decideExpiryAction({ status: 'sold', expiresAt: daysFromNow(-5) }, NOW)).toBe('none');
    expect(decideExpiryAction({ status: 'in_market', expiresAt: null }, NOW)).toBe('none');
  });
});

describe('sold lifecycle (§14.5)', async () => {
  const { soldPageIsNoindex, soldPageShouldRetire } = await import('./expiry');
  const NOW = new Date('2026-09-22T12:00:00Z');
  const daysAgo = (d: number) => new Date(NOW.getTime() - d * 24 * 3600_000).toISOString();

  it('keeps sold pages indexable for 30 days, then noindex', () => {
    expect(soldPageIsNoindex({ status: 'sold', updatedAt: daysAgo(29) }, NOW)).toBe(false);
    expect(soldPageIsNoindex({ status: 'sold', updatedAt: daysAgo(31) }, NOW)).toBe(true);
    expect(soldPageIsNoindex({ status: 'in_market', updatedAt: daysAgo(60) }, NOW)).toBe(false);
  });

  it('retires sold pages after 90 days', () => {
    expect(soldPageShouldRetire({ status: 'sold', updatedAt: daysAgo(89) }, NOW)).toBe(false);
    expect(soldPageShouldRetire({ status: 'sold', updatedAt: daysAgo(91) }, NOW)).toBe(true);
    expect(soldPageShouldRetire({ status: 'expired', updatedAt: daysAgo(120) }, NOW)).toBe(false);
  });
});
