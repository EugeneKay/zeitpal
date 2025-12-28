import { NextRequest } from 'next/server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { z } from 'zod';

import { auth } from '~/lib/auth/auth';
import {
  badRequest,
  created,
  success,
  unauthorized,
  validationError,
} from '~/lib/api/responses';
import { calculateWorkDays } from '~/lib/utils/leave-calculations';

export const runtime = 'edge';

// Validation schema for creating a leave request
const createLeaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  startHalfDay: z.enum(['morning', 'afternoon']).nullable().optional(),
  endHalfDay: z.enum(['morning', 'afternoon']).nullable().optional(),
  reason: z.string().max(500).optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  { message: 'End date must be after or equal to start date', path: ['endDate'] }
);

/**
 * GET /api/leave-requests
 * Get leave requests for the current user
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { env } = getRequestContext();
  const db = env.DB;

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const year = searchParams.get('year') || new Date().getFullYear().toString();

  // Check if user is admin/manager to see all pending requests
  const member = await db
    .prepare(
      `SELECT organization_id, role FROM organization_members
       WHERE user_id = ? AND status = 'active' LIMIT 1`
    )
    .bind(session.user.id)
    .first<{ organization_id: string; role: string }>();

  const isApprover = member && ['admin', 'manager', 'hr'].includes(member.role);

  // Build query - include user data for approval workflows
  let query = `
    SELECT
      lr.*,
      lt.code as leave_type_code,
      lt.name_en as leave_type_name_en,
      lt.name_de as leave_type_name_de,
      lt.color as leave_type_color,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email,
      u.image as user_avatar_url
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    JOIN users u ON lr.user_id = u.id
  `;

  const params: unknown[] = [];

  // For pending status with approver role, show all org requests (excluding own)
  // Otherwise, show only user's own requests
  if (status === 'pending' && isApprover && member) {
    query += `
      WHERE lr.organization_id = ?
      AND lr.user_id != ?
      AND lr.status = 'pending'
    `;
    params.push(member.organization_id, session.user.id);
  } else {
    query += `
      WHERE lr.user_id = ?
      AND strftime('%Y', lr.start_date) = ?
    `;
    params.push(session.user.id, year);

    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }
  }

  query += ' ORDER BY lr.start_date DESC';

  const results = await db.prepare(query).bind(...params).all();

  // Transform results
  const requests = results.results.map((row: Record<string, unknown>) => ({
    id: row.id,
    leaveTypeId: row.leave_type_id,
    leaveType: {
      code: row.leave_type_code,
      nameEn: row.leave_type_name_en,
      nameDe: row.leave_type_name_de,
      color: row.leave_type_color,
    },
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      avatarUrl: row.user_avatar_url,
    },
    startDate: row.start_date,
    endDate: row.end_date,
    startHalfDay: row.start_half_day,
    endHalfDay: row.end_half_day,
    workDays: row.work_days,
    reason: row.reason,
    status: row.status,
    documentUrl: row.document_url,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
  }));

  return success(requests);
}

/**
 * POST /api/leave-requests
 * Create a new leave request
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = createLeaveRequestSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const { leaveTypeId, startDate, endDate, startHalfDay, endHalfDay, reason } =
    parsed.data;

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

  if (!member) {
    return badRequest('User is not a member of any organization');
  }

  const organizationId = member.organization_id;

  // Get organization's bundesland for holiday calculation
  const org = await db
    .prepare('SELECT bundesland FROM organizations WHERE id = ?')
    .bind(organizationId)
    .first<{ bundesland: string }>();

  // Get holidays for the organization's bundesland
  const holidayResults = await db
    .prepare(
      `SELECT date FROM public_holidays
       WHERE (organization_id IS NULL OR organization_id = ?)
       AND (bundesland IS NULL OR bundesland = ?)
       AND date BETWEEN ? AND ?`
    )
    .bind(organizationId, org?.bundesland, startDate, endDate)
    .all();

  const holidays = holidayResults.results.map(
    (row: Record<string, unknown>) => row.date as string
  );

  // Calculate work days
  const workDays = calculateWorkDays(
    startDate,
    endDate,
    holidays,
    startHalfDay || null,
    endHalfDay || null
  );

  if (workDays <= 0) {
    return badRequest('No working days in the selected date range');
  }

  // Check for overlapping requests
  const overlapping = await db
    .prepare(
      `SELECT id FROM leave_requests
       WHERE user_id = ?
       AND status IN ('pending', 'approved')
       AND ((start_date <= ? AND end_date >= ?)
         OR (start_date <= ? AND end_date >= ?)
         OR (start_date >= ? AND end_date <= ?))`
    )
    .bind(
      session.user.id,
      endDate,
      startDate,
      startDate,
      startDate,
      startDate,
      endDate
    )
    .first();

  if (overlapping) {
    return badRequest('You already have a leave request for this period');
  }

  // Create the leave request
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO leave_requests (
        id, organization_id, user_id, leave_type_id,
        start_date, end_date, start_half_day, end_half_day,
        work_days, reason, status, submitted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
    )
    .bind(
      id,
      organizationId,
      session.user.id,
      leaveTypeId,
      startDate,
      endDate,
      startHalfDay || null,
      endHalfDay || null,
      workDays,
      reason || null,
      now,
      now,
      now
    )
    .run();

  // Update leave balance (pending)
  await db
    .prepare(
      `UPDATE leave_balances
       SET pending = pending + ?, updated_at = ?
       WHERE user_id = ? AND leave_type_id = ? AND year = ?`
    )
    .bind(
      workDays,
      now,
      session.user.id,
      leaveTypeId,
      new Date(startDate).getFullYear()
    )
    .run();

  // TODO: Create approval records based on approval rules
  // TODO: Send notification email to approver

  return created({ id, status: 'pending', workDays });
}
