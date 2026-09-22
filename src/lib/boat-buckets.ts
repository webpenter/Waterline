// The five precomputed "Will it fit?" boat-length buckets (§10.1 block 5).
// Plain module: imported by both the server page (to compute counts) and the
// client strip (to snap the slider) — never from a 'use client' file.

export const BOAT_BUCKETS = [8, 18, 28, 40, 60] as const;

/** Conservative bucket: the smallest precomputed LOA >= the chosen length. */
export function bucketFor(loa: number): number {
  return BOAT_BUCKETS.find((b) => b >= loa) ?? BOAT_BUCKETS[BOAT_BUCKETS.length - 1]!;
}
