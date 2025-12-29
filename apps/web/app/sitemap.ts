import { MetadataRoute } from 'next';

import { DEFAULT_LOCALE, LOCALES } from '~/lib/i18n/locales.config';
import { getLocalizedPath } from '~/lib/i18n/slug-translations';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zeitpal.com';
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Define canonical marketing paths with their priorities
  const pathPriorities: Record<
    string,
    { priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }
  > = {
    '': { priority: 1.0, changeFrequency: 'weekly' },
    features: { priority: 0.9, changeFrequency: 'weekly' },
    pricing: { priority: 0.9, changeFrequency: 'weekly' },
    about: { priority: 0.8, changeFrequency: 'monthly' },
    faq: { priority: 0.8, changeFrequency: 'monthly' },
    contact: { priority: 0.8, changeFrequency: 'monthly' },
    customers: { priority: 0.8, changeFrequency: 'monthly' },
    // SEO landing pages
    'leave-management': { priority: 0.9, changeFrequency: 'monthly' },
    'absence-management': { priority: 0.9, changeFrequency: 'monthly' },
    'vacation-planner': { priority: 0.9, changeFrequency: 'monthly' },
    'digital-sick-leave': { priority: 0.9, changeFrequency: 'monthly' },
    'hr-software': { priority: 0.9, changeFrequency: 'monthly' },
    // Use case pages
    'for-startups': { priority: 0.8, changeFrequency: 'monthly' },
    'for-smes': { priority: 0.8, changeFrequency: 'monthly' },
    // Legal pages
    'terms-of-service': { priority: 0.5, changeFrequency: 'yearly' },
    'privacy-policy': { priority: 0.5, changeFrequency: 'yearly' },
    'cookie-policy': { priority: 0.5, changeFrequency: 'yearly' },
    // Blog
    blog: { priority: 0.7, changeFrequency: 'weekly' },
  };

  // Generate sitemap entries for each canonical path with all language variants
  Object.entries(pathPriorities).forEach(([canonicalPath, config]) => {
    // Generate entry for each locale
    LOCALES.forEach((locale) => {
      const localizedPath = getLocalizedPath(canonicalPath, locale);
      const url = `${baseUrl}${localizedPath}`;

      // Build alternates object for this URL (hreflang)
      const alternates: Record<string, string> = {};
      LOCALES.forEach((altLocale) => {
        const altPath = getLocalizedPath(canonicalPath, altLocale);
        alternates[altLocale] = `${baseUrl}${altPath}`;
      });
      // Add x-default pointing to default locale
      alternates['x-default'] = `${baseUrl}${getLocalizedPath(canonicalPath, DEFAULT_LOCALE)}`;

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: config.changeFrequency,
        priority: config.priority,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  // Auth pages (no localization, lower priority)
  const authPages = ['/auth/sign-in', '/auth/sign-up'];
  authPages.forEach((path) => {
    sitemapEntries.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    });
  });

  return sitemapEntries;
}
