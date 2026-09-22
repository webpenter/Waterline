/**
 * §8.9 lead routing and SLA logic, pure and unit-tested. The route handler
 * and crons apply these decisions.
 */

export interface RoutingCandidates {
  agentEmail?: string | null;
  agentReceivesLeads?: boolean | null;
  agencyEmail?: string | null;
  internalDesk?: string | null;
}

export interface LeadRecipient {
  to: string;
  tier: 'agent' | 'agency' | 'desk';
}

/** Lead → property.agent if set (and receiving), else the agency inbox, else the internal desk. */
export function resolveLeadRecipient(candidates: RoutingCandidates): LeadRecipient | null {
  if (candidates.agentEmail && candidates.agentReceivesLeads !== false) {
    return { to: candidates.agentEmail, tier: 'agent' };
  }
  if (candidates.agencyEmail) {
    return { to: candidates.agencyEmail, tier: 'agency' };
  }
  if (candidates.internalDesk) {
    return { to: candidates.internalDesk, tier: 'desk' };
  }
  return null;
}

export const UNANSWERED_REMINDER_MS = 48 * 60 * 60 * 1000;

export interface ReminderCandidate {
  status: string;
  createdAt: string;
  reminderSentAt?: string | null;
}

/** §8.9: a lead sitting in new/sent for 48 h earns the agency one reminder. */
export function needsUnansweredReminder(lead: ReminderCandidate, now: Date): boolean {
  if (!['new', 'sent'].includes(lead.status)) return false;
  if (lead.reminderSentAt) return false;
  const createdAt = new Date(lead.createdAt);
  if (Number.isNaN(createdAt.getTime())) return false;
  return now.getTime() - createdAt.getTime() >= UNANSWERED_REMINDER_MS;
}
