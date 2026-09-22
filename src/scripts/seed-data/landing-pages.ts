/**
 * The §14.4 hand-seeded landing combinations. Consumed by `pnpm seed`
 * (Prompt 13) to create LandingPage records as DRAFTS: §13.9 forbids
 * publishing statistics or market claims produced from memory, so every
 * record ships without editorial copy and stays behind the §5.4
 * published-and-non-empty gate until the sourced content pass writes its
 * 300–500-word intro. Publishing one is then a CMS action, not a deploy.
 */

export interface LandingSeed {
  slug: string;
  title: string;
  propertyType?: string;
  waterBodyType?: string;
  country?: string;
  /** Destination display name; the seed script resolves/creates the record. */
  destinationName?: string;
}

export const LANDING_PAGE_SEEDS: LandingSeed[] = [
  { slug: 'villas-sea-liguria', title: 'Villas with direct sea access in Liguria', propertyType: 'villa', waterBodyType: 'sea', country: 'IT', destinationName: 'Liguria' },
  { slug: 'lakefront-villas-como', title: 'Lakefront villas on Lake Como', propertyType: 'villa', waterBodyType: 'lake', country: 'IT', destinationName: 'Lake Como' },
  { slug: 'seafront-villas-amalfi-coast', title: 'Seafront villas on the Amalfi Coast', propertyType: 'villa', waterBodyType: 'sea', country: 'IT', destinationName: 'Amalfi Coast' },
  { slug: 'private-dock-homes-florida-keys', title: 'Homes with a private dock in the Florida Keys', waterBodyType: 'sea', country: 'US', destinationName: 'Florida Keys' },
  { slug: 'waterfront-homes-hamptons', title: 'Waterfront homes in the Hamptons', country: 'US', destinationName: 'The Hamptons' },
  { slug: 'beachfront-villas-mallorca', title: 'Beachfront villas in Mallorca', propertyType: 'villa', waterBodyType: 'sea', country: 'ES', destinationName: 'Mallorca' },
  { slug: 'private-beach-villas-ibiza', title: 'Villas with a private beach in Ibiza', propertyType: 'villa', waterBodyType: 'sea', country: 'ES', destinationName: 'Ibiza' },
  { slug: 'private-islands-caribbean', title: 'Private islands in the Caribbean', propertyType: 'private_island', destinationName: 'Caribbean' },
  { slug: 'private-islands-greece', title: 'Private islands in Greece', propertyType: 'private_island', waterBodyType: 'sea', country: 'GR', destinationName: 'Greece' },
  { slug: 'canal-houses-amsterdam', title: 'Canal houses in Amsterdam', propertyType: 'townhouse', waterBodyType: 'canal', country: 'NL', destinationName: 'Amsterdam' },
  { slug: 'fjord-properties-norway', title: 'Fjord properties in Norway', waterBodyType: 'fjord', country: 'NO', destinationName: 'Norway' },
  { slug: 'marina-residences-dubai', title: 'Marina residences in Dubai', propertyType: 'marina_residence', waterBodyType: 'marina_basin', country: 'AE', destinationName: 'Dubai' },
  { slug: 'waterfront-estates-cote-dazur', title: "Waterfront estates on the Côte d'Azur", propertyType: 'estate', waterBodyType: 'sea', country: 'FR', destinationName: "Côte d'Azur" },
  { slug: 'riverfront-homes-thames', title: 'Riverfront homes on the Thames', waterBodyType: 'river', country: 'GB', destinationName: 'The Thames' },
  { slug: 'lakefront-chalets-geneva', title: 'Lakefront chalets on Lake Geneva', propertyType: 'chalet', waterBodyType: 'lake', country: 'CH', destinationName: 'Lake Geneva' },
];
