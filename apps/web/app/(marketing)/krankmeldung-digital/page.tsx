import {
  FileText,
  Bell,
  Clock,
  Shield,
  Smartphone,
  CheckCircle,
} from 'lucide-react';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SEOLandingPage } from '~/(marketing)/_components/seo-landing-page';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:seo.krankmeldungDigital.metaTitle'),
    description: t('marketing:seo.krankmeldungDigital.metaDescription'),
  };
};

async function KrankmeldungDigitalPage() {
  const { t } = await createI18nServerInstance();

  const features = [
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Krankmeldung vom Handy',
      description: 'Mitarbeiter melden sich mit wenigen Klicks krank - auch vom Smartphone.',
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Automatische AU-Erinnerung',
      description: 'Nach 3 Tagen erinnert ZeitPal automatisch an die Arbeitsunfähigkeitsbescheinigung.',
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Dokumenten-Upload',
      description: 'AU-Bescheinigungen direkt hochladen und digital archivieren.',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Krankenstatistik',
      description: 'Übersicht über Krankheitstage pro Mitarbeiter und Team.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'DSGVO-konform',
      description: 'Sensible Gesundheitsdaten werden nach höchsten Standards geschützt.',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Sofortige Benachrichtigung',
      description: 'Führungskräfte werden sofort über Krankmeldungen informiert.',
    },
  ];

  const benefits = [
    'Keine Anrufe mehr morgens um 7 Uhr',
    'Automatische Erinnerung an AU nach 3 Tagen',
    'Digitales Archiv für Arbeitsunfähigkeitsbescheinigungen',
    'Übersicht über Krankheitstage für HR',
    'Datenschutzkonforme Verarbeitung sensibler Daten',
    'Unterscheidung zwischen Krankheit und Kindkrank',
  ];

  const faqItems = [
    {
      question: 'Wann muss eine AU-Bescheinigung hochgeladen werden?',
      answer: 'Nach deutschem Arbeitsrecht muss spätestens am 4. Krankheitstag eine AU vorliegen. ZeitPal erinnert automatisch.',
    },
    {
      question: 'Werden Gesundheitsdaten besonders geschützt?',
      answer: 'Ja, Gesundheitsdaten sind besonders sensibel und werden verschlüsselt gespeichert. Nur berechtigte Personen haben Zugriff.',
    },
    {
      question: 'Kann auch Kindkrank erfasst werden?',
      answer: 'Ja, ZeitPal unterscheidet zwischen eigener Krankheit und Kindkrank mit separaten Kontingenten.',
    },
  ];

  const relatedLinks = [
    { href: '/abwesenheitsmanagement', label: 'Abwesenheitsmanagement' },
    { href: '/urlaubsverwaltung', label: 'Urlaubsverwaltung' },
    { href: '/hr-software', label: 'HR Software' },
    { href: '/features', label: 'Alle Funktionen' },
  ];

  return (
    <SEOLandingPage
      title={t('marketing:seo.krankmeldungDigital.h1')}
      subtitle={t('marketing:seo.krankmeldungDigital.subtitle')}
      features={features}
      benefits={benefits}
      ctaText="Digitale Krankmeldung starten"
      ctaHref="/auth/sign-up"
      relatedLinks={relatedLinks}
      faqItems={faqItems}
    />
  );
}

export default withI18n(KrankmeldungDigitalPage);
