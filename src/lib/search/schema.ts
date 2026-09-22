import type { PropertyFilters } from '@/lib/db/filters';

export const PROPERTIES_ALIAS = 'properties';

/**
 * Typesense collection schema carrying every §10.2 facet plus a geopoint.
 * Postgres remains the source of truth; this index is rebuilt atomically by
 * fullReindex() and patched incrementally from the Property hooks.
 */
export const PROPERTY_SEARCH_SCHEMA = {
  fields: [
    { name: 'slug', type: 'string' as const },
    { name: 'title', type: 'string' as const },
    { name: 'status', type: 'string' as const, facet: true },
    { name: 'isSample', type: 'bool' as const, facet: true },
    { name: 'priceEur', type: 'int64' as const, optional: true, facet: true },
    { name: 'propertyType', type: 'string' as const, facet: true, optional: true },
    { name: 'waterBodyType', type: 'string' as const, facet: true, optional: true },
    { name: 'waterAccessType', type: 'string[]' as const, facet: true, optional: true },
    { name: 'waterFrontageM', type: 'float' as const, optional: true, facet: true },
    { name: 'beachType', type: 'string' as const, facet: true, optional: true },
    { name: 'orientation', type: 'string' as const, facet: true, optional: true },
    { name: 'tenure', type: 'string' as const, facet: true, optional: true },
    { name: 'maxBoatLoaM', type: 'float' as const, optional: true },
    { name: 'maxBoatBeamM', type: 'float' as const, optional: true },
    { name: 'waterDepthAtBerthM', type: 'float' as const, optional: true },
    { name: 'navigableToOpenSea', type: 'bool' as const, facet: true, optional: true },
    { name: 'fixedBridgesToOpenSea', type: 'bool' as const, optional: true },
    { name: 'minBridgeClearanceM', type: 'float' as const, optional: true },
    { name: 'bedrooms', type: 'int32' as const, optional: true, facet: true },
    { name: 'bathrooms', type: 'int32' as const, optional: true },
    { name: 'builtAreaSqm', type: 'float' as const, optional: true },
    { name: 'plotAreaSqm', type: 'float' as const, optional: true },
    { name: 'country', type: 'string' as const, facet: true, optional: true },
    { name: 'destinationId', type: 'int64' as const, facet: true, optional: true },
    { name: 'location', type: 'geopoint' as const, optional: true },
    { name: 'approximate', type: 'bool' as const, optional: true },
    { name: 'publishedAtTs', type: 'int64' as const, optional: true },
  ],
  default_sorting_field: '',
};

function esc(value: string): string {
  return value.replace(/[`\\]/g, '');
}

function inClause(field: string, values: string[]): string {
  return `${field}:=[${values.map((v) => `\`${esc(v)}\``).join(',')}]`;
}

/** PropertyFilters → Typesense filter_by. Mirrors filtersToWhere exactly. */
export function filtersToTypesense(filters: PropertyFilters): string {
  const parts: string[] = [
    'status:=[`in_market`,`under_offer`]',
  ];
  if (process.env.SAMPLE_DATA_ENABLED !== 'true') parts.push('isSample:=false');

  if (filters.priceMinEur != null) parts.push(`priceEur:>=${filters.priceMinEur}`);
  if (filters.priceMaxEur != null) parts.push(`priceEur:<=${filters.priceMaxEur}`);

  if (filters.waterBodyTypes?.length) parts.push(inClause('waterBodyType', filters.waterBodyTypes));
  if (filters.waterAccessTypes?.length)
    parts.push(inClause('waterAccessType', filters.waterAccessTypes));
  if (filters.minFrontageM != null) parts.push(`waterFrontageM:>=${filters.minFrontageM}`);

  if (filters.boatLoaM != null) parts.push(`maxBoatLoaM:>=${filters.boatLoaM}`);
  if (filters.boatDraftM != null) parts.push(`waterDepthAtBerthM:>=${filters.boatDraftM}`);
  if (filters.boatBeamM != null) parts.push(`maxBoatBeamM:>=${filters.boatBeamM}`);
  if (filters.navigableToOpenSea) parts.push('navigableToOpenSea:=true');
  if (filters.noFixedBridges) parts.push('fixedBridgesToOpenSea:=false');
  if (filters.minBridgeClearanceM != null)
    parts.push(
      `(fixedBridgesToOpenSea:=false || minBridgeClearanceM:>=${filters.minBridgeClearanceM})`,
    );

  if (filters.propertyTypes?.length) parts.push(inClause('propertyType', filters.propertyTypes));
  if (filters.bedsMin != null) parts.push(`bedrooms:>=${filters.bedsMin}`);
  if (filters.bathsMin != null) parts.push(`bathrooms:>=${filters.bathsMin}`);
  if (filters.minBuiltSqm != null) parts.push(`builtAreaSqm:>=${filters.minBuiltSqm}`);
  if (filters.minPlotSqm != null) parts.push(`plotAreaSqm:>=${filters.minPlotSqm}`);

  if (filters.orientations?.length) parts.push(inClause('orientation', filters.orientations));
  if (filters.beachTypes?.length) parts.push(inClause('beachType', filters.beachTypes));
  if (filters.tenures?.length) parts.push(inClause('tenure', filters.tenures));

  if (filters.country) parts.push(`country:=\`${esc(filters.country)}\``);
  if (filters.destinationId != null) parts.push(`destinationId:=${filters.destinationId}`);
  if (filters.status) parts.push(`status:=\`${filters.status}\``);

  if (filters.bbox) {
    const { west, south, east, north } = filters.bbox;
    // Typesense polygon filter: lat,lng pairs.
    parts.push(
      `location:(${south},${west},${south},${east},${north},${east},${north},${west})`,
    );
  }

  return parts.join(' && ');
}

export function sortToTypesense(sort: PropertyFilters['sort']): string {
  switch (sort) {
    case 'price_asc':
      return 'priceEur:asc';
    case 'price_desc':
      return 'priceEur:desc';
    case 'frontage_desc':
      return 'waterFrontageM:desc';
    case 'newest':
    default:
      return 'publishedAtTs:desc';
  }
}

export const FACET_BY = [
  'waterBodyType',
  'waterAccessType',
  'propertyType',
  'beachType',
  'orientation',
  'tenure',
  'country',
  'bedrooms',
  'navigableToOpenSea',
].join(',');
