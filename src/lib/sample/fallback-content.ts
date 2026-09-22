import { LANDING_PAGE_SEEDS } from '@/scripts/seed-data/landing-pages';
import { textToLexical } from '@/lib/lexical';
import type { Article, LandingPage } from '@/payload-types';

import { sampleFallbackEnabled } from './fallback';

/**
 * Demo journal + landing content for the gated sample fallback (§13.12).
 * Served ONLY when the database errors and SAMPLE_DATA_ENABLED=true, exactly
 * like the fallback listings. Everything here is deliberately free of
 * statistics and market claims (§13.9) — descriptive, general-knowledge copy
 * a reader can verify, marked as demonstration content and noindexed.
 */

const SEED_DATE = '2026-01-05T09:00:00.000Z';

const ARTICLE_PARAGRAPHS = [
  'Mooring a boat at your own property involves three questions that are worth answering before any viewing: who owns the water bed, what is attached to the shoreline, and what limits apply to the vessel itself.',
  'Ownership first. In much of the Mediterranean the foreshore and the water bed are public property, and a private jetty sits on a concession — a renewable right granted to the property, not a freehold. In parts of northern Europe and North America, riparian rights can extend further, but they rarely permit unrestricted construction. The listing should state the tenure of the shoreline explicitly, and the seller should be able to produce the concession or licence document.',
  'Second, the structure. A berth is only as useful as its dimensions: length along the pontoon, beam between piles, and depth at the lowest tide the basin sees. Depth is the figure most often quoted optimistically — ask when it was last surveyed and from which datum.',
  'Third, the route. A generous berth behind a low fixed bridge suits a tender, not a sailing yacht. Chart the route to open water: air draft under every fixed crossing, any locks and their operating hours, and speed or wake restrictions along the way.',
  'None of this is a reason to hesitate — it is a checklist for one afternoon with the listing agency and, where concessions are involved, a local notary. WATERLINE listings carry these fields as structured data precisely so the conversation starts from numbers rather than impressions.',
];

let cachedArticle: Article | null = null;

/** The single demo journal article, deterministic across calls. */
export function fallbackArticle(): Article {
  if (!cachedArticle) {
    cachedArticle = {
      id: -1,
      title: 'Mooring rights at a private berth: the three questions that matter',
      slug: 'sample-mooring-rights-private-berth',
      excerpt:
        'Who owns the water bed, what is attached to the shoreline, and what limits apply to the vessel — a practical checklist for the first viewing.',
      body: textToLexical(...ARTICLE_PARAGRAPHS) as Article['body'],
      publishedAt: SEED_DATE,
      updatedAt: SEED_DATE,
      createdAt: SEED_DATE,
      _status: 'published',
    };
  }
  return cachedArticle;
}

export function fallbackArticles(): Article[] {
  return sampleFallbackEnabled() ? [fallbackArticle()] : [];
}

export function findFallbackArticle(slug: string): Article | null {
  if (!sampleFallbackEnabled()) return null;
  const article = fallbackArticle();
  return article.slug === slug ? article : null;
}

/** 40–60-word §14.6 direct-answer intro, descriptive only — no figures. */
function landingIntro(seed: (typeof LANDING_PAGE_SEEDS)[number]): string {
  return (
    `${seed.title} listed on WATERLINE all share one verified condition: the water starts at the property line, ` +
    'never further than fifty metres away. Each listing states its shoreline tenure, measured frontage and, where a berth exists, ' +
    'the dimensions and the route to open water — so a boat owner can judge the fit before the first viewing.'
  );
}

const LANDING_FAQ = [
  {
    question: 'What does “direct water access” mean on WATERLINE?',
    answer:
      'Every listing must have at least one verified water access type — private frontage, a jetty, a beach or a berth — and stand no more than fifty metres from the waterline. Listings that only offer a view do not qualify.',
  },
  {
    question: 'How do I check that my boat fits a berth?',
    answer:
      'Use the boat-length filter: set your length overall and, optionally, your draft. Results are limited to listings whose stated berth dimensions and approach depth accommodate the vessel. Berth figures are provided by the listing agency and should be verified during the survey.',
  },
];

let cachedLandingPages: Map<string, LandingPage> | null = null;

function landingPages(): Map<string, LandingPage> {
  if (!cachedLandingPages) {
    cachedLandingPages = new Map(
      LANDING_PAGE_SEEDS.map((seed, index) => [
        seed.slug,
        {
          id: -(index + 1),
          title: seed.title,
          slug: seed.slug,
          combo: {
            propertyType: (seed.propertyType ?? null) as NonNullable<
              LandingPage['combo']
            >['propertyType'],
            waterBodyType: (seed.waterBodyType ?? null) as NonNullable<
              LandingPage['combo']
            >['waterBodyType'],
            destination: null,
            country: seed.country ?? null,
          },
          intro: textToLexical(landingIntro(seed)) as LandingPage['intro'],
          faq: LANDING_FAQ.map((entry, i) => ({ ...entry, id: `faq-${i}` })),
          updatedAt: SEED_DATE,
          createdAt: SEED_DATE,
          _status: 'published',
        } as LandingPage,
      ]),
    );
  }
  return cachedLandingPages;
}

export function findFallbackLandingPage(slug: string): LandingPage | null {
  if (!sampleFallbackEnabled()) return null;
  return landingPages().get(slug) ?? null;
}

export function fallbackLandingPages(): LandingPage[] {
  return sampleFallbackEnabled() ? [...landingPages().values()] : [];
}

/** Fallback pages have negative ids — used to noindex demo landing/journal pages. */
export function isFallbackContent(doc: { id: number }): boolean {
  return doc.id < 0;
}
