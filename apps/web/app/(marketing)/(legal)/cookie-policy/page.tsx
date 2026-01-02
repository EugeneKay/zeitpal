import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:cookiePolicy'),
    description: t('marketing:cookiePolicyDescription'),
  };
}

async function CookiePolicyPage() {
  const { t } = await createI18nServerInstance();

  const sections = t('marketing:cookiePolicyContent.sections', {
    returnObjects: true,
  }) as Array<{ title: string; content: string }>;

  const lastUpdated = t('marketing:cookiePolicyContent.lastUpdated', {
    date: '01.01.2025',
  });

  return (
    <div>
      <SitePageHeader
        title={t('marketing:cookiePolicy')}
        subtitle={t('marketing:cookiePolicyDescription')}
      />

      <div className="container mx-auto py-8 pb-16 max-w-4xl">
        <p className="text-sm text-muted-foreground mb-8">{lastUpdated}</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-8">
            {t('marketing:cookiePolicyContent.intro')}
          </p>

          {sections.map((section, index) => (
            <section key={index} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withI18n(CookiePolicyPage);
