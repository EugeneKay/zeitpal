/**
 * Slug translation system for SEO-optimized multilingual URLs.
 * Maps English slugs (canonical) to their translations in each supported locale.
 * English is the default language for this application.
 */

import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales.config';

/**
 * Marketing page slug translations.
 * Key = canonical (English) slug
 * Value = object mapping each locale to its translated slug
 */
export const SLUG_TRANSLATIONS: Record<string, Record<Locale, string>> = {
  // Main marketing pages
  features: {
    en: 'features',
    de: 'funktionen',
    es: 'caracteristicas',
  },
  pricing: {
    en: 'pricing',
    de: 'preise',
    es: 'precios',
  },
  about: {
    en: 'about',
    de: 'ueber-uns',
    es: 'nosotros',
  },
  faq: {
    en: 'faq',
    de: 'haeufige-fragen',
    es: 'preguntas-frecuentes',
  },
  contact: {
    en: 'contact',
    de: 'kontakt',
    es: 'contacto',
  },

  // SEO landing pages
  'leave-management': {
    en: 'leave-management',
    de: 'urlaubsverwaltung',
    es: 'gestion-de-vacaciones',
  },
  'absence-management': {
    en: 'absence-management',
    de: 'abwesenheitsmanagement',
    es: 'gestion-de-ausencias',
  },
  'vacation-planner': {
    en: 'vacation-planner',
    de: 'urlaubsplaner',
    es: 'planificador-de-vacaciones',
  },
  'digital-sick-leave': {
    en: 'digital-sick-leave',
    de: 'krankmeldung-digital',
    es: 'baja-medica-digital',
  },
  'hr-software': {
    en: 'hr-software',
    de: 'hr-software',
    es: 'software-rrhh',
  },
  customers: {
    en: 'customers',
    de: 'kunden',
    es: 'clientes',
  },

  // Use case pages
  'for-startups': {
    en: 'for-startups',
    de: 'fuer-startups',
    es: 'para-startups',
  },
  'for-smes': {
    en: 'for-smes',
    de: 'fuer-mittelstand',
    es: 'para-pymes',
  },

  // Legal pages
  'terms-of-service': {
    en: 'terms-of-service',
    de: 'nutzungsbedingungen',
    es: 'terminos-de-servicio',
  },
  'privacy-policy': {
    en: 'privacy-policy',
    de: 'datenschutz',
    es: 'politica-de-privacidad',
  },
  'cookie-policy': {
    en: 'cookie-policy',
    de: 'cookie-richtlinie',
    es: 'politica-de-cookies',
  },

  // Blog
  blog: {
    en: 'blog',
    de: 'blog',
    es: 'blog',
  },
};

/**
 * List of all canonical marketing paths (for sitemap and static generation)
 */
export const MARKETING_PATHS = Object.keys(SLUG_TRANSLATIONS);

/**
 * Build reverse lookup map for URL parsing.
 * Maps "locale:translatedSlug" -> { locale, canonicalSlug }
 */
const REVERSE_SLUG_MAP = new Map<
  string,
  { locale: Locale; canonicalSlug: string }
>();

// Populate reverse map on module load
Object.entries(SLUG_TRANSLATIONS).forEach(([canonicalSlug, translations]) => {
  Object.entries(translations).forEach(([locale, translatedSlug]) => {
    if (locale !== DEFAULT_LOCALE) {
      REVERSE_SLUG_MAP.set(`${locale}:${translatedSlug}`, {
        locale: locale as Locale,
        canonicalSlug,
      });
    }
  });
});

/**
 * Get translated slug for a given canonical slug and locale.
 * @param canonicalSlug - The English (canonical) slug
 * @param locale - Target locale
 * @returns Translated slug or original if no translation exists
 */
export function getTranslatedSlug(
  canonicalSlug: string,
  locale: Locale,
): string {
  return SLUG_TRANSLATIONS[canonicalSlug]?.[locale] ?? canonicalSlug;
}

/**
 * Get canonical (English) slug from a translated slug.
 * @param translatedSlug - The translated slug
 * @param locale - The locale of the translated slug
 * @returns Canonical slug or null if not found
 */
export function getCanonicalSlug(
  translatedSlug: string,
  locale: Locale,
): string | null {
  // For default locale (English), the slug IS the canonical slug
  if (locale === DEFAULT_LOCALE) {
    return SLUG_TRANSLATIONS[translatedSlug] ? translatedSlug : null;
  }

  const key = `${locale}:${translatedSlug}`;
  const result = REVERSE_SLUG_MAP.get(key);
  return result?.canonicalSlug ?? null;
}

/**
 * Get full localized path for a canonical path.
 * @param canonicalPath - The English path (without leading slash)
 * @param locale - Target locale
 * @returns Full localized path with leading slash
 */
export function getLocalizedPath(
  canonicalPath: string,
  locale: Locale,
): string {
  // Remove leading slash if present
  const pathWithoutSlash = canonicalPath.startsWith('/')
    ? canonicalPath.slice(1)
    : canonicalPath;

  // Home page
  if (pathWithoutSlash === '') {
    return locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
  }

  // For default locale (English), return path as-is
  if (locale === DEFAULT_LOCALE) {
    return `/${pathWithoutSlash}`;
  }

  // Get translated slug
  const translatedSlug = getTranslatedSlug(pathWithoutSlash, locale);
  return `/${locale}/${translatedSlug}`;
}

/**
 * Get all alternate URLs for a canonical path (for hreflang tags).
 * @param canonicalPath - The English path (without leading slash)
 * @param baseUrl - Base URL of the site
 * @returns Array of locale, url, and hreflang code
 */
export function getAllAlternateUrls(
  canonicalPath: string,
  baseUrl: string,
): Array<{ locale: Locale; url: string; hreflang: string }> {
  // Remove trailing slash from baseUrl
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  return LOCALES.map((locale) => ({
    locale,
    url: `${base}${getLocalizedPath(canonicalPath, locale)}`,
    hreflang: locale,
  }));
}

/**
 * Check if a path is a valid marketing page for a locale.
 * @param slug - The slug to check (can be translated)
 * @param locale - The locale context
 * @returns True if valid marketing page
 */
export function isValidMarketingSlug(slug: string, locale: Locale): boolean {
  if (locale === DEFAULT_LOCALE) {
    return MARKETING_PATHS.includes(slug);
  }
  return getCanonicalSlug(slug, locale) !== null;
}
