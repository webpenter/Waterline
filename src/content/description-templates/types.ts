/**
 * §13.8 listing-description slot grammar:
 * {OpeningByType} {Positioning} {WaterSentence} {AccommodationSentence}
 * {OutdoorSentence} {NauticalSentence?} {LocationSentence} {ClosingByTier}
 *
 * Each slot holds several variants selected deterministically by listing
 * index, so no two listings read alike and re-running the generator is
 * byte-stable. Numbers always come from the structured fields, never prose.
 */

export type PriceTier = 'standard' | 'premium' | 'trophy';

export interface LocaleTemplates {
  /** Per property type; '_' is the fallback pool. */
  openingByType: Record<string, string[]>;
  positioning: string[];
  waterSentence: string[];
  waterSentenceNoFrontage: string[];
  accommodationSentence: string[];
  outdoorSentence: string[];
  nauticalSentence: string[];
  locationSentence: string[];
  closingByTier: Record<PriceTier, string[]>;
  titleByType: Record<string, string[]>;
  words: {
    beachType: Record<string, string>;
    access: Record<string, string>;
  };
}

export interface DescriptionInput {
  index: number;
  propertyType: string;
  locality: string;
  destinationName: string;
  waterBodyName: string;
  primaryAccess: string;
  beachType: string;
  bedrooms: number;
  bathrooms: number;
  builtAreaSqm: number;
  plotAreaSqm: number;
  terraceAreaSqm: number;
  waterFrontageM: number | null;
  maxBoatLoaM: number | null;
  waterDepthAtBerthM: number | null;
  nearestMarinaName: string;
  nearestMarinaDistanceKm: number;
  approxPriceEur: number;
}

export function priceTier(approxPriceEur: number): PriceTier {
  if (approxPriceEur >= 15_000_000) return 'trophy';
  if (approxPriceEur >= 6_000_000) return 'premium';
  return 'standard';
}

function pick(variants: string[], index: number, slotOffset: number): string {
  if (variants.length === 0) return '';
  return variants[(index + slotOffset) % variants.length] as string;
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

export function composeDescription(
  input: DescriptionInput,
  templates: LocaleTemplates,
): string {
  const values: Record<string, string> = {
    locality: input.locality,
    destination: input.destinationName,
    waterBody: input.waterBodyName,
    frontage: input.waterFrontageM != null ? String(input.waterFrontageM) : '',
    beachType: templates.words.beachType[input.beachType] ?? input.beachType,
    access: templates.words.access[input.primaryAccess] ?? input.primaryAccess,
    bedrooms: String(input.bedrooms),
    bathrooms: String(input.bathrooms),
    builtArea: String(input.builtAreaSqm),
    plotArea: String(input.plotAreaSqm),
    terrace: String(input.terraceAreaSqm),
    loa: input.maxBoatLoaM != null ? String(input.maxBoatLoaM) : '',
    depth: input.waterDepthAtBerthM != null ? String(input.waterDepthAtBerthM) : '',
    marina: input.nearestMarinaName,
    marinaKm: String(input.nearestMarinaDistanceKm),
  };

  const opening = pick(
    templates.openingByType[input.propertyType] ?? templates.openingByType._ ?? [],
    input.index,
    0,
  );
  const water = pick(
    input.waterFrontageM != null ? templates.waterSentence : templates.waterSentenceNoFrontage,
    input.index,
    2,
  );
  const nautical =
    input.maxBoatLoaM != null ? pick(templates.nauticalSentence, input.index, 5) : '';

  const sentences = [
    opening,
    pick(templates.positioning, input.index, 1),
    water,
    pick(templates.accommodationSentence, input.index, 3),
    pick(templates.outdoorSentence, input.index, 4),
    nautical,
    pick(templates.locationSentence, input.index, 6),
    pick(templates.closingByTier[priceTier(input.approxPriceEur)], input.index, 7),
  ].filter(Boolean);

  return sentences.map((sentence) => fill(sentence, values)).join(' ');
}

export function composeTitle(input: DescriptionInput, templates: LocaleTemplates): string {
  const values: Record<string, string> = {
    locality: input.locality,
    access: templates.words.access[input.primaryAccess] ?? input.primaryAccess,
    frontage: input.waterFrontageM != null ? String(input.waterFrontageM) : '',
    waterBody: input.waterBodyName,
    loa: input.maxBoatLoaM != null ? String(input.maxBoatLoaM) : '',
  };
  const variants =
    templates.titleByType[input.propertyType] ?? templates.titleByType._ ?? [];
  return fill(pick(variants, input.index, 0), values).replace(/\s+/g, ' ').trim();
}
