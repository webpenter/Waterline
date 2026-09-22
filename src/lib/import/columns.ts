/**
 * The §8.4 bulk-import column set, verbatim. `required` marks the * columns.
 * The template download and the dry-run validator both derive from this table
 * so they can never drift apart.
 */

export interface ColumnSpec {
  name: string;
  required: boolean;
  kind: 'text' | 'number' | 'int' | 'bool' | 'enum' | 'multi-enum' | 'date' | 'urls';
  enumValues?: readonly string[];
}

import {
  BEACH_TYPES,
  CONDITIONS,
  COORDINATE_PRECISIONS,
  CURRENCIES,
  FEATURES,
  MOORING_TYPES,
  ORIENTATIONS,
  PRICE_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  SHORELINE_TENURES,
  TENURES,
  WATERFRONT_PROTECTIONS,
  WATER_ACCESS_TYPES,
  WATER_BODY_TYPES,
} from '@/collections/Property/enums';

export const IMPORT_COLUMNS: ColumnSpec[] = [
  { name: 'reference', required: true, kind: 'text' },
  { name: 'title_en', required: true, kind: 'text' },
  { name: 'description_en', required: true, kind: 'text' },
  { name: 'property_type', required: true, kind: 'enum', enumValues: PROPERTY_TYPES },
  { name: 'status', required: true, kind: 'enum', enumValues: PROPERTY_STATUSES },
  { name: 'price_type', required: true, kind: 'enum', enumValues: PRICE_TYPES },
  { name: 'price_amount', required: false, kind: 'number' },
  { name: 'currency', required: true, kind: 'enum', enumValues: CURRENCIES },
  { name: 'tenure', required: false, kind: 'enum', enumValues: TENURES },
  { name: 'bedrooms', required: true, kind: 'int' },
  { name: 'bathrooms', required: true, kind: 'int' },
  { name: 'built_area_sqm', required: true, kind: 'number' },
  { name: 'plot_area_sqm', required: false, kind: 'number' },
  { name: 'year_built', required: false, kind: 'int' },
  { name: 'condition', required: false, kind: 'enum', enumValues: CONDITIONS },
  { name: 'water_body_type', required: true, kind: 'enum', enumValues: WATER_BODY_TYPES },
  { name: 'water_body_name', required: false, kind: 'text' },
  { name: 'water_access_types', required: true, kind: 'multi-enum', enumValues: WATER_ACCESS_TYPES },
  { name: 'distance_to_water_m', required: true, kind: 'int' },
  { name: 'water_frontage_m', required: false, kind: 'number' },
  { name: 'beach_type', required: false, kind: 'enum', enumValues: BEACH_TYPES },
  { name: 'orientation', required: false, kind: 'enum', enumValues: ORIENTATIONS },
  { name: 'swimmable', required: false, kind: 'bool' },
  { name: 'shoreline_tenure', required: false, kind: 'enum', enumValues: SHORELINE_TENURES },
  { name: 'concession_expiry', required: false, kind: 'date' },
  { name: 'flood_zone', required: false, kind: 'text' },
  { name: 'waterfront_protection', required: false, kind: 'enum', enumValues: WATERFRONT_PROTECTIONS },
  { name: 'mooring_type', required: false, kind: 'enum', enumValues: MOORING_TYPES },
  { name: 'berth_count', required: false, kind: 'int' },
  { name: 'max_boat_loa_m', required: false, kind: 'number' },
  { name: 'max_boat_beam_m', required: false, kind: 'number' },
  { name: 'water_depth_at_berth_m', required: false, kind: 'number' },
  { name: 'navigable_to_open_sea', required: false, kind: 'bool' },
  { name: 'fixed_bridges_to_open_sea', required: false, kind: 'bool' },
  { name: 'min_bridge_clearance_m', required: false, kind: 'number' },
  { name: 'nearest_marina_name', required: false, kind: 'text' },
  { name: 'nearest_marina_distance_km', required: false, kind: 'number' },
  { name: 'country', required: true, kind: 'text' },
  { name: 'region', required: false, kind: 'text' },
  { name: 'province', required: false, kind: 'text' },
  { name: 'locality', required: true, kind: 'text' },
  { name: 'address_line', required: false, kind: 'text' },
  { name: 'latitude', required: true, kind: 'number' },
  { name: 'longitude', required: true, kind: 'number' },
  { name: 'coordinate_precision', required: false, kind: 'enum', enumValues: COORDINATE_PRECISIONS },
  { name: 'features', required: false, kind: 'multi-enum', enumValues: FEATURES },
  { name: 'image_urls', required: true, kind: 'urls' },
  { name: 'agent_email', required: false, kind: 'text' },
  { name: 'video_url', required: false, kind: 'text' },
  { name: 'virtual_tour_url', required: false, kind: 'text' },
];

export const COLUMN_BY_NAME = new Map(IMPORT_COLUMNS.map((c) => [c.name, c]));
