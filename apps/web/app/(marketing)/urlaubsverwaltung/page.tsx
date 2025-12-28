import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Bell,
} from 'lucide-react';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SEOLandingPage } from '~/(marketing)/_components/seo-landing-page';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:seo.urlaubsverwaltung.metaTitle'),
    description: t('marketing:seo.urlaubsverwaltung.metaDescription'),
  };
};

async function UrlaubsverwaltungPage() {
  const { t } = await createI18nServerInstance();

  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Urlaubsanträge in Sekunden',
      description: 'Mitarbeiter stellen Anträge mit wenigen Klicks. Keine Formulare, keine E-Mails.',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Ein-Klick-Genehmigung',
      description: 'Führungskräfte genehmigen oder lehnen ab - auch vom Smartphone.',
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Teamkalender',
      description: 'Alle Abwesenheiten auf einen Blick. Vermeiden Sie Überschneidungen.',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Automatische Berechnung',
      description: 'Resturlaub, Übertrag und anteilige Ansprüche werden automatisch berechnet.',
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Benachrichtigungen',
      description: 'E-Mail-Benachrichtigungen bei neuen Anträgen und Statusänderungen.',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Halbe Urlaubstage',
      description: 'Unterstützung für halbe Tage und flexible Abwesenheitszeiten.',
    },
  ];

  const benefits = [
    'Keine Excel-Tabellen mehr - alles digital und zentral',
    'Automatische Berechnung von Resturlaub und Übertrag',
    'Teamkalender zeigt alle Abwesenheiten auf einen Blick',
    'Mobile-optimiert für Genehmigungen unterwegs',
    'DSGVO-konform mit deutschen Serverstandorten',
    'Kostenlos für Teams bis 5 Personen',
  ];

  const faqItems = [
    {
      question: 'Was kostet die Urlaubsverwaltung mit ZeitPal?',
      answer: 'Für Teams bis 5 Personen ist ZeitPal dauerhaft kostenlos. Größere Teams zahlen ab 4,99€ pro Nutzer/Monat.',
    },
    {
      question: 'Werden gesetzliche Feiertage berücksichtigt?',
      answer: 'Ja, ZeitPal kennt alle deutschen Feiertage nach Bundesland und berechnet Urlaubstage automatisch korrekt.',
    },
    {
      question: 'Kann ich bestehende Urlaubsdaten importieren?',
      answer: 'Ja, wir unterstützen den Import von Excel-Dateien. Unser Support hilft Ihnen gerne beim Umstieg.',
    },
  ];

  const relatedLinks = [
    { href: '/abwesenheitsmanagement', label: 'Abwesenheitsmanagement' },
    { href: '/urlaubsplaner', label: 'Urlaubsplaner' },
    { href: '/krankmeldung-digital', label: 'Digitale Krankmeldung' },
    { href: '/fuer-startups', label: 'Für Startups' },
  ];

  return (
    <SEOLandingPage
      title={t('marketing:seo.urlaubsverwaltung.h1')}
      subtitle={t('marketing:seo.urlaubsverwaltung.subtitle')}
      features={features}
      benefits={benefits}
      ctaText="Urlaubsverwaltung kostenlos starten"
      ctaHref="/auth/sign-up"
      relatedLinks={relatedLinks}
      faqItems={faqItems}
    />
  );
}

export default withI18n(UrlaubsverwaltungPage);
