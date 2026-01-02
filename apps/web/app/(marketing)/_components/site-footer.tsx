import { Footer } from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import { LocalizedLink } from '~/components/localized-link';
import appConfig from '~/config/app.config';

export function SiteFooter() {
  return (
    <Footer
      logo={<AppLogo className="w-[85px] md:w-[95px]" />}
      description={<Trans i18nKey="marketing:footerDescription" />}
      LinkComponent={LocalizedLink}
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
              label: <Trans i18nKey="marketing:featuresLabel" />,
            },
            {
              href: '/pricing',
              label: <Trans i18nKey="marketing:pricingLabel" />,
            },
            {
              href: '/compare',
              label: <Trans i18nKey="marketing:footer.compare" />,
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
              href: '/leave-management',
              label: <Trans i18nKey="marketing:footer.leaveManagement" />,
            },
            {
              href: '/absence-management',
              label: <Trans i18nKey="marketing:footer.absenceManagement" />,
            },
            {
              href: '/for-startups',
              label: <Trans i18nKey="marketing:footer.forStartups" />,
            },
            {
              href: '/for-smes',
              label: <Trans i18nKey="marketing:footer.forSMEs" />,
            },
          ],
        },
        {
          heading: <Trans i18nKey="marketing:footer.company" />,
          links: [
            {
              href: '/about',
              label: <Trans i18nKey="marketing:aboutLabel" />,
            },
            {
              href: '/customers',
              label: <Trans i18nKey="marketing:customers" />,
            },
            {
              href: '/contact',
              label: <Trans i18nKey="marketing:contactLabel" />,
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
          ],
        },
      ]}
    />
  );
}
