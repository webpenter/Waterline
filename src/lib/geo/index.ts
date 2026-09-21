import { createHash } from 'crypto';

import type { Where } from 'payload';

export type LngLat = [longitude: number, latitude: number];

export interface Bbox {
  west: number;
  south: number;
  east: number;
  north: number;
}

const EARTH_METERS_PER_DEGREE_LAT = 111_320;

/** GeoJSON polygon (closed ring, lng/lat order) from a map bounding box. */
export function bboxToPolygon({ west, south, east, north }: Bbox): {
  type: 'Polygon';
  coordinates: number[][][];
} {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],
      ],
    ],
  };
}

/** Payload Where clause: point field inside a bounding box. */
export function withinBboxWhere(field: string, bbox: Bbox): Where {
  return { [field]: { within: bboxToPolygon(bbox) } };
}

/** Payload Where clause: point field within `maxMeters` of a location. */
export function nearWhere(field: string, center: LngLat, maxMeters: number): Where {
  return { [field]: { near: [center[0], center[1], maxMeters] } };
}

/**
 * Raw PostGIS predicate for hand-written SQL (materialised views, EXPLAIN
 * checks). Parameter placeholders: $1=lng, $2=lat, $3=meters.
 */
export function stDWithinSql(column = 'coordinates'): string {
  return `ST_DWithin(${column}::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)`;
}

/** Raw PostGIS predicate for a bounding box: $1=west, $2=south, $3=east, $4=north. */
export function bboxSql(column = 'coordinates'): string {
  return `${column} && ST_MakeEnvelope($1, $2, $3, $4, 4326)`;
}

/**
 * Privacy jitter (spec §6.6): for approximate_500m listings the public point is
 * deterministically offset by up to `radiusM`, seeded by the listing id — so it
 * NEVER moves between requests, and the exact point never leaves the server.
 */
export function jitterCoordinates(
  exact: LngLat,
  seed: string | number,
  radiusM = 500,
): LngLat {
  const hash = createHash('sha256').update(String(seed)).digest();
  // Two independent uniform values in [0, 1) from the hash.
  const u1 = hash.readUInt32BE(0) / 0xffffffff;
  const u2 = hash.readUInt32BE(4) / 0xffffffff;

  const angle = u1 * 2 * Math.PI;
  // sqrt for uniform density over the disc; keep at least 40% out so the
  // jittered point is never accidentally the true one.
  const distance = radiusM * (0.4 + 0.6 * Math.sqrt(u2));

  const [lng, lat] = exact;
  const dLat = (distance * Math.cos(angle)) / EARTH_METERS_PER_DEGREE_LAT;
  const metersPerDegreeLng =
    EARTH_METERS_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180) || 1e-6;
  const dLng = (distance * Math.sin(angle)) / metersPerDegreeLng;

  return [Number((lng + dLng).toFixed(6)), Number((lat + dLat).toFixed(6))];
}

/** Great-circle distance in metres (haversine) — used in tests and getSimilar. */
export function distanceMeters(a: LngLat, b: LngLat): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
