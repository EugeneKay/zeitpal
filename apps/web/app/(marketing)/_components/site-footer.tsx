import { Footer } from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import appConfig from '~/config/app.config';

export function SiteFooter() {
  return (
    <Footer
      logo={<AppLogo className="w-[85px] md:w-[95px]" />}
      description={<Trans i18nKey="marketing:footerDescription" />}
      copyright={
        <Trans
          i18nKey="marketing:copyright"
          values={{
            product: appConfig.name,
            year: new Date().getFullYear(),
          }}
        />
      }
      sections={[
        {
          heading: <Trans i18nKey="marketing:footer.product" />,
          links: [
            {
              href: '/features',
              label: <Trans i18nKey="marketing:features" />,
            },
            {
              href: '/pricing',
              label: <Trans i18nKey="marketing:pricing" />,
            },
            {
              href: '/demo',
              label: <Trans i18nKey="marketing:demo" />,
            },
            {
              href: '/faq',
              label: <Trans i18nKey="marketing:faq" />,
            },
          ],
        },
        {
          heading: <Trans i18nKey="marketing:footer.solutions" />,
          links: [
            {
              href: '/urlaubsverwaltung',
              label: 'Urlaubsverwaltung',
            },
            {
              href: '/abwesenheitsmanagement',
              label: 'Abwesenheitsmanagement',
            },
            {
              href: '/fuer-startups',
              label: 'Für Startups',
            },
            {
              href: '/fuer-mittelstand',
              label: 'Für Mittelstand',
            },
          ],
        },
        {
          heading: <Trans i18nKey="marketing:footer.company" />,
          links: [
            {
              href: '/about',
              label: <Trans i18nKey="marketing:about" />,
            },
            {
              href: '/kunden',
              label: <Trans i18nKey="marketing:customers" />,
            },
            {
              href: '/contact',
              label: <Trans i18nKey="marketing:contact" />,
            },
          ],
        },
        {
          heading: <Trans i18nKey="marketing:footer.legal" />,
          links: [
            {
              href: '/terms-of-service',
              label: <Trans i18nKey="marketing:termsOfService" />,
            },
            {
              href: '/privacy-policy',
              label: <Trans i18nKey="marketing:privacyPolicy" />,
            },
            {
              href: '/cookie-policy',
              label: <Trans i18nKey="marketing:cookiePolicy" />,
            },
            {
              href: '/imprint',
              label: <Trans i18nKey="marketing:imprint" />,
            },
          ],
        },
      ]}
    />
  );
}
