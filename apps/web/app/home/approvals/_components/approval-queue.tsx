'use client';

import { useState } from 'react';

import { format } from 'date-fns';
import { Check, Loader2, MoreHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  usePendingApprovals,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
} from '~/lib/hooks';
import type { LeaveRequest } from '~/lib/types';

interface PendingRequest {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl?: string | null;
  };
  leaveType: {
    code: string;
    color: string;
  };
  startDate: string;
  endDate: string;
  workDays: number;
  reason?: string | null;
  submittedAt: string;
}

interface ApprovalDialogProps {
  request: PendingRequest | null;
  action: 'approve' | 'reject' | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

function ApprovalDialog({ request, action, isSubmitting, onClose, onConfirm }: ApprovalDialogProps) {
  const [comment, setComment] = useState('');

  const handleConfirm = async () => {
    if (action === 'reject' && !comment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    onConfirm(comment);
    setComment('');
  };

  if (!request || !action) return null;

  return (
    <Dialog open={!!request && !!action} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? (
              <Trans i18nKey="leave:approvals.approveConfirm" />
            ) : (
              <Trans i18nKey="leave:approvals.rejectConfirm" />
            )}
          </DialogTitle>
          <DialogDescription>
            <Trans i18nKey={`leave:types.${request.leaveType.code}`} /> request from{' '}
            {request.user.name}
            <br />
            {format(new Date(request.startDate), 'MMM d')} -{' '}
            {format(new Date(request.endDate), 'MMM d, yyyy')} ({request.workDays} days)
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder={
              action === 'approve'
                ? 'Add a comment (optional)...'
                : 'Please provide a reason for rejection...'
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <Trans i18nKey="common:cancel" />
          </Button>
          <Button
            variant={action === 'approve' ? 'default' : 'destructive'}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : action === 'approve' ? (
              'Approve'
            ) : (
              'Reject'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ApprovalQueueSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="mt-1 h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ApprovalQueue() {
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const { data, isLoading } = usePendingApprovals();
  const approveRequest = useApproveLeaveRequest();
  const rejectRequest = useRejectLeaveRequest();

  // Transform API response to expected format
  const requests: PendingRequest[] = (data?.data || []).map((req: LeaveRequest) => ({
    id: req.id,
    user: {
      id: req.user?.id || '',
      name: req.user?.name || null,
      email: req.user?.email || '',
      avatarUrl: req.user?.avatarUrl,
    },
    leaveType: {
      code: req.leaveType?.code || 'unknown',
      color: req.leaveType?.color || '#6B7280',
    },
    startDate: req.startDate,
    endDate: req.endDate,
    workDays: req.workDays,
    reason: req.reason,
    submittedAt: req.submittedAt || req.createdAt,
  }));

  const handleApprove = (request: PendingRequest) => {
    setSelectedRequest(request);
    setAction('approve');
  };

  const handleReject = (request: PendingRequest) => {
    setSelectedRequest(request);
    setAction('reject');
  };

  const handleConfirm = async (comment: string) => {
    if (!selectedRequest) return;

    try {
      if (action === 'approve') {
        await approveRequest.mutateAsync({
          leaveRequestId: selectedRequest.id,
          comment: comment || undefined,
        });
        toast.success('Request approved successfully');
      } else {
        await rejectRequest.mutateAsync({
          leaveRequestId: selectedRequest.id,
          reason: comment,
        });
        toast.success('Request rejected');
      }
      setSelectedRequest(null);
      setAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed');
    }
  };

  const handleClose = () => {
    setSelectedRequest(null);
    setAction(null);
  };

  const isSubmitting = approveRequest.isPending || rejectRequest.isPending;

  if (isLoading) {
    return <ApprovalQueueSkeleton />;
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h3 className="text-lg font-semibold">All caught up!</h3>
          <p className="text-muted-foreground">
            <Trans i18nKey="leave:approvals.noRequests" />
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Pending Requests ({requests.length})
            </span>
            {requests.length > 1 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Trans i18nKey="leave:approvals.bulkApprove" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.user.avatarUrl ?? undefined} />
                        <AvatarFallback>{getInitials(request.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.user.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {request.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: request.leaveType.color }}
                      />
                      <Trans i18nKey={`leave:types.${request.leaveType.code}`} />
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.startDate), 'MMM d')} -{' '}
                    {format(new Date(request.endDate), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {request.workDays} <Trans i18nKey="leave:balance.days" />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(request.submittedAt), 'MMM d')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleApprove(request)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Approve</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleReject(request)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Reject</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>View Employee Profile</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ApprovalDialog
        request={selectedRequest}
        action={action}
        isSubmitting={isSubmitting}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </>
  );
}
