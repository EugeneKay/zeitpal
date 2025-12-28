'use client';

import { useQuery } from '@tanstack/react-query';

import type { LeaveBalance } from '~/lib/types';

interface LeaveBalancesResponse {
  data: LeaveBalance[];
}

interface UseLeaveBalancesOptions {
  userId?: string;
  year?: number;
}

async function fetchLeaveBalances(
  options: UseLeaveBalancesOptions = {}
): Promise<LeaveBalance[]> {
  const params = new URLSearchParams();

  if (options.userId) {
    params.set('userId', options.userId);
  }
  if (options.year) {
    params.set('year', options.year.toString());
  }

  const url = `/api/leave-balances${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401) {
      return [];
    }
    throw new Error('Failed to fetch leave balances');
  }

  const result: LeaveBalancesResponse = await response.json();
  return result.data;
}

export function useLeaveBalances(options: UseLeaveBalancesOptions = {}) {
  const { userId, year = new Date().getFullYear() } = options;

  return useQuery({
    queryKey: ['leave-balances', { userId, year }],
    queryFn: () => fetchLeaveBalances({ userId, year }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
