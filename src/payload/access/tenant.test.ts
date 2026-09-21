import { describe, expect, it } from 'vitest';

import { adminOnly, adminOrEditor, tenant } from './tenant';

type AccessArgs = Parameters<ReturnType<typeof tenant>>[0];

function reqFor(user: Record<string, unknown> | null): AccessArgs {
  return { req: { user } } as unknown as AccessArgs;
}

const admin = { id: 1, role: 'admin' };
const editor = { id: 2, role: 'editor' };
const agencyAdminA = { id: 3, role: 'agency_admin', agency: 10 };
const agentA = { id: 4, role: 'agency_agent', agency: 10, agentProfile: 100 };

describe('tenant() — the §8.1 access function', () => {
  it('denies anonymous users', () => {
    expect(tenant()(reqFor(null))).toBe(false);
  });

  it('gives admin and editor unrestricted access by default', () => {
    expect(tenant()(reqFor(admin))).toBe(true);
    expect(tenant()(reqFor(editor))).toBe(true);
  });

  it('scopes agency_admin to their own agency', () => {
    expect(tenant()(reqFor(agencyAdminA))).toEqual({ agency: { equals: 10 } });
  });

  it('scopes agency_agent to their own docs when an agentField is set', () => {
    expect(tenant({ agentField: 'agent' })(reqFor(agentA))).toEqual({
      and: [{ agency: { equals: 10 } }, { agent: { equals: 100 } }],
    });
  });

  it('denies an agency user with no agency set (never leaks cross-tenant)', () => {
    expect(tenant()(reqFor({ id: 9, role: 'agency_admin' }))).toBe(false);
    expect(tenant({ agentField: 'agent' })(reqFor({ id: 9, role: 'agency_agent', agency: 10 }))).toBe(
      false,
    );
  });

  it('supports custom full-access roles (audit log: admin only + agency_admin scope)', () => {
    const access = tenant({ fullRoles: ['admin'], denyAgents: true });
    expect(access(reqFor(editor))).toBe(false);
    expect(access(reqFor(agencyAdminA))).toEqual({ agency: { equals: 10 } });
    expect(access(reqFor(agentA))).toBe(false);
  });

  it('resolves populated relationship objects to ids', () => {
    const populated = { id: 5, role: 'agency_admin', agency: { id: 42 } };
    expect(tenant()(reqFor(populated))).toEqual({ agency: { equals: 42 } });
  });

  it('scopes by a custom agency field (agencies collection scopes by id)', () => {
    expect(tenant({ agencyField: 'id' })(reqFor(agencyAdminA))).toEqual({ id: { equals: 10 } });
  });

  it('denies unknown roles outright', () => {
    expect(tenant()(reqFor({ id: 6, role: 'superuser', agency: 10 }))).toBe(false);
  });
});

describe('role helpers', () => {
  it('adminOnly admits only admin', () => {
    expect(adminOnly(reqFor(admin))).toBe(true);
    expect(adminOnly(reqFor(editor))).toBe(false);
    expect(adminOnly(reqFor(agencyAdminA))).toBe(false);
  });

  it('adminOrEditor admits the two content roles', () => {
    expect(adminOrEditor(reqFor(admin))).toBe(true);
    expect(adminOrEditor(reqFor(editor))).toBe(true);
    expect(adminOrEditor(reqFor(agentA))).toBe(false);
  });
});
