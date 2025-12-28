import Link from 'next/link';

import { ArrowRight, Star, Quote } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:customers') + ' | ZeitPal',
    description: t('marketing:customersSubtitle'),
  };
};

async function KundenPage() {
  const { t } = await createI18nServerInstance();

  const testimonials = [
    {
      quote: t('marketing:testimonials.1.quote'),
      author: t('marketing:testimonials.1.author'),
      role: t('marketing:testimonials.1.role'),
      company: t('marketing:testimonials.1.company'),
      rating: 5,
      highlight: 'Jeden Monat 5+ Stunden gespart',
    },
    {
      quote: t('marketing:testimonials.2.quote'),
      author: t('marketing:testimonials.2.author'),
      role: t('marketing:testimonials.2.role'),
      company: t('marketing:testimonials.2.company'),
      rating: 5,
      highlight: 'In unter 1 Stunde einsatzbereit',
    },
    {
      quote: t('marketing:testimonials.3.quote'),
      author: t('marketing:testimonials.3.author'),
      role: t('marketing:testimonials.3.role'),
      company: t('marketing:testimonials.3.company'),
      rating: 5,
      highlight: 'Mobile Genehmigungen',
    },
    {
      quote: t('marketing:testimonials.4.quote'),
      author: t('marketing:testimonials.4.author'),
      role: t('marketing:testimonials.4.role'),
      company: t('marketing:testimonials.4.company'),
      rating: 5,
      highlight: 'Remote-Team-Lösung',
    },
  ];

  const stats = [
    { value: '500+', label: 'Zufriedene Teams' },
    { value: '10,000+', label: 'Urlaubstage verwaltet' },
    { value: '4.9/5', label: 'Kundenbewertung' },
    { value: '< 15 Min', label: 'Setup-Zeit' },
  ];

  const caseStudies = [
    {
      company: 'TechStart GmbH',
      industry: 'Technologie',
      employees: '25 Mitarbeiter',
      challenge: 'Excel-basierte Urlaubsverwaltung führte zu Fehlern und Frustration',
      solution: 'Migration zu ZeitPal in einem Tag',
      result: '5+ Stunden pro Monat eingespart',
    },
    {
      company: 'Kreativ Agentur Nord',
      industry: 'Kreativwirtschaft',
      employees: '12 Mitarbeiter',
      challenge: 'Kein Budget für teure HR-Software',
      solution: 'Kostenloser Starter-Plan für das gesamte Team',
      result: 'Professionelle Urlaubsverwaltung ohne Kosten',
    },
    {
      company: 'GlobalTech Solutions',
      industry: 'Beratung',
      employees: '45 Mitarbeiter',
      challenge: 'Remote-Team über mehrere Zeitzonen verteilt',
      solution: 'Zentraler Teamkalender mit Benachrichtigungen',
      result: 'Keine Überschneidungen mehr bei Urlaubsplanung',
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: testimonials.map((t, i) => ({
      '@type': 'Review',
      position: i + 1,
      author: {
        '@type': 'Person',
        name: t.author,
      },
      reviewBody: t.quote,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: t.rating,
        bestRating: 5,
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

      <div className={'flex flex-col space-y-4 xl:space-y-8'}>
        <SitePageHeader
          title={t('marketing:testimonials.heading')}
          subtitle={t('marketing:testimonials.subheading')}
        />

        <div className={'container pb-16'}>
          {/* Stats Section */}
          <div className="grid gap-8 md:grid-cols-4 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials Grid */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-center mb-12">
              Was unsere Kunden sagen
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="relative p-8 rounded-2xl border border-border bg-card"
                >
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />

                  {testimonial.highlight && (
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                      {testimonial.highlight}
                    </div>
                  )}

                  <blockquote className="text-lg mb-6">
                    "{testimonial.quote}"
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-lg font-semibold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-0.5 mt-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Case Studies */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold text-center mb-4">
              Erfolgsgeschichten
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              So haben andere Unternehmen ihre Urlaubsverwaltung mit ZeitPal optimiert
            </p>
            <div className="grid gap-8 lg:grid-cols-3">
              {caseStudies.map((study, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">{study.industry}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{study.employees}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{study.company}</h3>

                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-medium text-destructive">Herausforderung:</span>
                      <p className="text-muted-foreground mt-1">{study.challenge}</p>
                    </div>
                    <div>
                      <span className="font-medium text-primary">Lösung:</span>
                      <p className="text-muted-foreground mt-1">{study.solution}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Ergebnis:</span>
                      <p className="text-muted-foreground mt-1">{study.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center p-12 bg-muted/50 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              Werden Sie unser nächster zufriedener Kunde
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Starten Sie noch heute kostenlos und erleben Sie, wie einfach Urlaubsverwaltung sein kann.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/sign-up">
                  Kostenlos starten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">
                  Preise ansehen
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default withI18n(KundenPage);
