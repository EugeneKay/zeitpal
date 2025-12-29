/**
 * Locale configuration for SEO-optimized multilingual support.
 * Defines all supported languages and utility functions.
 */

export const LOCALES = ['en', 'de', 'es'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Human-readable labels for each locale (in their native language)
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Espanol',
};

/**
 * ISO language codes for hreflang tags
 */
export const LOCALE_HREFLANG: Record<Locale, string> = {
  en: 'en',
  de: 'de',
  es: 'es',
};

/**
 * OpenGraph locale codes (language_TERRITORY format)
 */
export const LOCALE_OG: Record<Locale, string> = {
  en: 'en_US',
  de: 'de_DE',
  es: 'es_ES',
};

/**
 * Type guard to check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return LOCALES.includes(locale as Locale);
}

/**
 * Get all non-default locales (for routing)
 */
export function getNonDefaultLocales(): Locale[] {
  return LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
}
