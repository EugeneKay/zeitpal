import { NextRequest } from 'next/server';

import { getRequestContext } from '@cloudflare/next-on-pages';

import { auth } from '~/lib/auth/auth';
import { success, unauthorized } from '~/lib/api/responses';

export const runtime = 'edge';

/**
 * GET /api/leave-types
 * Get available leave types for the user's organization
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { env } = getRequestContext();
  const db = env.DB;

  // Get user's organization
  const member = await db
    .prepare(
      `SELECT organization_id FROM organization_members
       WHERE user_id = ? AND status = 'active' LIMIT 1`
    )
    .bind(session.user.id)
    .first<{ organization_id: string }>();

  const organizationId = member?.organization_id;

  // Get leave types (system defaults + organization-specific)
  // For admin view, show all leave types regardless of active status
  const results = await db
    .prepare(
      `SELECT * FROM leave_types
       WHERE organization_id IS NULL OR organization_id = ?
       ORDER BY sort_order`
    )
    .bind(organizationId ?? null)
    .all();

  // Transform results
  const leaveTypes = results.results.map((row: Record<string, unknown>) => ({
    id: row.id,
    code: row.code,
    nameEn: row.name_en,
    nameDe: row.name_de,
    descriptionEn: row.description_en,
    descriptionDe: row.description_de,
    color: row.color,
    icon: row.icon,
    isPaid: Boolean(row.is_paid),
    requiresApproval: Boolean(row.requires_approval),
    requiresDocument: Boolean(row.requires_document),
    documentRequiredAfterDays: row.document_required_after_days,
    hasAllowance: Boolean(row.has_allowance),
    defaultDaysPerYear: row.default_days_per_year,
    allowNegative: Boolean(row.allow_negative),
    allowHalfDays: Boolean(row.allow_half_days),
    allowCarryover: Boolean(row.allow_carryover),
    maxCarryoverDays: row.max_carryover_days,
    isActive: Boolean(row.is_active),
    sortOrder: row.sort_order,
  }));

  return success(leaveTypes);
}
