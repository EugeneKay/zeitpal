import {
  Rocket,
  Zap,
  Clock,
  Users,
  Shield,
  Heart,
} from 'lucide-react';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SEOLandingPage } from '~/(marketing)/_components/seo-landing-page';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:useCases.startups.metaTitle'),
    description: t('marketing:useCases.startups.metaDescription'),
  };
};

async function FuerStartupsPage() {
  const { t } = await createI18nServerInstance();

  const features = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Dauerhaft kostenlos',
      description: 'Für Teams bis 5 Personen. Keine versteckten Kosten, keine Kreditkarte.',
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'In 5 Minuten startklar',
      description: 'Registrieren, Team einladen, loslegen. Keine komplizierte Einrichtung.',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Zeit sparen',
      description: 'Keine Excel-Listen, keine E-Mails. Alles an einem Ort.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Team-Transparenz',
      description: 'Alle sehen, wer wann im Urlaub ist. Bessere Planung für alle.',
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: 'Wächst mit Ihnen',
      description: 'Wenn Ihr Team größer wird, upgraden Sie einfach. Faire Preise.',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Von Anfang an professionell',
      description: 'DSGVO-konform und sicher - auch wenn Sie noch klein sind.',
    },
  ];

  const benefits = [
    'Kostenlos für Teams bis 5 Personen - dauerhaft',
    'Professionelle Urlaubsverwaltung vom ersten Tag an',
    'Keine Zeit für HR-Bürokratie verschwenden',
    'Mobile-first - perfekt für moderne Teams',
    'Automatische Berechnung von Urlaubsansprüchen',
    'Einfacher Umstieg wenn das Team wächst',
  ];

  const faqItems = [
    {
      question: 'Ist der Starter-Plan wirklich dauerhaft kostenlos?',
      answer: 'Ja! Der Starter-Plan für Teams bis 5 Personen ist dauerhaft kostenlos. Keine zeitliche Begrenzung, keine versteckten Kosten.',
    },
    {
      question: 'Was passiert, wenn wir auf 6 Mitarbeiter wachsen?',
      answer: 'Sie können jederzeit auf den Team-Plan upgraden (4,99€/Nutzer/Monat). Alle Daten bleiben erhalten.',
    },
    {
      question: 'Können wir ZeitPal auch für Werkstudenten nutzen?',
      answer: 'Ja, jeder Mitarbeiter - ob Vollzeit, Teilzeit oder Werkstudent - kann ZeitPal nutzen. Pro-rata-Urlaubsansprüche werden automatisch berechnet.',
    },
  ];

  const relatedLinks = [
    { href: '/fuer-mittelstand', label: 'Für Mittelstand' },
    { href: '/pricing', label: 'Preise' },
    { href: '/urlaubsverwaltung', label: 'Urlaubsverwaltung' },
    { href: '/features', label: 'Alle Funktionen' },
  ];

  return (
    <SEOLandingPage
      title={t('marketing:useCases.startups.h1')}
      subtitle={t('marketing:useCases.startups.subtitle')}
      features={features}
      benefits={benefits}
      ctaText="Kostenlos für Startups starten"
      ctaHref="/auth/sign-up"
      relatedLinks={relatedLinks}
      faqItems={faqItems}
    />
  );
}

export default withI18n(FuerStartupsPage);
