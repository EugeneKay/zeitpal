import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { TeamsManagement } from './_components/teams-management';

export const runtime = 'edge';

export default function AdminTeamsPage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="admin:teams.title" />}
        description={<Trans i18nKey="admin:teams.description" />}
      />

      <PageBody>
        <TeamsManagement />
      </PageBody>
    </>
  );
}
