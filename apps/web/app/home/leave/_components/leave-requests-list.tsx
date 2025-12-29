'use client';

import { useState } from 'react';

import Link from 'next/link';

import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
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

  // Confirmation dialog state
  const [withdrawingRequest, setWithdrawingRequest] = useState<{
    id: string;
    leaveType: string;
    dateRange: string;
  } | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState<{
    id: string;
    leaveType: string;
    dateRange: string;
  } | null>(null);

  const requests = data?.data || [];

  const handleWithdraw = async () => {
    if (!withdrawingRequest) return;
    try {
      await withdrawRequest.mutateAsync(withdrawingRequest.id);
      toast.success('Leave request withdrawn');
      setWithdrawingRequest(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to withdraw request');
    }
  };

  const handleCancel = async () => {
    if (!cancellingRequest) return;
    try {
      await cancelRequest.mutateAsync(cancellingRequest.id);
      toast.success('Leave request cancelled');
      setCancellingRequest(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel request');
    }
  };

  const getDateRange = (startDate: string, endDate: string) => {
    const start = format(new Date(startDate), 'MMM d, yyyy');
    const end = format(new Date(endDate), 'MMM d, yyyy');
    return startDate === endDate ? start : `${start} - ${end}`;
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
              const dateRange = getDateRange(request.startDate, request.endDate);
              const leaveTypeName = request.leaveType?.code || 'unknown';

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: request.leaveType?.color || '#6B7280' }}
                      />
                      <Trans i18nKey={`leave:types.${leaveTypeName}`} />
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
                          <DropdownMenuItem
                            onClick={() => setWithdrawingRequest({
                              id: request.id,
                              leaveType: leaveTypeName,
                              dateRange,
                            })}
                          >
                            <Trans i18nKey="leave:detail.withdraw" />
                          </DropdownMenuItem>
                        )}
                        {request.status === 'approved' && (
                          <DropdownMenuItem
                            onClick={() => setCancellingRequest({
                              id: request.id,
                              leaveType: leaveTypeName,
                              dateRange,
                            })}
                          >
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

      {/* Withdraw Request Confirmation Dialog */}
      <AlertDialog
        open={!!withdrawingRequest}
        onOpenChange={(open) => !open && setWithdrawingRequest(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans i18nKey="leave:withdrawDialog.title" defaults="Withdraw Leave Request" />
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans
                i18nKey="leave:withdrawDialog.description"
                defaults="Are you sure you want to withdraw this {leaveType} request for {dateRange}? This action cannot be undone."
                values={{
                  leaveType: withdrawingRequest?.leaveType || '',
                  dateRange: withdrawingRequest?.dateRange || '',
                }}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawRequest.isPending}>
              <Trans i18nKey="common:cancel" defaults="Cancel" />
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleWithdraw}
              disabled={withdrawRequest.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {withdrawRequest.isPending ? (
                <Trans i18nKey="leave:withdrawDialog.withdrawing" defaults="Withdrawing..." />
              ) : (
                <Trans i18nKey="leave:withdrawDialog.withdraw" defaults="Withdraw Request" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Request Confirmation Dialog */}
      <AlertDialog
        open={!!cancellingRequest}
        onOpenChange={(open) => !open && setCancellingRequest(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Trans i18nKey="leave:cancelDialog.title" defaults="Cancel Approved Leave" />
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Trans
                i18nKey="leave:cancelDialog.description"
                defaults="Are you sure you want to cancel this approved {leaveType} leave for {dateRange}? Your manager will be notified and the days will be returned to your balance."
                values={{
                  leaveType: cancellingRequest?.leaveType || '',
                  dateRange: cancellingRequest?.dateRange || '',
                }}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelRequest.isPending}>
              <Trans i18nKey="common:keepLeave" defaults="Keep Leave" />
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelRequest.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelRequest.isPending ? (
                <Trans i18nKey="leave:cancelDialog.cancelling" defaults="Cancelling..." />
              ) : (
                <Trans i18nKey="leave:cancelDialog.cancel" defaults="Cancel Leave" />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
