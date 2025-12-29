import { Metadata } from 'next';

import { headers } from 'next/headers';

import appConfig from '~/config/app.config';
import { getAlternates } from '~/lib/i18n/get-alternates';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

/**
 * @name generateRootMetadata
 * @description Generates the root metadata for the application with i18n support
 */
export const generateRootMetadata = async (): Promise<Metadata> => {
  const [headersStore, { t }, alternates] = await Promise.all([
    headers(),
    createI18nServerInstance(),
    getAlternates(),
  ]);

  const csrfToken = headersStore.get('x-csrf-token') ?? '';
  const title = t('marketing:site.title');
  const description = t('marketing:site.description');

  return {
    title,
    description,
    metadataBase: new URL(appConfig.url),
    applicationName: appConfig.name,
    other: {
      'csrf-token': csrfToken,
    },
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
    openGraph: {
      url: alternates.canonical,
      siteName: appConfig.name,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    icons: {
      icon: [
        { url: '/images/favicon/favicon.ico', sizes: 'any' },
        { url: '/images/favicon/favicon.svg', type: 'image/svg+xml' },
        { url: '/images/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/images/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: '/images/favicon/apple-touch-icon.png',
    },
  };
};
