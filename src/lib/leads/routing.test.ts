import { describe, expect, it } from 'vitest';

import { needsUnansweredReminder, resolveLeadRecipient } from './routing';

describe('resolveLeadRecipient (§8.9 chain: agent → agency → desk)', () => {
  const full = {
    agentEmail: 'agent@a.example',
    agentReceivesLeads: true,
    agencyEmail: 'inbox@a.example',
    internalDesk: 'desk@waterline.example',
  };

  it('prefers the listing agent', () => {
    expect(resolveLeadRecipient(full)).toEqual({ to: 'agent@a.example', tier: 'agent' });
  });

  it('skips an agent who opted out of leads', () => {
    expect(resolveLeadRecipient({ ...full, agentReceivesLeads: false })).toEqual({
      to: 'inbox@a.example',
      tier: 'agency',
    });
  });

  it('falls back to the agency inbox, then the internal desk', () => {
    expect(resolveLeadRecipient({ ...full, agentEmail: null })).toEqual({
      to: 'inbox@a.example',
      tier: 'agency',
    });
    expect(
      resolveLeadRecipient({ internalDesk: 'desk@waterline.example' }),
    ).toEqual({ to: 'desk@waterline.example', tier: 'desk' });
  });

  it('returns null when nothing is configured', () => {
    expect(resolveLeadRecipient({})).toBeNull();
  });
});

describe('needsUnansweredReminder (§8.9 48 h SLA)', () => {
  const NOW = new Date('2026-09-22T12:00:00Z');
  const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();

  it('reminds for new/sent leads older than 48 h, once', () => {
    expect(needsUnansweredReminder({ status: 'new', createdAt: hoursAgo(49) }, NOW)).toBe(true);
    expect(needsUnansweredReminder({ status: 'sent', createdAt: hoursAgo(72) }, NOW)).toBe(true);
    expect(
      needsUnansweredReminder(
        { status: 'sent', createdAt: hoursAgo(72), reminderSentAt: hoursAgo(1) },
        NOW,
      ),
    ).toBe(false);
  });

  it('never reminds for fresh, viewed, qualified or spam leads', () => {
    expect(needsUnansweredReminder({ status: 'new', createdAt: hoursAgo(47) }, NOW)).toBe(false);
    for (const status of ['viewed', 'qualified', 'spam']) {
      expect(needsUnansweredReminder({ status, createdAt: hoursAgo(100) }, NOW)).toBe(false);
    }
  });
});
