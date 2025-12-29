import { NextRequest } from 'next/server';

import { getCloudflareContext } from '@opennextjs/cloudflare';

import { auth } from '~/lib/auth/auth';
import { success, unauthorized } from '~/lib/api/responses';

export const runtime = 'edge';

/**
 * GET /api/leave-balances
 * Get leave balances for the current user
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { env } = getCloudflareContext();
  const db = env.DB;

  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year') || new Date().getFullYear().toString();

  // Get balances with leave type details
  const results = await db
    .prepare(
      `SELECT
        lb.*,
        lt.code as leave_type_code,
        lt.name_en as leave_type_name_en,
        lt.name_de as leave_type_name_de,
        lt.color as leave_type_color,
        lt.icon as leave_type_icon,
        lt.has_allowance as leave_type_has_allowance
      FROM leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.user_id = ? AND lb.year = ?
      ORDER BY lt.sort_order`
    )
    .bind(session.user.id, parseInt(year))
    .all();

  // Transform results
  const balances = results.results.map((row: Record<string, unknown>) => ({
    id: row.id,
    leaveTypeId: row.leave_type_id,
    leaveType: {
      code: row.leave_type_code,
      nameEn: row.leave_type_name_en,
      nameDe: row.leave_type_name_de,
      color: row.leave_type_color,
      icon: row.leave_type_icon,
      hasAllowance: Boolean(row.leave_type_has_allowance),
    },
    year: row.year,
    entitled: row.entitled,
    carriedOver: row.carried_over,
    adjustment: row.adjustment,
    used: row.used,
    pending: row.pending,
    remaining:
      (row.entitled as number) +
      (row.carried_over as number) +
      (row.adjustment as number) -
      (row.used as number) -
      (row.pending as number),
    notes: row.notes,
  }));

  return success(balances);
}
