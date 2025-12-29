import { NextRequest } from 'next/server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { z } from 'zod';

import { auth } from '~/lib/auth/auth';
import {
  badRequest,
  forbidden,
  noContent,
  notFound,
  success,
  unauthorized,
  validationError,
} from '~/lib/api/responses';

export const runtime = 'edge';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateApprovalRuleSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  conditions: z
    .object({
      leaveTypes: z.array(z.string()).optional(),
      minDays: z.number().optional(),
      maxDays: z.number().optional(),
    })
    .optional(),
  approverType: z
    .enum(['team_lead', 'manager', 'hr', 'specific_user', 'any_admin'])
    .optional(),
  approverUserId: z.string().nullable().optional(),
  level: z.number().min(1).max(5).optional(),
  priority: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/approval-rules/[id]
 * Get a specific approval rule
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { id } = await params;
  const { env } = getRequestContext();
  const db = env.DB;

  // Get user's organization
  const membership = await db
    .prepare(
      `SELECT om.organization_id, om.role
       FROM organization_members om
       WHERE om.user_id = ? AND om.status = 'active'
       LIMIT 1`
    )
    .bind(session.user.id)
    .first<{ organization_id: string; role: string }>();

  if (!membership) {
    return badRequest('You are not a member of any organization');
  }

  if (!['admin', 'manager', 'hr'].includes(membership.role)) {
    return forbidden('Only admins, managers, and HR can view approval rules');
  }

  const rule = await db
    .prepare(
      `SELECT ar.*, u.name as approver_name, u.email as approver_email
       FROM approval_rules ar
       LEFT JOIN users u ON ar.approver_user_id = u.id
       WHERE ar.id = ? AND ar.organization_id = ?`
    )
    .bind(id, membership.organization_id)
    .first<Record<string, unknown>>();

  if (!rule) {
    return notFound('Approval rule');
  }

  return success({
    id: rule.id,
    name: rule.name,
    conditions: JSON.parse((rule.conditions as string) || '{}'),
    approverType: rule.approver_type,
    approverUserId: rule.approver_user_id,
    approverName: rule.approver_name,
    approverEmail: rule.approver_email,
    level: rule.level,
    priority: rule.priority,
    isActive: Boolean(rule.is_active),
  });
}

/**
 * PUT /api/approval-rules/[id]
 * Update an approval rule
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { id } = await params;
  const { env } = getRequestContext();
  const db = env.DB;

  // Get user's organization membership and verify role
  const membership = await db
    .prepare(
      `SELECT om.organization_id, om.role
       FROM organization_members om
       WHERE om.user_id = ? AND om.status = 'active'
       LIMIT 1`
    )
    .bind(session.user.id)
    .first<{ organization_id: string; role: string }>();

  if (!membership) {
    return badRequest('You are not a member of any organization');
  }

  if (!['admin', 'manager', 'hr'].includes(membership.role)) {
    return forbidden('Only admins, managers, and HR can update approval rules');
  }

  // Get the rule and verify it belongs to the organization
  const rule = await db
    .prepare('SELECT * FROM approval_rules WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();

  if (!rule) {
    return notFound('Approval rule');
  }

  if (rule.organization_id !== membership.organization_id) {
    return forbidden('Cannot modify approval rules from other organizations');
  }

  const body = await request.json();
  const parsed = updateApprovalRuleSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const updates = parsed.data;
  const now = new Date().toISOString();

  // Build dynamic update query
  const setClauses: string[] = [];
  const updateParams: (string | number | null)[] = [];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    updateParams.push(updates.name);
  }
  if (updates.conditions !== undefined) {
    setClauses.push('conditions = ?');
    updateParams.push(JSON.stringify(updates.conditions));
  }
  if (updates.approverType !== undefined) {
    setClauses.push('approver_type = ?');
    updateParams.push(updates.approverType);
  }
  if (updates.approverUserId !== undefined) {
    setClauses.push('approver_user_id = ?');
    updateParams.push(updates.approverUserId);
  }
  if (updates.level !== undefined) {
    setClauses.push('level = ?');
    updateParams.push(updates.level);
  }
  if (updates.priority !== undefined) {
    setClauses.push('priority = ?');
    updateParams.push(updates.priority);
  }
  if (updates.isActive !== undefined) {
    setClauses.push('is_active = ?');
    updateParams.push(updates.isActive ? 1 : 0);
  }

  if (setClauses.length === 0) {
    return badRequest('No fields to update');
  }

  setClauses.push('updated_at = ?');
  updateParams.push(now);
  updateParams.push(id);

  await db
    .prepare(`UPDATE approval_rules SET ${setClauses.join(', ')} WHERE id = ?`)
    .bind(...updateParams)
    .run();

  // Fetch updated rule
  const updated = await db
    .prepare(
      `SELECT ar.*, u.name as approver_name, u.email as approver_email
       FROM approval_rules ar
       LEFT JOIN users u ON ar.approver_user_id = u.id
       WHERE ar.id = ?`
    )
    .bind(id)
    .first<Record<string, unknown>>();

  return success({
    id: updated?.id,
    name: updated?.name,
    conditions: JSON.parse((updated?.conditions as string) || '{}'),
    approverType: updated?.approver_type,
    approverUserId: updated?.approver_user_id,
    approverName: updated?.approver_name,
    approverEmail: updated?.approver_email,
    level: updated?.level,
    priority: updated?.priority,
    isActive: Boolean(updated?.is_active),
  });
}

/**
 * DELETE /api/approval-rules/[id]
 * Delete an approval rule
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { id } = await params;
  const { env } = getRequestContext();
  const db = env.DB;

  // Get user's organization membership and verify role
  const membership = await db
    .prepare(
      `SELECT om.organization_id, om.role
       FROM organization_members om
       WHERE om.user_id = ? AND om.status = 'active'
       LIMIT 1`
    )
    .bind(session.user.id)
    .first<{ organization_id: string; role: string }>();

  if (!membership) {
    return badRequest('You are not a member of any organization');
  }

  if (!['admin', 'manager', 'hr'].includes(membership.role)) {
    return forbidden('Only admins, managers, and HR can delete approval rules');
  }

  // Get the rule and verify it belongs to the organization
  const rule = await db
    .prepare('SELECT * FROM approval_rules WHERE id = ?')
    .bind(id)
    .first<Record<string, unknown>>();

  if (!rule) {
    return notFound('Approval rule');
  }

  if (rule.organization_id !== membership.organization_id) {
    return forbidden('Cannot delete approval rules from other organizations');
  }

  await db.prepare('DELETE FROM approval_rules WHERE id = ?').bind(id).run();

  return noContent();
}
