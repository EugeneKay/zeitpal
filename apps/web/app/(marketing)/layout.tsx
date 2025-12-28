import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';
import { auth } from '~/lib/auth/auth';
import { withI18n } from '~/lib/i18n/with-i18n';

async function SiteLayout(props: React.PropsWithChildren) {
  const session = await auth();

  return (
    <div className={'flex min-h-[100vh] flex-col'}>
      <SiteHeader user={session?.user ?? null} />

      {props.children}

      <SiteFooter />
    </div>
  );
}

export default withI18n(SiteLayout);
