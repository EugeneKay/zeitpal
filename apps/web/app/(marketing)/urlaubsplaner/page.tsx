import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Bell,
  Eye,
} from 'lucide-react';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SEOLandingPage } from '~/(marketing)/_components/seo-landing-page';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:seo.urlaubsplaner.metaTitle'),
    description: t('marketing:seo.urlaubsplaner.metaDescription'),
  };
};

async function UrlaubsplanerPage() {
  const { t } = await createI18nServerInstance();

  const features = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Visueller Teamkalender',
      description: 'Alle Urlaubszeiten übersichtlich in einer Kalenderansicht.',
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: 'Konfliktprüfung',
      description: 'Automatische Warnung bei Überschneidungen im Team.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Teamansicht',
      description: 'Sehen Sie wer wann verfügbar ist - ideal für Projektplanung.',
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: 'Erinnerungen',
      description: 'Automatische Benachrichtigungen für anstehende Urlaubszeiten.',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Feiertage inklusive',
      description: 'Alle deutschen Feiertage nach Bundesland bereits eingetragen.',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Export-Funktion',
      description: 'Exportieren Sie den Kalender für andere Anwendungen.',
    },
  ];

  const benefits = [
    'Übersichtliche Kalenderansicht für das ganze Team',
    'Konflikte und Engpässe frühzeitig erkennen',
    'Bessere Projektplanung durch Urlaubsübersicht',
    'Automatische Berücksichtigung von Feiertagen',
    'Einfache Abstimmung im Team',
    'Zugriff von überall - auch mobil',
  ];

  const faqItems = [
    {
      question: 'Kann ich den Urlaubsplaner mit Google Calendar synchronisieren?',
      answer: 'Ja, ZeitPal bietet Kalendersynchronisation mit gängigen Kalender-Apps wie Google Calendar und Outlook.',
    },
    {
      question: 'Werden Brückentage und Schulferien angezeigt?',
      answer: 'Alle gesetzlichen Feiertage werden angezeigt. Schulferien können als Notiz hinzugefügt werden.',
    },
    {
      question: 'Können Mitarbeiter den Kalender des Teams einsehen?',
      answer: 'Ja, die Sichtbarkeit kann flexibel eingestellt werden - von "nur eigene" bis "gesamtes Unternehmen".',
    },
  ];

  const relatedLinks = [
    { href: '/urlaubsverwaltung', label: 'Urlaubsverwaltung' },
    { href: '/abwesenheitsmanagement', label: 'Abwesenheitsmanagement' },
    { href: '/features', label: 'Alle Funktionen' },
    { href: '/fuer-startups', label: 'Für Startups' },
  ];

  return (
    <SEOLandingPage
      title={t('marketing:seo.urlaubsplaner.h1')}
      subtitle={t('marketing:seo.urlaubsplaner.subtitle')}
      features={features}
      benefits={benefits}
      ctaText="Urlaubsplaner kostenlos nutzen"
      ctaHref="/auth/sign-up"
      relatedLinks={relatedLinks}
      faqItems={faqItems}
    />
  );
}

export default withI18n(UrlaubsplanerPage);
