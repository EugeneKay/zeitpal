import {
  Building2,
  Users,
  BarChart3,
  Shield,
  Globe,
  Headphones,
} from 'lucide-react';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SEOLandingPage } from '~/(marketing)/_components/seo-landing-page';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:useCases.mittelstand.metaTitle'),
    description: t('marketing:useCases.mittelstand.metaDescription'),
  };
};

async function FuerMittelstandPage() {
  const { t } = await createI18nServerInstance();

  const features = [
    {
      icon: <Building2 className="h-8 w-8" />,
      title: 'Mehrere Teams & Abteilungen',
      description: 'Organisieren Sie Mitarbeiter in Teams mit eigenen Genehmigungsworkflows.',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Erweiterte Berichte',
      description: 'Detaillierte Statistiken zu Abwesenheiten, Krankenquoten und Urlaubskontingenten.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Flexible Genehmigungsketten',
      description: 'Definieren Sie mehrstufige Genehmigungsworkflows nach Abwesenheitsart.',
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Slack & Kalender-Integration',
      description: 'Verbinden Sie ZeitPal mit den Tools, die Sie bereits nutzen.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Deutsches Arbeitsrecht',
      description: 'BUrlG-konform mit Feiertagen nach Bundesland und AU-Erinnerungen.',
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: 'Prioritätssupport',
      description: 'Schnelle Hilfe bei Fragen. Persönlicher Support auf Deutsch.',
    },
  ];

  const benefits = [
    'Skalierbare Lösung für 6-50+ Mitarbeiter',
    'Mehrstufige Genehmigungsworkflows',
    'Detaillierte Reports für HR und Geschäftsführung',
    'Integration mit bestehenden Tools',
    'Konform mit deutschem Arbeitsrecht',
    'Persönlicher Support bei der Einführung',
  ];

  const faqItems = [
    {
      question: 'Können wir mehrere Standorte mit verschiedenen Feiertagen verwalten?',
      answer: 'Ja, Sie können für jeden Standort das entsprechende Bundesland hinterlegen. Feiertage werden automatisch korrekt berücksichtigt.',
    },
    {
      question: 'Wie funktioniert die Migration von unserem aktuellen System?',
      answer: 'Unser Team unterstützt Sie beim Import bestehender Daten. Excel-Importe sind möglich, und wir helfen bei der Einrichtung.',
    },
    {
      question: 'Gibt es Mengenrabatte für größere Teams?',
      answer: 'Ja, für Teams ab 50 Mitarbeitern bieten wir individuelle Enterprise-Preise. Kontaktieren Sie uns für ein Angebot.',
    },
  ];

  const relatedLinks = [
    { href: '/fuer-startups', label: 'Für Startups' },
    { href: '/hr-software', label: 'HR Software' },
    { href: '/abwesenheitsmanagement', label: 'Abwesenheitsmanagement' },
    { href: '/pricing', label: 'Preise' },
  ];

  return (
    <SEOLandingPage
      title={t('marketing:useCases.mittelstand.h1')}
      subtitle={t('marketing:useCases.mittelstand.subtitle')}
      features={features}
      benefits={benefits}
      ctaText="Team-Plan kostenlos testen"
      ctaHref="/auth/sign-up"
      relatedLinks={relatedLinks}
      faqItems={faqItems}
    />
  );
}

export default withI18n(FuerMittelstandPage);
