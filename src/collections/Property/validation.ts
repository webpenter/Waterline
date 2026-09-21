import { MAX_DISTANCE_TO_WATER_M } from './enums';

export interface WaterRuleInput {
  waterAccessType?: unknown[] | null;
  distanceToWaterM?: number | null;
}

export interface WaterRuleResult {
  ok: boolean;
  reason?: string;
}

/**
 * The hard rule (spec §2.2, CLAUDE.md rule 6): a listing is admissible only with
 * at least one qualifying waterAccessType and distanceToWaterM <= 50.
 * "Sea view" and "walking distance to the lake" are rejections. Never weaken this.
 */
export function checkWaterRule(input: WaterRuleInput): WaterRuleResult {
  const accessTypes = input.waterAccessType ?? [];
  if (!Array.isArray(accessTypes) || accessTypes.length === 0) {
    return {
      ok: false,
      reason:
        'Cannot publish: at least one water access type is required. WATERLINE lists only properties with direct water access — "sea view" or "near the beach" does not qualify.',
    };
  }

  const distance = input.distanceToWaterM;
  if (distance === null || distance === undefined || Number.isNaN(distance)) {
    return {
      ok: false,
      reason:
        'Cannot publish: distance to water is required and must be 50 metres or less.',
    };
  }

  if (distance < 0) {
    return { ok: false, reason: 'Cannot publish: distance to water cannot be negative.' };
  }

  if (distance > MAX_DISTANCE_TO_WATER_M) {
    return {
      ok: false,
      reason: `Cannot publish: distance to water is ${distance} m, above the ${MAX_DISTANCE_TO_WATER_M} m maximum. WATERLINE lists only properties with direct water access.`,
    };
  }

  return { ok: true };
}
