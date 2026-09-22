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
