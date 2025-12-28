import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { TeamMembersList } from './_components/team-members-list';

export const runtime = 'edge';

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="common:routes.team" />}
        description="View your team members and their availability"
      />

      <PageBody>
        <TeamMembersList />
      </PageBody>
    </>
  );
}
