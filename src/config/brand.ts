export interface BrandConfig {
  name: string;
  codename: string;
  legalName: string;
  domain: string;
  siteUrl: string;
  tagline: string;
  description: string;
  email: {
    contact: string;
    leads: string;
    noreply: string;
  };
  phone: string;
  whatsapp: string;
  socials: {
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  copyrightYear: number;
}

export const brand: BrandConfig = {
  name: 'WATERLINE',
  codename: 'WATERLINE',
  legalName: 'Waterline Waterfront Estates Limited',
  domain: 'waterline.com',
  siteUrl: process.env['NEXT_PUBLIC_SITE_URL'] || 'https://waterline.com',
  tagline: 'The Global Waterfront-Only Property Portal',
  description:
    'A curated search engine for trophy properties with direct water access worldwide — sea, lake, river, lagoon, canal, or fjord.',
  email: {
    contact: 'concierge@waterline.com',
    leads: process.env['LEAD_NOTIFY_TO'] || 'leads@waterline.com',
    noreply: process.env['AGENCY_NOTIFY_FROM'] || 'noreply@waterline.com',
  },
  phone: '+44 20 7946 0912',
  whatsapp: '+44 7700 900912',
  socials: {
    instagram: 'https://instagram.com/waterline.estates',
    linkedin: 'https://linkedin.com/company/waterline-estates',
    youtube: 'https://youtube.com/@waterline-estates',
  },
  copyrightYear: 2026,
};
