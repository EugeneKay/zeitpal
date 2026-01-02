import { ArrowRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { AnimatedShinyText } from '@kit/ui/magicui';

import { LocalizedLink } from '~/components/localized-link';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SitePageHeader } from '../_components/site-page-header';

/**
 * Mapping of competitor translation keys to their URL slugs.
 */
const COMPETITORS = [
  { key: 'personio', slug: 'personio-vs-zeitpal' },
  { key: 'personizer', slug: 'personizer-vs-zeitpal' },
  { key: 'absence-io', slug: 'absence-io-vs-zeitpal' },
  { key: 'factorial', slug: 'factorial-vs-zeitpal' },
  { key: 'vacation-tracker', slug: 'vacation-tracker-vs-zeitpal' },
  { key: 'calamari', slug: 'calamari-vs-zeitpal' },
  { key: 'edays', slug: 'edays-vs-zeitpal' },
  { key: 'breathehr', slug: 'breathehr-vs-zeitpal' },
  { key: 'leapsome', slug: 'leapsome-vs-zeitpal' },
  { key: 'clockodo', slug: 'clockodo-vs-zeitpal' },
  { key: 'absentify', slug: 'absentify-vs-zeitpal' },
];

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:compare.index.metaTitle'),
    description: t('marketing:compare.index.metaDescription'),
  };
}

async function CompareIndexPage() {
  const { t } = await createI18nServerInstance();

  const competitors = COMPETITORS.map(({ key, slug }) => ({
    slug,
    name: t(`marketing:compare.competitors.${key}.name`),
    tagline: t(`marketing:compare.competitors.${key}.tagline`),
  }));

  return (
    <div className="flex flex-col space-y-4 xl:space-y-8">
      <SitePageHeader
        title={
          <AnimatedShinyText className="text-3xl md:text-4xl font-bold">
            {t('marketing:compare.index.title')}
          </AnimatedShinyText>
        }
        subtitle={t('marketing:compare.index.subtitle')}
      />

      <div className="container pb-16">
        {/* Introduction */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-lg text-muted-foreground">
            {t('marketing:compare.index.description')}
          </p>
        </div>

        {/* Competitor Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {competitors.map((competitor) => (
            <LocalizedLink
              key={competitor.slug}
              href={`/${competitor.slug}`}
              className="group p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    ZeitPal vs {competitor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {competitor.tagline}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </LocalizedLink>
          ))}
        </div>

        {/* CTA Section */}
        <section className="text-center p-12 bg-muted/50 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">
            {t('marketing:compare.index.ctaTitle')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('marketing:compare.index.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <LocalizedLink href="/auth/sign-up">
                {t('marketing:compare.index.ctaButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </LocalizedLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <LocalizedLink href="/pricing">
                {t('marketing:compare.viewPricing')}
              </LocalizedLink>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default withI18n(CompareIndexPage);
