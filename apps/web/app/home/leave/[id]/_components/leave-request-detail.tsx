'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { format } from 'date-fns';
import { ArrowLeft, Calendar, Clock, FileText, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import {
  useLeaveRequest,
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

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function LeaveRequestDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    </div>
  );
}

interface LeaveRequestDetailProps {
  id: string;
}

export function LeaveRequestDetail({ id }: LeaveRequestDetailProps) {
  const router = useRouter();
  const { data, isLoading, error } = useLeaveRequest(id);
  const withdrawRequest = useWithdrawLeaveRequest();
  const cancelRequest = useCancelLeaveRequest();

  const handleWithdraw = async () => {
    try {
      await withdrawRequest.mutateAsync(id);
      toast.success('Leave request withdrawn');
      router.push(pathsConfig.app.leave);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to withdraw request');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelRequest.mutateAsync(id);
      toast.success('Leave request cancelled');
      router.push(pathsConfig.app.leave);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel request');
    }
  };

  if (isLoading) {
    return <LeaveRequestDetailSkeleton />;
  }

  if (error || !data?.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {error?.message || 'Leave request not found'}
          </p>
          <Button asChild className="mt-4">
            <Link href={pathsConfig.app.leave}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <Trans i18nKey="common:back" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const request = data.data;
  const startDate = format(new Date(request.startDate), 'EEEE, MMMM d, yyyy');
  const endDate = format(new Date(request.endDate), 'EEEE, MMMM d, yyyy');
  const submittedDate = format(new Date(request.submittedAt), 'MMMM d, yyyy \'at\' h:mm a');
  const isSameDay = request.startDate === request.endDate;

  const isActionPending = withdrawRequest.isPending || cancelRequest.isPending;

  return (
    <div className="space-y-6">
      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.user.avatarUrl ?? undefined} />
                <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{request.user.name}</CardTitle>
                <CardDescription>{request.user.email}</CardDescription>
              </div>
            </div>
            <Badge variant={statusVariants[request.status as LeaveRequestStatus]} className="text-sm">
              <Trans i18nKey={`leave:status.${request.status}`} />
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Leave Type */}
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: request.leaveType.color }}
            />
            <span className="text-lg font-medium">
              <Trans i18nKey={`leave:types.${request.leaveType.code}`} />
            </span>
          </div>

          <Separator />

          {/* Date and Duration Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <Trans i18nKey="leave:detail.period" />
                  </p>
                  {isSameDay ? (
                    <p className="mt-1">{startDate}</p>
                  ) : (
                    <div className="mt-1">
                      <p>{startDate}</p>
                      <p className="text-muted-foreground">to</p>
                      <p>{endDate}</p>
                    </div>
                  )}
                  {(request.startHalfDay || request.endHalfDay) && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {request.startHalfDay && (
                        <span>
                          Start: <Trans i18nKey={`leave:request.${request.startHalfDay}`} />
                        </span>
                      )}
                      {request.startHalfDay && request.endHalfDay && ' • '}
                      {request.endHalfDay && (
                        <span>
                          End: <Trans i18nKey={`leave:request.${request.endHalfDay}`} />
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <Trans i18nKey="leave:detail.duration" />
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {request.workDays}{' '}
                    <span className="text-base font-normal text-muted-foreground">
                      <Trans i18nKey={request.workDays === 1 ? 'leave:balance.day' : 'leave:balance.days'} />
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <Trans i18nKey="leave:detail.submittedOn" />
                  </p>
                  <p className="mt-1">{submittedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          {request.reason && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    <Trans i18nKey="leave:detail.reason" />
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{request.reason}</p>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          {(request.status === 'pending' || request.status === 'approved') && (
            <>
              <Separator />
              <div className="flex gap-3">
                {request.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={handleWithdraw}
                    disabled={isActionPending}
                  >
                    {withdrawRequest.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Trans i18nKey="leave:detail.withdraw" />
                  </Button>
                )}
                {request.status === 'approved' && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isActionPending}
                  >
                    {cancelRequest.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Trans i18nKey="leave:detail.cancel" />
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Approval History Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey="leave:detail.approvalHistory" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {request.approvals && request.approvals.length > 0 ? (
            <div className="space-y-4">
              {request.approvals.map((approval) => {
                const action = approval.action;
                return (
                  <div
                    key={approval.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div
                      className={`mt-0.5 h-2 w-2 rounded-full ${
                        action === 'approved'
                          ? 'bg-green-500'
                          : action === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {approval.approver?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(approval.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                        </p>
                      </div>
                      <p className="text-sm capitalize text-muted-foreground">
                        {action}
                      </p>
                      {approval.comment && (
                        <p className="mt-2 text-sm">{approval.comment}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">
              <Trans i18nKey="leave:detail.noApprovals" />
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
