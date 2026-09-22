import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { ru } from './ru';
import type { LocaleTemplates } from './types';

export const DESCRIPTION_TEMPLATES: Record<string, LocaleTemplates> = {
  en,
  it,
  fr,
  de,
  es,
  ru,
};

export { composeDescription, composeTitle, priceTier } from './types';
export type { DescriptionInput, LocaleTemplates } from './types';
