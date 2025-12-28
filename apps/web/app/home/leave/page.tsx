import Link from 'next/link';

import { Plus } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

import { LeaveBalanceOverview } from '../_components/leave-balance-overview';
import { LeaveRequestsList } from './_components/leave-requests-list';

export const runtime = 'edge';

export default function LeavePage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey="leave:title" />}
        description={<Trans i18nKey="leave:description" />}
      >
        <Button asChild>
          <Link href={pathsConfig.app.leaveRequest}>
            <Plus className="mr-2 h-4 w-4" />
            <Trans i18nKey="leave:dashboard.newRequest" />
          </Link>
        </Button>
      </PageHeader>

      <PageBody>
        <div className="grid gap-6">
          {/* Leave Balance */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">
              <Trans i18nKey="leave:balance.title" />
            </h2>
            <LeaveBalanceOverview />
          </section>

          {/* Leave Requests */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">
              <Trans i18nKey="leave:dashboard.recentRequests" />
            </h2>
            <LeaveRequestsList />
          </section>
        </div>
      </PageBody>
    </>
  );
}
