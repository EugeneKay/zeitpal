'use client';

import { useQuery } from '@tanstack/react-query';

import type { LeaveType } from '~/lib/types';

interface LeaveTypesResponse {
  data: LeaveType[];
}

async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const response = await fetch('/api/leave-types');

  if (!response.ok) {
    if (response.status === 401) {
      return [];
    }
    throw new Error('Failed to fetch leave types');
  }

  const result: LeaveTypesResponse = await response.json();
  return result.data;
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: fetchLeaveTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes - leave types don't change often
  });
}
