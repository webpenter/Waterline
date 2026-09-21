import { describe, expect, it } from 'vitest';

import { checkWaterRule } from './validation';

describe('checkWaterRule — the hard rule (spec §2.2)', () => {
  it('rejects a listing with no water access type', () => {
    const result = checkWaterRule({ waterAccessType: [], distanceToWaterM: 0 });
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('water access type');
  });

  it('rejects a listing with null water access type', () => {
    const result = checkWaterRule({ waterAccessType: null, distanceToWaterM: 10 });
    expect(result.ok).toBe(false);
  });

  it('rejects distanceToWaterM = 51 (the acceptance boundary)', () => {
    const result = checkWaterRule({
      waterAccessType: ['private_dock'],
      distanceToWaterM: 51,
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toContain('51');
    expect(result.reason).toContain('50');
  });

  it('accepts distanceToWaterM = 50 (inclusive boundary)', () => {
    expect(
      checkWaterRule({ waterAccessType: ['private_dock'], distanceToWaterM: 50 }).ok,
    ).toBe(true);
  });

  it('accepts a direct-shore listing at 0 m', () => {
    expect(
      checkWaterRule({ waterAccessType: ['direct_shore'], distanceToWaterM: 0 }).ok,
    ).toBe(true);
  });

  it('rejects a missing distance', () => {
    const result = checkWaterRule({
      waterAccessType: ['private_beach'],
      distanceToWaterM: null,
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a negative distance', () => {
    expect(
      checkWaterRule({ waterAccessType: ['private_beach'], distanceToWaterM: -1 }).ok,
    ).toBe(false);
  });
});
