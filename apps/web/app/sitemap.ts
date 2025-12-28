import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zeitpal.com';

  const staticPages = [
    // Core pages
    '',
    '/features',
    '/pricing',
    '/faq',
    '/about',
    '/contact',
    '/kunden',

    // SEO keyword landing pages
    '/urlaubsverwaltung',
    '/abwesenheitsmanagement',
    '/urlaubsplaner',
    '/krankmeldung-digital',
    '/hr-software',

    // Use case pages
    '/fuer-startups',
    '/fuer-mittelstand',

    // Legal pages
    '/terms-of-service',
    '/privacy-policy',
    '/cookie-policy',

    // Auth pages
    '/auth/sign-in',
    '/auth/sign-up',
  ];

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/urlaubsverwaltung') ? 0.9 : 0.8,
  }));
}
