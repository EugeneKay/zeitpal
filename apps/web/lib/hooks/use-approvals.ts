'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getCsrfToken } from '~/lib/utils/csrf';

interface ApproveLeaveRequestInput {
  leaveRequestId: string;
  comment?: string;
}

interface RejectLeaveRequestInput {
  leaveRequestId: string;
  reason: string;
}

async function approveLeaveRequest(
  input: ApproveLeaveRequestInput
): Promise<void> {
  const response = await fetch(`/api/leave-requests/${input.leaveRequestId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': getCsrfToken(),
    },
    body: JSON.stringify({ comment: input.comment }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve leave request');
  }
}

async function rejectLeaveRequest(
  input: RejectLeaveRequestInput
): Promise<void> {
  const response = await fetch(`/api/leave-requests/${input.leaveRequestId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': getCsrfToken(),
    },
    body: JSON.stringify({ reason: input.reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reject leave request');
  }
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
    },
  });
}
