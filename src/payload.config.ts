import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './collections/Users/index';
import { Media } from './collections/Media';
import { Property } from './collections/Property';
import { Agency } from './collections/Agency';
import { Agent } from './collections/Agent';
import { WaterBody } from './collections/WaterBody';
import { Destination } from './collections/Destination';
import { Lead } from './collections/Lead';
import { LandingPage } from './collections/LandingPage';
import { Taxonomy } from './collections/Taxonomy';
import { Article } from './collections/Article';
import { Page } from './collections/Page';
import { Redirect } from './collections/Redirect';
import { AuditLog } from './collections/AuditLog';
import { ConsentRecord } from './collections/ConsentRecord';
import { ImportJob } from './collections/ImportJob';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- WATERLINE Backoffice',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  localization: {
    locales: ['en', 'it', 'fr', 'de', 'es', 'ru'],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [
    Users,
    Media,
    Property,
    Agency,
    Agent,
    WaterBody,
    Destination,
    Lead,
    LandingPage,
    Taxonomy,
    Article,
    Page,
    Redirect,
    AuditLog,
    ImportJob,
    ConsentRecord,
  ],
  editor: lexicalEditor({}),
  secret: process.env['PAYLOAD_SECRET'] || 'dev_secret_change_me_in_production_min_32_chars',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env['DATABASE_URL'] ||
        'postgresql://postgres:waterline_dev_password@localhost:5432/waterline',
      // Bound each connection attempt so an unreachable database fails fast
      // instead of stalling page renders behind multi-second dials.
      connectionTimeoutMillis: 3000,
    },
  }),
  sharp,
});
