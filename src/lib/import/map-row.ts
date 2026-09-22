import { parseBool, type RawRow } from './validate-row';

/** Property `data` shape produced from one validated CSV/feed row. */
export type MappedListing = Record<string, unknown>;

const num = (v: string | undefined) => {
  const parsed = Number(v?.trim());
  return v?.trim() && Number.isFinite(parsed) ? parsed : undefined;
};
const text = (v: string | undefined) => (v?.trim() ? v.trim() : undefined);
const multi = (v: string | undefined) =>
  v
    ?.split('|')
    .map((p) => p.trim())
    .filter(Boolean) ?? [];

/**
 * Validated raw row → Property create/update data (§8.4). Import listings are
 * never trusted with lifecycle fields: status is forced to pending_review, the
 * hooks recompute slug/priceEur/fingerprint, and moderation stays unreviewed
 * unless the §8.6 auto-approve path clears it.
 */
export function mapRowToListing(raw: RawRow, agencyId: number): MappedListing {
  const value = (name: string) => raw[name];

  const listing: MappedListing = {
    agency: agencyId,
    sourceType: 'csv_import',
    status: 'pending_review',
    moderation: 'unreviewed',
    visibility: 'public',
    reference: text(value('reference')),
    title: text(value('title_en')),
    propertyType: text(value('property_type')),
    priceType: text(value('price_type')) ?? 'fixed',
    priceAmount: num(value('price_amount')),
    currency: text(value('currency')) ?? 'EUR',
    tenure: text(value('tenure')),
    bedrooms: num(value('bedrooms')),
    bathrooms: num(value('bathrooms')),
    builtAreaSqm: num(value('built_area_sqm')),
    plotAreaSqm: num(value('plot_area_sqm')),
    yearBuilt: num(value('year_built')),
    condition: text(value('condition')),
    waterBodyType: text(value('water_body_type')),
    waterAccessType: multi(value('water_access_types')),
    distanceToWaterM: num(value('distance_to_water_m')),
    waterFrontageM: num(value('water_frontage_m')),
    beachType: text(value('beach_type')),
    orientation: text(value('orientation')),
    swimmableFromProperty: value('swimmable') ? parseBool(value('swimmable') as string) : undefined,
    shorelineTenure: text(value('shoreline_tenure')),
    concessionExpiry: text(value('concession_expiry')),
    floodZone: text(value('flood_zone')),
    waterfrontProtection: text(value('waterfront_protection')),
    mooringType: text(value('mooring_type')),
    berthCount: num(value('berth_count')),
    maxBoatLoaM: num(value('max_boat_loa_m')),
    maxBoatBeamM: num(value('max_boat_beam_m')),
    waterDepthAtBerthM: num(value('water_depth_at_berth_m')),
    navigableToOpenSea: value('navigable_to_open_sea')
      ? parseBool(value('navigable_to_open_sea') as string)
      : undefined,
    fixedBridgesToOpenSea: value('fixed_bridges_to_open_sea')
      ? parseBool(value('fixed_bridges_to_open_sea') as string)
      : undefined,
    minBridgeClearanceM: num(value('min_bridge_clearance_m')),
    nearestMarinaName: text(value('nearest_marina_name')),
    nearestMarinaDistanceKm: num(value('nearest_marina_distance_km')),
    videoUrl: text(value('video_url')),
    virtualTourUrl: text(value('virtual_tour_url')),
    location: {
      country: text(value('country'))?.toUpperCase(),
      region: text(value('region')),
      province: text(value('province')),
      locality: text(value('locality')),
      addressLine: text(value('address_line')),
      coordinates:
        num(value('longitude')) !== undefined && num(value('latitude')) !== undefined
          ? [num(value('longitude')), num(value('latitude'))]
          : undefined,
      coordinatePrecision: text(value('coordinate_precision')) ?? 'exact',
    },
    description: text(value('description_en'))
      ? {
          root: {
            type: 'root',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                type: 'paragraph',
                format: '',
                indent: 0,
                version: 1,
                direction: 'ltr',
                children: [{ type: 'text', version: 1, text: text(value('description_en')) }],
              },
            ],
          },
        }
      : undefined,
  };

  // Strip undefined so partial updates never blank existing values.
  for (const key of Object.keys(listing)) {
    if (listing[key] === undefined) delete listing[key];
  }
  const location = listing.location as Record<string, unknown>;
  for (const key of Object.keys(location)) {
    if (location[key] === undefined) delete location[key];
  }
  return listing;
}

/** Image URLs from a row, capped and deduplicated. */
export function imageUrlsFromRow(raw: RawRow, max = 30): string[] {
  return [...new Set(multi(raw.image_urls))].slice(0, max);
}
