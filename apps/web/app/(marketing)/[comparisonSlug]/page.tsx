import { notFound } from 'next/navigation';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { ComparisonPage } from '../_components/comparison-page';

/**
 * Mapping from comparison slug to competitor translation key.
 * The slug is the canonical (English) URL slug like "personio-vs-zeitpal".
 * The key is the competitor identifier used in translations like "personio".
 */
const COMPARISON_SLUGS: Record<string, string> = {
  'personio-vs-zeitpal': 'personio',
  'personizer-vs-zeitpal': 'personizer',
  'absence-io-vs-zeitpal': 'absence-io',
  'factorial-vs-zeitpal': 'factorial',
  'vacation-tracker-vs-zeitpal': 'vacation-tracker',
  'calamari-vs-zeitpal': 'calamari',
  'edays-vs-zeitpal': 'edays',
  'breathehr-vs-zeitpal': 'breathehr',
  'leapsome-vs-zeitpal': 'leapsome',
  'clockodo-vs-zeitpal': 'clockodo',
  'absentify-vs-zeitpal': 'absentify',
};

/**
 * List of all comparison slugs for static generation.
 */
export const COMPARISON_SLUG_LIST = Object.keys(COMPARISON_SLUGS);

/**
 * Generate static params for all comparison pages.
 */
export async function generateStaticParams() {
  return COMPARISON_SLUG_LIST.map((comparisonSlug) => ({
    comparisonSlug,
  }));
}

/**
 * Generate metadata for comparison page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ comparisonSlug: string }>;
}) {
  const { comparisonSlug } = await params;
  const competitorKey = COMPARISON_SLUGS[comparisonSlug];

  if (!competitorKey) {
    return {
      title: 'Not Found',
    };
  }

  const { t } = await createI18nServerInstance();
  const competitorName = t(`marketing:compare.competitors.${competitorKey}.name`);

  return {
    title: t('marketing:compare.metaTitle', { competitor: competitorName }),
    description: t('marketing:compare.metaDescription', {
      competitor: competitorName,
    }),
  };
}

interface ComparePageProps {
  params: Promise<{ comparisonSlug: string }>;
}

async function ComparePage({ params }: ComparePageProps) {
  const { comparisonSlug } = await params;
  const competitorKey = COMPARISON_SLUGS[comparisonSlug];

  // Validate comparison slug
  if (!competitorKey) {
    notFound();
  }

  const { t } = await createI18nServerInstance();

  // Get competitor data from translations
  const competitorData = {
    name: t(`marketing:compare.competitors.${competitorKey}.name`),
    tagline: t(`marketing:compare.competitors.${competitorKey}.tagline`),
    website: t(`marketing:compare.competitors.${competitorKey}.website`),
    founded: t(`marketing:compare.competitors.${competitorKey}.founded`),
    headquarters: t(`marketing:compare.competitors.${competitorKey}.headquarters`),
    overview: t(`marketing:compare.competitors.${competitorKey}.overview`),
    features: {
      leaveManagement: t(
        `marketing:compare.competitors.${competitorKey}.features.leaveManagement`,
      ),
      sickLeave: t(
        `marketing:compare.competitors.${competitorKey}.features.sickLeave`,
      ),
      teamCalendar: t(
        `marketing:compare.competitors.${competitorKey}.features.teamCalendar`,
      ),
      approvals: t(
        `marketing:compare.competitors.${competitorKey}.features.approvals`,
      ),
      reporting: t(
        `marketing:compare.competitors.${competitorKey}.features.reporting`,
      ),
      mobileApp: t(
        `marketing:compare.competitors.${competitorKey}.features.mobileApp`,
      ),
      integrations: t(
        `marketing:compare.competitors.${competitorKey}.features.integrations`,
      ),
    },
    pricing: {
      summary: t(
        `marketing:compare.competitors.${competitorKey}.pricing.summary`,
      ),
      freeOption:
        t(`marketing:compare.competitors.${competitorKey}.pricing.freeOption`) ===
        'true',
      startingPrice: t(
        `marketing:compare.competitors.${competitorKey}.pricing.startingPrice`,
      ),
      pricingModel: t(
        `marketing:compare.competitors.${competitorKey}.pricing.pricingModel`,
      ),
    },
    targetAudience: t(
      `marketing:compare.competitors.${competitorKey}.targetAudience`,
    ),
    pros: t(`marketing:compare.competitors.${competitorKey}.pros`, {
      returnObjects: true,
    }) as string[],
    cons: t(`marketing:compare.competitors.${competitorKey}.cons`, {
      returnObjects: true,
    }) as string[],
    gdprCompliance: t(
      `marketing:compare.competitors.${competitorKey}.gdprCompliance`,
    ),
    support: t(`marketing:compare.competitors.${competitorKey}.support`),
    verdict: t(`marketing:compare.competitors.${competitorKey}.verdict`),
    faqItems: t(`marketing:compare.competitors.${competitorKey}.faqItems`, {
      returnObjects: true,
    }) as Array<{ question: string; answer: string }>,
  };

  // Get ZeitPal features from translations
  const zeitpalFeatures = {
    leaveManagement: t('marketing:compare.zeitpal.features.leaveManagement'),
    sickLeave: t('marketing:compare.zeitpal.features.sickLeave'),
    teamCalendar: t('marketing:compare.zeitpal.features.teamCalendar'),
    approvals: t('marketing:compare.zeitpal.features.approvals'),
    reporting: t('marketing:compare.zeitpal.features.reporting'),
    mobileApp: t('marketing:compare.zeitpal.features.mobileApp'),
    integrations: t('marketing:compare.zeitpal.features.integrations'),
  };

  const zeitpalPricing = {
    summary: t('marketing:compare.zeitpal.pricing.summary'),
    freeOption: true,
    startingPrice: t('marketing:compare.zeitpal.pricing.startingPrice'),
    pricingModel: t('marketing:compare.zeitpal.pricing.pricingModel'),
  };

  // Get labels
  const labels = {
    heroTitle: t('marketing:compare.heroTitle', {
      competitor: competitorData.name,
    }),
    heroSubtitle: t('marketing:compare.heroSubtitle', {
      competitor: competitorData.name,
    }),
    quickSummary: t('marketing:compare.quickSummary'),
    sections: {
      overview: t('marketing:compare.sections.overview'),
      features: t('marketing:compare.sections.features'),
      pricing: t('marketing:compare.sections.pricing'),
      targetAudience: t('marketing:compare.sections.targetAudience'),
      prosAndCons: t('marketing:compare.sections.prosAndCons'),
      compliance: t('marketing:compare.sections.compliance'),
      integrations: t('marketing:compare.sections.integrations'),
      support: t('marketing:compare.sections.support'),
      verdict: t('marketing:compare.sections.verdict'),
      faq: t('marketing:compare.sections.faq'),
    },
    featureLabels: {
      leaveManagement: t('marketing:compare.featureLabels.leaveManagement'),
      sickLeave: t('marketing:compare.featureLabels.sickLeave'),
      teamCalendar: t('marketing:compare.featureLabels.teamCalendar'),
      approvals: t('marketing:compare.featureLabels.approvals'),
      reporting: t('marketing:compare.featureLabels.reporting'),
      mobileApp: t('marketing:compare.featureLabels.mobileApp'),
      integrations: t('marketing:compare.featureLabels.integrations'),
    },
    pricingLabels: {
      freeOption: t('marketing:compare.pricingLabels.freeOption'),
      startingPrice: t('marketing:compare.pricingLabels.startingPrice'),
      pricingModel: t('marketing:compare.pricingLabels.pricingModel'),
    },
    pros: t('marketing:compare.pros'),
    cons: t('marketing:compare.cons'),
    ctaTitle: t('marketing:compare.ctaTitle'),
    ctaSubtitle: t('marketing:compare.ctaSubtitle'),
    ctaButton: t('marketing:compare.ctaButton'),
    viewPricing: t('marketing:compare.viewPricing'),
    yes: t('marketing:compare.yes'),
    no: t('marketing:compare.no'),
    zeitpalAdvantages: t('marketing:compare.zeitpalAdvantages', {
      returnObjects: true,
    }) as string[],
  };

  return (
    <ComparisonPage
      competitor={competitorData}
      zeitpalFeatures={zeitpalFeatures}
      zeitpalPricing={zeitpalPricing}
      labels={labels}
    />
  );
}

export default withI18n(ComparePage);
