import { NextResponse } from 'next/server';
import { Pool } from 'pg';

import packageJson from '../../../../package.json';

async function checkDb(): Promise<boolean> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return false;
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 2000, max: 1 });
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  } finally {
    await pool.end();
  }
}

async function checkSearch(): Promise<boolean> {
  const host = process.env.TYPESENSE_HOST;
  const apiKey = process.env.TYPESENSE_API_KEY;
  if (!host || !apiKey) return false;
  const protocol = process.env.TYPESENSE_PROTOCOL || 'http';
  const port = process.env.TYPESENSE_PORT || '8108';
  try {
    const res = await fetch(`${protocol}://${host}:${port}/health`, {
      headers: { 'X-TYPESENSE-API-KEY': apiKey },
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const [dbOk, searchOk] = await Promise.all([checkDb(), checkSearch()]);

  return NextResponse.json({
    ok: dbOk && searchOk,
    db: dbOk ? 'connected' : 'unreachable',
    search: searchOk ? 'connected' : 'unreachable',
    version: packageJson.version,
  });
}
