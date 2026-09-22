import {
  BEACH_TYPES,
  ORIENTATIONS,
  PROPERTY_TYPES,
  TENURES,
  WATER_ACCESS_TYPES,
  WATER_BODY_TYPES,
} from '@/collections/Property/enums';

import type { PropertyFilters } from './filters';

export type SearchParams = Record<string, string | string[] | undefined>;

const SORTS = ['price_asc', 'price_desc', 'frontage_desc', 'newest'] as const;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function csv(value: string | string[] | undefined): string[] {
  const raw = first(value);
  return raw ? raw.split(',').map((v) => v.trim()).filter(Boolean) : [];
}

function csvOf(value: string | string[] | undefined, allowed: readonly string[]): string[] {
  return csv(value).filter((v) => allowed.includes(v));
}

function num(value: string | string[] | undefined): number | undefined {
  const raw = first(value);
  if (raw === undefined || raw === '') return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function bool(value: string | string[] | undefined): boolean {
  const raw = first(value);
  return raw === '1' || raw === 'true';
}

/**
 * The §5.5 search URL contract → PropertyFilters. Filter state lives in the
 * URL and is shareable; every value is validated against its controlled enum
 * and silently dropped when invalid — a hand-edited URL can never break the
 * page or smuggle arbitrary values into a query.
 */
export function parseSearchParams(params: SearchParams): PropertyFilters {
  const filters: PropertyFilters = {};

  const water = csvOf(params.water, WATER_BODY_TYPES);
  if (water.length) filters.waterBodyTypes = water;

  const access = csvOf(params.access, WATER_ACCESS_TYPES);
  if (access.length) filters.waterAccessTypes = access;

  const minFrontage = num(params.minFrontage);
  if (minFrontage !== undefined) filters.minFrontageM = minFrontage;

  const boatLoa = num(params.boatLoa);
  if (boatLoa !== undefined) filters.boatLoaM = boatLoa;
  const draft = num(params.draft);
  if (draft !== undefined) filters.boatDraftM = draft;
  const beam = num(params.beam);
  if (beam !== undefined) filters.boatBeamM = beam;

  if (bool(params.openSea)) filters.navigableToOpenSea = true;
  if (bool(params.noBridges)) filters.noFixedBridges = true;
  const clearance = num(params.clearance);
  if (clearance !== undefined) filters.minBridgeClearanceM = clearance;

  const price = first(params.price);
  if (price) {
    const [min, max] = price.split('-');
    const minParsed = num(min);
    const maxParsed = num(max);
    if (minParsed !== undefined) filters.priceMinEur = minParsed;
    if (maxParsed !== undefined) filters.priceMaxEur = maxParsed;
  }

  const types = csvOf(params.type, PROPERTY_TYPES);
  if (types.length) filters.propertyTypes = types;

  const beds = num(params.beds);
  if (beds !== undefined) filters.bedsMin = beds;
  const baths = num(params.baths);
  if (baths !== undefined) filters.bathsMin = baths;
  const minBuilt = num(params.minBuilt);
  if (minBuilt !== undefined) filters.minBuiltSqm = minBuilt;
  const minPlot = num(params.minPlot);
  if (minPlot !== undefined) filters.minPlotSqm = minPlot;

  const orientations = csvOf(params.orientation, ORIENTATIONS);
  if (orientations.length) filters.orientations = orientations;
  const beaches = csvOf(params.beach, BEACH_TYPES);
  if (beaches.length) filters.beachTypes = beaches;
  const tenures = csvOf(params.tenure, TENURES);
  if (tenures.length) filters.tenures = tenures;

  const country = first(params.country);
  if (country && /^[A-Za-z]{2}$/.test(country)) filters.country = country.toUpperCase();

  const bbox = csv(params.bbox).map(Number);
  if (bbox.length === 4 && bbox.every((v) => Number.isFinite(v))) {
    const [west, south, east, north] = bbox as [number, number, number, number];
    if (west < east && south < north) filters.bbox = { west, south, east, north };
  }

  const sort = first(params.sort);
  if (sort && SORTS.includes(sort as (typeof SORTS)[number])) {
    filters.sort = sort as PropertyFilters['sort'];
  }

  const page = num(params.page);
  if (page !== undefined && page >= 1) filters.page = Math.floor(page);

  return filters;
}

/** Names of the URL params that carry an active filter (for pills + empty state). */
export function activeFilterParams(params: SearchParams): string[] {
  const filterKeys = [
    'water',
    'access',
    'minFrontage',
    'boatLoa',
    'draft',
    'beam',
    'openSea',
    'noBridges',
    'clearance',
    'price',
    'type',
    'beds',
    'baths',
    'minBuilt',
    'minPlot',
    'orientation',
    'beach',
    'tenure',
    'country',
    'bbox',
  ];
  return filterKeys.filter((key) => {
    const parsed = parseSearchParams({ [key]: params[key] });
    return Object.keys(parsed).length > 0;
  });
}

/** Rebuild the query string without one param (the "relax {filter}" link). */
export function queryWithout(params: SearchParams, remove: string[]): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (remove.includes(key) || value === undefined) continue;
    // boatLoa and draft travel together: relaxing the boat filter drops both.
    query.set(key, Array.isArray(value) ? value.join(',') : value);
  }
  query.delete('page');
  const str = query.toString();
  return str ? `?${str}` : '';
}
