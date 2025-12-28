import { NextRequest } from 'next/server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { z } from 'zod';

import { auth } from '~/lib/auth/auth';
import { success, unauthorized, validationError } from '~/lib/api/responses';

interface HolidayRow {
  id: string;
  date: string;
  name_en: string;
  name_de: string;
  bundesland: string | null;
}

export const runtime = 'edge';

const querySchema = z.object({
  year: z.coerce.number().min(2020).max(2030).optional(),
  bundesland: z.string().min(2).max(2).optional(),
});

/**
 * GET /api/holidays
 * Get public holidays for a given year and/or bundesland
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const searchParams = request.nextUrl.searchParams;
  const query = querySchema.safeParse({
    year: searchParams.get('year') ?? undefined,
    bundesland: searchParams.get('bundesland') ?? undefined,
  });

  if (!query.success) {
    return validationError(query.error.flatten());
  }

  const { year, bundesland } = query.data;
  const { env } = getRequestContext();
  const db = env.DB;

  // If no bundesland specified, get from user's organization
  let effectiveBundesland = bundesland;
  if (!effectiveBundesland) {
    const org = await db
      .prepare(
        `SELECT o.bundesland
         FROM organization_members om
         JOIN organizations o ON om.organization_id = o.id
         WHERE om.user_id = ? AND om.status = 'active'
         LIMIT 1`
      )
      .bind(session.user.id)
      .first<{ bundesland: string }>();

    effectiveBundesland = org?.bundesland;
  }

  // Build query based on parameters
  let sql = 'SELECT * FROM public_holidays WHERE 1=1';
  const params: (string | number)[] = [];

  const effectiveYear = year ?? new Date().getFullYear();
  sql += " AND strftime('%Y', date) = ?";
  params.push(String(effectiveYear));

  if (effectiveBundesland) {
    // Get holidays that apply to this bundesland (national or specific to the state)
    sql += ' AND (bundesland IS NULL OR bundesland = ?)';
    params.push(effectiveBundesland);
  }

  sql += ' ORDER BY date ASC';

  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<HolidayRow>();

  const holidays = result.results.map((row: HolidayRow) => ({
    id: row.id,
    date: row.date,
    name: row.name_en,
    nameDe: row.name_de,
    bundesland: row.bundesland,
    year: effectiveYear,
    isNational: !row.bundesland,
  }));

  return success(holidays);
}
