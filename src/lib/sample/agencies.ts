/**
 * §13.10: 6 fictional agencies and 12 agents. §13.12: no real agency, agent,
 * address or phone; contact addresses use the reserved example.com domain so
 * nothing can ever deliver; agents render as monogram avatars (§13.2.4) —
 * no portrait media is created at all.
 */

export interface SampleAgency {
  slug: string;
  name: string;
  country: string;
  email: string;
  description: string;
  tier: 'standard' | 'verified';
  destinationSlugs: string[];
}

export interface SampleAgent {
  key: string;
  name: string;
  agencySlug: string;
  role: string;
  email: string;
  languages: string[];
}

export const SAMPLE_AGENCY_SLUG_PREFIX = 'sample-';

export const SAMPLE_AGENCIES: SampleAgency[] = [
  {
    slug: 'sample-riviera-blu',
    name: 'Riviera Blu Estates',
    country: 'IT',
    email: 'riviera-blu@example.com',
    description: 'Sample agency covering the Ligurian and Tyrrhenian coasts.',
    tier: 'verified',
    destinationSlugs: ['liguria', 'amalfi-coast'],
  },
  {
    slug: 'sample-lario-lakeside',
    name: 'Lario Lakeside Properties',
    country: 'IT',
    email: 'lario-lakeside@example.com',
    description: 'Sample agency for the Como shoreline.',
    tier: 'standard',
    destinationSlugs: ['lake-como'],
  },
  {
    slug: 'sample-azur-maritime',
    name: 'Azur Maritime',
    country: 'FR',
    email: 'azur-maritime@example.com',
    description: 'Sample agency for the French Riviera and the Balearics.',
    tier: 'verified',
    destinationSlugs: ['cote-dazur', 'mallorca', 'ibiza'],
  },
  {
    slug: 'sample-adriatic-aegean',
    name: 'Adriatic & Aegean Collection',
    country: 'HR',
    email: 'adriatic-aegean@example.com',
    description: 'Sample agency for the eastern Mediterranean and the Algarve.',
    tier: 'standard',
    destinationSlugs: ['dalmatia', 'greek-islands', 'algarve'],
  },
  {
    slug: 'sample-atlantic-shores',
    name: 'Atlantic Shores Realty',
    country: 'US',
    email: 'atlantic-shores@example.com',
    description: 'Sample agency for Florida, the Hamptons and the Caribbean.',
    tier: 'verified',
    destinationSlugs: ['florida-keys', 'hamptons', 'turks-caicos'],
  },
  {
    slug: 'sample-northern-waters',
    name: 'Northern Waters',
    country: 'NO',
    email: 'northern-waters@example.com',
    description: 'Sample agency for the fjord and canal markets.',
    tier: 'standard',
    destinationSlugs: ['norwegian-fjords', 'amsterdam'],
  },
];

export const SAMPLE_AGENTS: SampleAgent[] = [
  { key: 'sample-agent-01', name: 'Marina Rosetti', agencySlug: 'sample-riviera-blu', role: 'Senior Partner', email: 'marina.rosetti@example.com', languages: ['en', 'it'] },
  { key: 'sample-agent-02', name: 'Luca Ferranti', agencySlug: 'sample-riviera-blu', role: 'Coastal Specialist', email: 'luca.ferranti@example.com', languages: ['en', 'it', 'fr'] },
  { key: 'sample-agent-03', name: 'Chiara Bellandi', agencySlug: 'sample-lario-lakeside', role: 'Lake Specialist', email: 'chiara.bellandi@example.com', languages: ['en', 'it', 'de'] },
  { key: 'sample-agent-04', name: 'Étienne Marchal', agencySlug: 'sample-azur-maritime', role: 'Director', email: 'etienne.marchal@example.com', languages: ['en', 'fr'] },
  { key: 'sample-agent-05', name: 'Núria Ferrer', agencySlug: 'sample-azur-maritime', role: 'Balearics Lead', email: 'nuria.ferrer@example.com', languages: ['en', 'es', 'fr'] },
  { key: 'sample-agent-06', name: 'Ivana Marulić', agencySlug: 'sample-adriatic-aegean', role: 'Islands Specialist', email: 'ivana.marulic@example.com', languages: ['en', 'de'] },
  { key: 'sample-agent-07', name: 'Nikos Alexandris', agencySlug: 'sample-adriatic-aegean', role: 'Aegean Lead', email: 'nikos.alexandris@example.com', languages: ['en'] },
  { key: 'sample-agent-08', name: 'Beatriz Antunes', agencySlug: 'sample-adriatic-aegean', role: 'Algarve Specialist', email: 'beatriz.antunes@example.com', languages: ['en', 'es'] },
  { key: 'sample-agent-09', name: 'Grant Whitfield', agencySlug: 'sample-atlantic-shores', role: 'Broker', email: 'grant.whitfield@example.com', languages: ['en'] },
  { key: 'sample-agent-10', name: 'Sofía Delgado', agencySlug: 'sample-atlantic-shores', role: 'Waterfront Specialist', email: 'sofia.delgado@example.com', languages: ['en', 'es'] },
  { key: 'sample-agent-11', name: 'Ingrid Solheim', agencySlug: 'sample-northern-waters', role: 'Fjord Specialist', email: 'ingrid.solheim@example.com', languages: ['en', 'de'] },
  { key: 'sample-agent-12', name: 'Daan Vermeer', agencySlug: 'sample-northern-waters', role: 'Canal Specialist', email: 'daan.vermeer@example.com', languages: ['en', 'de'] },
];
