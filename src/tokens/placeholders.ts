/**
 * Photography stand-ins from the design preview (§13.2): tonal horizon
 * gradients used wherever a listing has no licensed imagery yet. These are
 * placeholder art, not design tokens — but they live in /src/tokens so the
 * no-hardcoded-colours rule keeps every colour definition in one place.
 * The scrim is §9.3 rule 2, verbatim.
 */

export const HORIZON_GRADIENTS = [
  'linear-gradient(180deg,#D9E6E7 0%,#AFCBD0 30%,#7FAEB8 45%,#2E6274 52%,#12394A 75%,#0B2A38 100%)',
  'linear-gradient(180deg,#E4E9E2 0%,#C2D2CE 32%,#83A9AA 46%,#3C6C74 56%,#14323E 100%)',
  'linear-gradient(180deg,#EDE6DA 0%,#D3C6B1 28%,#8FB0B4 44%,#2F5F70 58%,#0E2C3A 100%)',
  'linear-gradient(180deg,#CFE1E6 0%,#9FC0C8 40%,#35657A 52%,#0B2A38 100%)',
  'linear-gradient(180deg,#E8EDEC 0%,#B9CFD2 38%,#4B7C88 50%,#10303C 100%)',
] as const;

export const PHOTO_SCRIM =
  'linear-gradient(180deg,rgba(8,20,28,0) 40%,rgba(8,20,28,.72) 100%)';

export const HERO_SCRIM =
  'linear-gradient(180deg,rgba(8,20,28,.45) 0%,rgba(8,20,28,0) 35%,rgba(8,20,28,.78) 100%)';

export const HORIZON_LINE = 'rgba(255,255,255,.35)';

/** Deterministic gradient pick so a given listing always shows the same sea. */
export function horizonGradientFor(seed: string | number): string {
  const s = String(seed);
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  const index = Math.abs(hash) % HORIZON_GRADIENTS.length;
  return HORIZON_GRADIENTS[index] as string;
}
