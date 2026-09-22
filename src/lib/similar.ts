import type { Where } from 'payload';

import type { Property } from '@/payload-types';

// Isolated similar-listings logic (spec Prompt 8) so it can be swapped for
// embeddings later without touching the page: same waterBodyType, then same
// destination OR price within ±35%, comparable frontage, never sold/expired.

export const SIMILAR_PRICE_BAND = 0.35;
/** "Comparable frontage": within this factor either way (half to double). */
export const SIMILAR_FRONTAGE_FACTOR = 2;

function relId(value: unknown): number | undefined {
  if (value == null) return undefined;
  return typeof value === 'object' ? (value as { id?: number }).id : (value as number);
}

/** Pure scoring predicate — unit-tested, engine-independent. */
export function isSimilar(subject: Property, candidate: Property): boolean {
  if (candidate.id === subject.id) return false;
  if (['sold', 'expired', 'withdrawn', 'archived'].includes(candidate.status)) return false;
  if (candidate.waterBodyType !== subject.waterBodyType) return false;

  const sameDestination =
    relId(subject.location?.destination) !== undefined &&
    relId(subject.location?.destination) === relId(candidate.location?.destination);

  const priceComparable =
    subject.priceEur != null &&
    candidate.priceEur != null &&
    candidate.priceEur >= subject.priceEur * (1 - SIMILAR_PRICE_BAND) &&
    candidate.priceEur <= subject.priceEur * (1 + SIMILAR_PRICE_BAND);

  if (!sameDestination && !priceComparable) return false;

  if (subject.waterFrontageM != null && candidate.waterFrontageM != null) {
    const ratio = candidate.waterFrontageM / subject.waterFrontageM;
    if (ratio > SIMILAR_FRONTAGE_FACTOR || ratio < 1 / SIMILAR_FRONTAGE_FACTOR) return false;
  }

  return true;
}

/** Candidate-fetch Where clause: a superset the predicate then narrows. */
export function similarCandidatesWhere(subject: Property): Where {
  const clauses: Where[] = [
    { id: { not_equals: subject.id } },
    { waterBodyType: { equals: subject.waterBodyType } },
    { status: { in: ['in_market', 'under_offer'] } },
  ];
  const or: Where[] = [];
  const destinationId = relId(subject.location?.destination);
  if (destinationId !== undefined) {
    or.push({ 'location.destination': { equals: destinationId } });
  }
  if (subject.priceEur != null) {
    or.push({
      and: [
        { priceEur: { greater_than_equal: Math.round(subject.priceEur * (1 - SIMILAR_PRICE_BAND)) } },
        { priceEur: { less_than_equal: Math.round(subject.priceEur * (1 + SIMILAR_PRICE_BAND)) } },
      ],
    });
  }
  if (or.length > 0) clauses.push({ or });
  return { and: clauses };
}

/** Rank candidates: same destination first, then closest price. */
export function rankSimilar(subject: Property, candidates: Property[], limit = 3): Property[] {
  const destinationId = relId(subject.location?.destination);
  return candidates
    .filter((candidate) => isSimilar(subject, candidate))
    .sort((a, b) => {
      const aDest = relId(a.location?.destination) === destinationId ? 0 : 1;
      const bDest = relId(b.location?.destination) === destinationId ? 0 : 1;
      if (aDest !== bDest) return aDest - bDest;
      const aPrice = Math.abs((a.priceEur ?? 0) - (subject.priceEur ?? 0));
      const bPrice = Math.abs((b.priceEur ?? 0) - (subject.priceEur ?? 0));
      return aPrice - bPrice;
    })
    .slice(0, limit);
}
