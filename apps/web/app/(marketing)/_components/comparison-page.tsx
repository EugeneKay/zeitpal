import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Clock,
  Euro,
  Globe,
  HeadphonesIcon,
  Shield,
  Target,
  ThumbsDown,
  ThumbsUp,
  Users,
  X,
  Zap,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import { AnimatedShinyText } from '@kit/ui/magicui';

import { LocalizedLink } from '~/components/localized-link';
import { SitePageHeader } from './site-page-header';

interface CompetitorData {
  name: string;
  tagline: string;
  website: string;
  founded: string;
  headquarters: string;
  overview: string;
  features: {
    leaveManagement: string;
    sickLeave: string;
    teamCalendar: string;
    approvals: string;
    reporting: string;
    mobileApp: string;
    integrations: string;
  };
  pricing: {
    summary: string;
    freeOption: boolean;
    startingPrice: string;
    pricingModel: string;
  };
  targetAudience: string;
  pros: string[];
  cons: string[];
  gdprCompliance: string;
  support: string;
  verdict: string;
  faqItems: Array<{ question: string; answer: string }>;
}

interface ComparisonPageProps {
  competitor: CompetitorData;
  zeitpalFeatures: {
    leaveManagement: string;
    sickLeave: string;
    teamCalendar: string;
    approvals: string;
    reporting: string;
    mobileApp: string;
    integrations: string;
  };
  zeitpalPricing: {
    summary: string;
    freeOption: boolean;
    startingPrice: string;
    pricingModel: string;
  };
  labels: {
    heroTitle: string;
    heroSubtitle: string;
    quickSummary: string;
    sections: {
      overview: string;
      features: string;
      pricing: string;
      targetAudience: string;
      prosAndCons: string;
      compliance: string;
      integrations: string;
      support: string;
      verdict: string;
      faq: string;
    };
    featureLabels: {
      leaveManagement: string;
      sickLeave: string;
      teamCalendar: string;
      approvals: string;
      reporting: string;
      mobileApp: string;
      integrations: string;
    };
    pricingLabels: {
      freeOption: string;
      startingPrice: string;
      pricingModel: string;
    };
    pros: string;
    cons: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    viewPricing: string;
    yes: string;
    no: string;
    zeitpalAdvantages: string[];
  };
}

export function ComparisonPage({
  competitor,
  zeitpalFeatures,
  zeitpalPricing,
  labels,
}: ComparisonPageProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: competitor.faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        key={'ld:json'}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="flex flex-col space-y-4 xl:space-y-8">
        <SitePageHeader
          title={
            <AnimatedShinyText className="text-3xl md:text-4xl font-bold">
              {labels.heroTitle}
            </AnimatedShinyText>
          }
          subtitle={labels.heroSubtitle}
        />

        <div className="container pb-16 max-w-4xl">
          {/* Quick Summary */}
          <section className="mb-12 p-6 bg-muted/50 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {labels.quickSummary}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{competitor.name}:</span>
                  <span className="text-muted-foreground">{competitor.tagline}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Founded: {competitor.founded}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{competitor.headquarters}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-sm">ZeitPal Advantages:</h3>
                <ul className="space-y-1">
                  {labels.zeitpalAdvantages.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{advantage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Overview Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {labels.sections.overview}
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">{competitor.overview}</p>
            </div>
          </section>

          {/* Features Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              {labels.sections.features}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Feature</th>
                    <th className="text-left py-3 px-4 font-medium text-primary">ZeitPal</th>
                    <th className="text-left py-3 px-4 font-medium">{competitor.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(labels.featureLabels).map(([key, label]) => (
                    <tr key={key} className="border-b">
                      <td className="py-3 px-4 font-medium">{label}</td>
                      <td className="py-3 px-4 text-sm">
                        {zeitpalFeatures[key as keyof typeof zeitpalFeatures]}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {competitor.features[key as keyof typeof competitor.features]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing Comparison */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Euro className="h-6 w-6 text-primary" />
              {labels.sections.pricing}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-xl border-2 border-primary bg-primary/5">
                <h3 className="font-bold text-lg mb-4 text-primary">ZeitPal</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{labels.pricingLabels.freeOption}:</span>
                    {zeitpalPricing.freeOption ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{labels.pricingLabels.startingPrice}:</span>{' '}
                    <span>{zeitpalPricing.startingPrice}</span>
                  </div>
                  <div>
                    <span className="font-medium">{labels.pricingLabels.pricingModel}:</span>{' '}
                    <span className="text-muted-foreground">{zeitpalPricing.pricingModel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{zeitpalPricing.summary}</p>
                </div>
              </div>
              <div className="p-6 rounded-xl border">
                <h3 className="font-bold text-lg mb-4">{competitor.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{labels.pricingLabels.freeOption}:</span>
                    {competitor.pricing.freeOption ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{labels.pricingLabels.startingPrice}:</span>{' '}
                    <span>{competitor.pricing.startingPrice}</span>
                  </div>
                  <div>
                    <span className="font-medium">{labels.pricingLabels.pricingModel}:</span>{' '}
                    <span className="text-muted-foreground">{competitor.pricing.pricingModel}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">{competitor.pricing.summary}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Target Audience */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              {labels.sections.targetAudience}
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">{competitor.targetAudience}</p>
            </div>
          </section>

          {/* Pros and Cons */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {labels.sections.prosAndCons}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
                  <ThumbsUp className="h-5 w-5" />
                  {labels.pros}
                </h3>
                <ul className="space-y-2">
                  {competitor.pros.map((pro, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0 mt-1" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <ThumbsDown className="h-5 w-5" />
                  {labels.cons}
                </h3>
                <ul className="space-y-2">
                  {competitor.cons.map((con, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 shrink-0 mt-1" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* GDPR & Compliance */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {labels.sections.compliance}
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">{competitor.gdprCompliance}</p>
            </div>
          </section>

          {/* Customer Support */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <HeadphonesIcon className="h-6 w-6 text-primary" />
              {labels.sections.support}
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">{competitor.support}</p>
            </div>
          </section>

          {/* Verdict */}
          <section className="mb-12 p-8 bg-primary/5 rounded-2xl border-2 border-primary/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              {labels.sections.verdict}
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed">{competitor.verdict}</p>
            </div>
          </section>

          {/* FAQ Section */}
          {competitor.faqItems.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{labels.sections.faq}</h2>
              <div className="space-y-4">
                {competitor.faqItems.map((item, index) => (
                  <details
                    key={index}
                    className="group border rounded-lg px-6 py-4"
                  >
                    <summary className="flex items-center justify-between cursor-pointer font-medium">
                      {item.question}
                      <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <p className="mt-4 text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="text-center p-12 bg-muted/50 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">{labels.ctaTitle}</h2>
            <p className="text-muted-foreground mb-8">{labels.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <LocalizedLink href="/auth/sign-up">
                  {labels.ctaButton}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </LocalizedLink>
              </Button>
              <Button asChild variant="outline" size="lg">
                <LocalizedLink href="/pricing">{labels.viewPricing}</LocalizedLink>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
