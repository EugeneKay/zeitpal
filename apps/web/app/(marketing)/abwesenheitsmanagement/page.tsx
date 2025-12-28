import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Users,
} from 'lucide-react';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SEOLandingPage } from '~/(marketing)/_components/seo-landing-page';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:seo.abwesenheitsmanagement.metaTitle'),
    description: t('marketing:seo.abwesenheitsmanagement.metaDescription'),
  };
};

async function AbwesenheitsmanagementPage() {
  const { t } = await createI18nServerInstance();

  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Alle Abwesenheitsarten',
      description: 'Urlaub, Krankheit, Homeoffice, Sonderurlaub - alles in einem System.',
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Übersichtlicher Teamkalender',
      description: 'Sehen Sie sofort, wer wann abwesend ist. Planen Sie besser.',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Flexible Genehmigungsworkflows',
      description: 'Definieren Sie Genehmigungsketten nach Abwesenheitsart und Team.',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Detaillierte Berichte',
      description: 'Abwesenheitsstatistiken, Krankenquoten und mehr auf einen Blick.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Teamverwaltung',
      description: 'Organisieren Sie Mitarbeiter in Teams mit eigenen Einstellungen.',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Echtzeitübersicht',
      description: 'Aktuelle Abwesenheiten und anstehende Urlaubszeiten im Blick.',
    },
  ];

  const benefits = [
    'Zentrale Verwaltung aller Abwesenheitsarten',
    'Transparenz für Führungskräfte und Mitarbeiter',
    'Automatische Benachrichtigungen und Erinnerungen',
    'Berichte für HR und Geschäftsführung',
    'Integration mit Kalender-Apps möglich',
    'Vollständig DSGVO-konform',
  ];

  const faqItems = [
    {
      question: 'Welche Abwesenheitsarten werden unterstützt?',
      answer: 'ZeitPal unterstützt Urlaub, Krankheit, Kindkrank, Homeoffice, Sonderurlaub, Elternzeit, Mutterschutz, Überstundenabbau und weitere anpassbare Typen.',
    },
    {
      question: 'Können verschiedene Teams unterschiedliche Regeln haben?',
      answer: 'Ja, Sie können für jedes Team eigene Genehmigungsworkflows und Einstellungen definieren.',
    },
    {
      question: 'Wie sicher sind meine Daten?',
      answer: 'Alle Daten werden verschlüsselt auf deutschen Servern gespeichert. ZeitPal ist vollständig DSGVO-konform.',
    },
  ];

  const relatedLinks = [
    { href: '/urlaubsverwaltung', label: 'Urlaubsverwaltung' },
    { href: '/krankmeldung-digital', label: 'Digitale Krankmeldung' },
    { href: '/hr-software', label: 'HR Software' },
    { href: '/fuer-mittelstand', label: 'Für Mittelstand' },
  ];

  return (
    <SEOLandingPage
      title={t('marketing:seo.abwesenheitsmanagement.h1')}
      subtitle={t('marketing:seo.abwesenheitsmanagement.subtitle')}
      features={features}
      benefits={benefits}
      ctaText="Abwesenheitsmanagement kostenlos testen"
      ctaHref="/auth/sign-up"
      relatedLinks={relatedLinks}
      faqItems={faqItems}
    />
  );
}

export default withI18n(AbwesenheitsmanagementPage);
