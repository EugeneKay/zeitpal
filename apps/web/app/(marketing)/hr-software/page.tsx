import {
  FileText,
  Shield,
  Scale,
  BarChart3,
  Users,
  Globe,
} from 'lucide-react';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SEOLandingPage } from '~/(marketing)/_components/seo-landing-page';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:seo.hrSoftware.metaTitle'),
    description: t('marketing:seo.hrSoftware.metaDescription'),
  };
};

async function HRSoftwarePage() {
  const { t } = await createI18nServerInstance();

  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Urlaubsverwaltung',
      description: 'Digitale Urlaubsanträge und Genehmigungen für das gesamte Unternehmen.',
    },
    {
      icon: <Scale className="h-8 w-8" />,
      title: 'Deutsches Arbeitsrecht',
      description: 'Entwickelt für deutsche Anforderungen: BUrlG, Feiertage nach Bundesland, AU-Pflichten.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'DSGVO-konform',
      description: 'Datenschutz nach höchsten deutschen Standards. Server in Deutschland.',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'HR-Reporting',
      description: 'Detaillierte Berichte zu Abwesenheiten, Urlaubskontingenten und mehr.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Mitarbeiterverwaltung',
      description: 'Teams, Abteilungen und Genehmigungsworkflows flexibel verwalten.',
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Integrationen',
      description: 'Verbindung mit Slack, Google Workspace und weiteren Tools.',
    },
  ];

  const benefits = [
    'Speziell für den deutschen Markt entwickelt',
    'Konform mit BUrlG und DSGVO',
    'Alle Feiertage nach Bundesland integriert',
    'Deutsche Server für maximale Datensicherheit',
    'Support auf Deutsch',
    'Keine versteckten Kosten - transparente Preise',
  ];

  const faqItems = [
    {
      question: 'Was unterscheidet ZeitPal von amerikanischen HR-Tools?',
      answer: 'ZeitPal wurde speziell für deutsche Anforderungen entwickelt: deutsches Arbeitsrecht, Feiertage nach Bundesland, DSGVO-Konformität und deutsche Server.',
    },
    {
      question: 'Ist ZeitPal für ISO-Zertifizierungen geeignet?',
      answer: 'Ja, ZeitPal dokumentiert alle Abwesenheiten nachvollziehbar und unterstützt Sie bei Compliance-Anforderungen.',
    },
    {
      question: 'Gibt es eine Schnittstelle zur Lohnbuchhaltung?',
      answer: 'Aktuell bieten wir Datenexporte für die Lohnbuchhaltung. API-Integrationen sind in Planung.',
    },
  ];

  const relatedLinks = [
    { href: '/urlaubsverwaltung', label: 'Urlaubsverwaltung' },
    { href: '/abwesenheitsmanagement', label: 'Abwesenheitsmanagement' },
    { href: '/fuer-mittelstand', label: 'Für Mittelstand' },
    { href: '/pricing', label: 'Preise' },
  ];

  return (
    <SEOLandingPage
      title={t('marketing:seo.hrSoftware.h1')}
      subtitle={t('marketing:seo.hrSoftware.subtitle')}
      features={features}
      benefits={benefits}
      ctaText="HR Software kostenlos testen"
      ctaHref="/auth/sign-up"
      relatedLinks={relatedLinks}
      faqItems={faqItems}
    />
  );
}

export default withI18n(HRSoftwarePage);
