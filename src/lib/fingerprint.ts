import { createHash } from 'crypto';

export interface FingerprintInput {
  latitude?: number | null;
  longitude?: number | null;
  propertyType?: string | null;
  builtAreaSqm?: number | null;
  bedrooms?: number | null;
}

const BUILT_AREA_BUCKET_SQM = 50;

/**
 * Deterministic duplicate-detection fingerprint (spec §8.8): rounded coordinates
 * (4 dp ≈ 11 m) + property type + built-area bucket (50 m² bands) + bedroom count.
 * Perceptual hashes of the first three images are added by the import pipeline
 * (Prompt 11) as a second signal; this hash is the primary index key.
 */
export function computeFingerprint(input: FingerprintInput): string {
  const lat = input.latitude != null ? input.latitude.toFixed(4) : 'x';
  const lng = input.longitude != null ? input.longitude.toFixed(4) : 'x';
  const type = input.propertyType ?? 'x';
  const areaBucket =
    input.builtAreaSqm != null
      ? Math.floor(input.builtAreaSqm / BUILT_AREA_BUCKET_SQM) * BUILT_AREA_BUCKET_SQM
      : 'x';
  const beds = input.bedrooms ?? 'x';

  const raw = `${lat},${lng}|${type}|${areaBucket}|${beds}`;
  return createHash('sha256').update(raw).digest('hex');
}
