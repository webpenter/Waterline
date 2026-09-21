// Controlled vocabularies for Property, verbatim from spec §6.1–§6.5.
// CLAUDE.md rule 5: controlled enums over free text, always.

export const PROPERTY_STATUSES = [
  'draft',
  'pending_review',
  'in_market',
  'under_offer',
  'sold',
  'withdrawn',
  'expired',
  'archived',
] as const;

export const MODERATION_STATES = [
  'unreviewed',
  'approved',
  'rejected',
  'changes_requested',
] as const;

export const VISIBILITIES = ['public', 'unlisted', 'private'] as const;

export const SOURCE_TYPES = ['manual', 'csv_import', 'xml_feed', 'api'] as const;

export const PRICE_TYPES = ['fixed', 'on_request', 'auction', 'poa'] as const;

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'AED', 'SGD'] as const;

export const PRICE_QUALIFIERS = ['guide', 'asking', 'offers_over', 'reduced'] as const;

export const TENURES = [
  'freehold',
  'leasehold',
  'concession',
  'fractional',
  'share_transfer',
] as const;

export const PROPERTY_TYPES = [
  'villa',
  'apartment',
  'penthouse',
  'estate',
  'farmhouse',
  'chalet',
  'townhouse',
  'castle',
  'lighthouse',
  'boathouse',
  'private_island',
  'land_plot',
  'marina_residence',
  'development_project',
  'hotel_resort',
] as const;

export const CONDITIONS = ['new', 'renovated', 'good', 'to_renovate', 'shell'] as const;

export const FEATURES = [
  'pool',
  'infinity_pool',
  'heated_pool',
  'gym',
  'spa',
  'sauna',
  'staff_quarters',
  'helipad',
  'tennis',
  'vineyard',
  'olive_grove',
  'solar',
  'geothermal',
  'elevator',
  'gated',
  'smart_home',
  'guest_house',
  'garage',
  'wine_cellar',
  'cinema',
] as const;

export const WATER_BODY_TYPES = [
  'sea',
  'ocean',
  'lake',
  'river',
  'lagoon',
  'canal',
  'fjord',
  'bay',
  'estuary',
  'reservoir',
  'marina_basin',
] as const;

export const WATER_ACCESS_TYPES = [
  'private_beach',
  'shared_beach',
  'direct_shore',
  'private_dock',
  'private_mooring',
  'marina_berth_included',
  'boathouse',
  'slipway',
  'seawall_quay',
  'rock_platform',
  'riparian_access',
  'whole_island',
] as const;

export const BEACH_TYPES = ['sand', 'pebble', 'rock', 'mixed', 'none'] as const;

export const ORIENTATIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export const WATERFRONT_PROTECTIONS = [
  'natural',
  'seawall',
  'riprap',
  'breakwater',
  'pier_only',
] as const;

export const SHORELINE_TENURES = [
  'private_to_waterline',
  'private_to_high_water',
  'public_easement',
  'state_concession',
  'riparian_rights',
] as const;

export const MOORING_TYPES = [
  'none',
  'buoy',
  'jetty',
  'pontoon',
  'fixed_dock',
  'floating_dock',
  'boat_lift',
  'dry_dock',
  'marina_berth',
] as const;

export const COORDINATE_PRECISIONS = ['exact', 'approximate_500m', 'hidden'] as const;

// The hard rule from spec §2.2: distanceToWaterM above this blocks publication.
export const MAX_DISTANCE_TO_WATER_M = 50;

// Spec §8.7: listings expire this many days after publication without confirmation.
export const LISTING_LIFETIME_DAYS = 180;

export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];
export type Currency = (typeof CURRENCIES)[number];
export type WaterAccessType = (typeof WATER_ACCESS_TYPES)[number];
