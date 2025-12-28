'use client';

import Link from 'next/link';

import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Skeleton } from '@kit/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Trans } from '@kit/ui/trans';

import {
  useMyLeaveRequests,
  useWithdrawLeaveRequest,
  useCancelLeaveRequest,
} from '~/lib/hooks';
import type { LeaveRequestStatus } from '~/lib/types';

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

function LeaveRequestsTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Trans i18nKey="leave:request.leaveType" /></TableHead>
          <TableHead><Trans i18nKey="leave:request.dateRange" /></TableHead>
          <TableHead><Trans i18nKey="leave:request.workDays" /></TableHead>
          <TableHead><Trans i18nKey="leave:status.pending" /></TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function LeaveRequestsList() {
  const { data, isLoading } = useMyLeaveRequests();
  const withdrawRequest = useWithdrawLeaveRequest();
  const cancelRequest = useCancelLeaveRequest();

  const requests = data?.data || [];

  const handleWithdraw = async (requestId: string) => {
    try {
      await withdrawRequest.mutateAsync(requestId);
      toast.success('Leave request withdrawn');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to withdraw request');
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      await cancelRequest.mutateAsync(requestId);
      toast.success('Leave request cancelled');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel request');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <LeaveRequestsTableSkeleton />
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
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Trans i18nKey="leave:request.leaveType" /></TableHead>
              <TableHead><Trans i18nKey="leave:request.dateRange" /></TableHead>
              <TableHead><Trans i18nKey="leave:request.workDays" /></TableHead>
              <TableHead><Trans i18nKey="leave:detail.status" /></TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const startDate = format(new Date(request.startDate), 'MMM d, yyyy');
              const endDate = format(new Date(request.endDate), 'MMM d, yyyy');
              const dateRange =
                request.startDate === request.endDate
                  ? startDate
                  : `${startDate} - ${endDate}`;

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: request.leaveType?.color || '#6B7280' }}
                      />
                      <Trans i18nKey={`leave:types.${request.leaveType?.code || 'unknown'}`} />
                    </div>
                  </TableCell>
                  <TableCell>{dateRange}</TableCell>
                  <TableCell>
                    {request.workDays} <Trans i18nKey="leave:balance.days" />
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[request.status]}>
                      <Trans i18nKey={`leave:status.${request.status}`} />
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/home/leave/${request.id}`}>
                            <Trans i18nKey="leave:detail.title" />
                          </Link>
                        </DropdownMenuItem>
                        {request.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleWithdraw(request.id)}>
                            <Trans i18nKey="leave:detail.withdraw" />
                          </DropdownMenuItem>
                        )}
                        {request.status === 'approved' && (
                          <DropdownMenuItem onClick={() => handleCancel(request.id)}>
                            <Trans i18nKey="leave:detail.cancel" />
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
