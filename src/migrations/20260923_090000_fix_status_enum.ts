import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Fix for the initial migration's `status`/`_status` enum collision.
 *
 * The Property collection has a custom `status` field AND Payload drafts
 * (`_status`). The migration generator collapsed both onto
 * `enum_properties_status` with only draft/published, dropping the seven
 * real status values — so any query filtering `status in ('in_market', …)`
 * threw "invalid input value for enum". This adds the missing values back
 * (additive; `published` stays for the drafts `_status` that shares the enum).
 *
 * ADD VALUE IF NOT EXISTS is idempotent, so this is safe on any database
 * whether or not the initial migration left the enum incomplete.
 */
const MISSING = [
  'pending_review',
  'in_market',
  'under_offer',
  'sold',
  'withdrawn',
  'expired',
  'archived',
];
const ENUMS = ['enum_properties_status', 'enum__properties_v_version_status'];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const enumName of ENUMS) {
    for (const value of MISSING) {
      await db.execute(
        sql.raw(`ALTER TYPE "public"."${enumName}" ADD VALUE IF NOT EXISTS '${value}';`),
      );
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Postgres cannot remove enum values; the extra labels are harmless.
}
