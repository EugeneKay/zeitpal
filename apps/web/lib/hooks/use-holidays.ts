'use client';

import { useQuery } from '@tanstack/react-query';

import type { PublicHoliday } from '~/lib/types';

interface HolidaysResponse {
  data: PublicHoliday[];
}

interface UseHolidaysOptions {
  year?: number;
  bundesland?: string;
}

async function fetchHolidays(
  options: UseHolidaysOptions = {}
): Promise<PublicHoliday[]> {
  const params = new URLSearchParams();

  if (options.year) {
    params.set('year', options.year.toString());
  }
  if (options.bundesland) {
    params.set('bundesland', options.bundesland);
  }

  const url = `/api/holidays${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401) {
      return [];
    }
    throw new Error('Failed to fetch holidays');
  }

  const result: HolidaysResponse = await response.json();
  return result.data;
}

export function useHolidays(options: UseHolidaysOptions = {}) {
  const { year = new Date().getFullYear(), bundesland } = options;

  return useQuery({
    queryKey: ['holidays', { year, bundesland }],
    queryFn: () => fetchHolidays({ year, bundesland }),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - holidays don't change
  });
}
