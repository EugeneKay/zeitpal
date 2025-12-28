'use client';

import Link from 'next/link';

import { format } from 'date-fns';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';
import { Trans } from '@kit/ui/trans';

import type { LeaveRequestStatus } from '~/lib/types';

// Mock data - will be replaced with React Query hook
const mockRequests = [
  {
    id: '1',
    leaveType: { code: 'vacation', color: '#3B82F6' },
    startDate: '2024-12-23',
    endDate: '2024-12-27',
    workDays: 4,
    status: 'approved' as LeaveRequestStatus,
  },
  {
    id: '2',
    leaveType: { code: 'vacation', color: '#3B82F6' },
    startDate: '2025-01-06',
    endDate: '2025-01-10',
    workDays: 5,
    status: 'pending' as LeaveRequestStatus,
  },
  {
    id: '3',
    leaveType: { code: 'sick', color: '#EF4444' },
    startDate: '2024-12-10',
    endDate: '2024-12-11',
    workDays: 2,
    status: 'approved' as LeaveRequestStatus,
  },
];

const statusVariants: Record<
  LeaveRequestStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  draft: 'outline',
  pending: 'default',
  approved: 'secondary',
  rejected: 'destructive',
  cancelled: 'outline',
  withdrawn: 'outline',
};

interface RecentRequestItemProps {
  id: string;
  leaveType: { code: string; color: string };
  startDate: string;
  endDate: string;
  workDays: number;
  status: LeaveRequestStatus;
}

function RecentRequestItem({
  id,
  leaveType,
  startDate,
  endDate,
  workDays,
  status,
}: RecentRequestItemProps) {
  const formattedStart = format(new Date(startDate), 'MMM d');
  const formattedEnd = format(new Date(endDate), 'MMM d, yyyy');
  const dateRange =
    startDate === endDate ? formattedStart : `${formattedStart} - ${formattedEnd}`;

  return (
    <Link
      href={`/home/leave/${id}`}
      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: leaveType.color }}
        />
        <div>
          <p className="text-sm font-medium">
            <Trans i18nKey={`leave:types.${leaveType.code}`} />
          </p>
          <p className="text-muted-foreground text-xs">{dateRange}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs">
          {workDays} <Trans i18nKey="leave:balance.days" />
        </span>
        <Badge variant={statusVariants[status]}>
          <Trans i18nKey={`leave:status.${status}`} />
        </Badge>
      </div>
    </Link>
  );
}

function RecentRequestSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-2 w-2 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function RecentRequests() {
  // TODO: Replace with React Query hook
  const isLoading = false;
  const requests = mockRequests;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-2 p-4">
          {[...Array(3)].map((_, i) => (
            <RecentRequestSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            <Trans i18nKey="leave:history.noRequests" />
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        {requests.slice(0, 5).map((request) => (
          <RecentRequestItem key={request.id} {...request} />
        ))}
      </CardContent>
    </Card>
  );
}
