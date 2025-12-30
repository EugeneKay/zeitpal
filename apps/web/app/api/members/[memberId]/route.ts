import { NextRequest } from 'next/server';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { z } from 'zod';

import { auth } from '~/lib/auth/auth';
import {
  success,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  validationError,
} from '~/lib/api/responses';


const updateMemberSchema = z.object({
  role: z.enum(['admin', 'manager', 'member']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

interface RouteParams {
  params: Promise<{ memberId: string }>;
}

/**
 * PATCH /api/members/[memberId]
 * Update a member's role or status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { memberId } = await params;
  const body = await request.json();
  const parsed = updateMemberSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const { role, status } = parsed.data;
  const { env } = getCloudflareContext();
  const db = env.DB;

  // Get current user's membership and verify permissions
  const currentMembership = await db
    .prepare(
      `SELECT organization_id, role FROM organization_members
       WHERE user_id = ? AND status = 'active'
       LIMIT 1`
    )
    .bind(session.user.id)
    .first<{ organization_id: string; role: string }>();

  if (!currentMembership) {
    return forbidden('Not a member of any organization');
  }

  // Only admins can update member roles/status
  if (currentMembership.role !== 'admin') {
    return forbidden('Only admins can update member roles');
  }

  // Get the target member
  const targetMember = await db
    .prepare(
      `SELECT id, user_id, role, organization_id FROM organization_members WHERE id = ?`
    )
    .bind(memberId)
    .first<{ id: string; user_id: string; role: string; organization_id: string }>();

  if (!targetMember) {
    return notFound('Member not found');
  }

  // Verify same organization
  if (targetMember.organization_id !== currentMembership.organization_id) {
    return forbidden('Cannot modify members of other organizations');
  }

  // Cannot modify your own role
  if (targetMember.user_id === session.user.id && role) {
    return badRequest('Cannot change your own role');
  }

  // Build update query
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (role) {
    updates.push('role = ?');
    values.push(role);
  }

  if (status) {
    updates.push('status = ?');
    values.push(status);
  }

  if (updates.length === 0) {
    return badRequest('No updates provided');
  }

  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(memberId);

  await db
    .prepare(`UPDATE organization_members SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  // Fetch updated member
  const updatedMember = await db
    .prepare(
      `SELECT
        om.id,
        om.role,
        om.status,
        om.joined_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.image as user_avatar_url
      FROM organization_members om
      JOIN users u ON om.user_id = u.id
      WHERE om.id = ?`
    )
    .bind(memberId)
    .first<Record<string, unknown>>();

  return success({
    id: updatedMember?.id,
    role: updatedMember?.role,
    status: updatedMember?.status,
    joinedAt: updatedMember?.joined_at,
    user: {
      id: updatedMember?.user_id,
      name: updatedMember?.user_name,
      email: updatedMember?.user_email,
      avatarUrl: updatedMember?.user_avatar_url,
    },
  });
}

/**
 * DELETE /api/members/[memberId]
 * Remove a member from the organization
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { memberId } = await params;
  const { env } = getCloudflareContext();
  const db = env.DB;

  // Get current user's membership and verify permissions
  const currentMembership = await db
    .prepare(
      `SELECT organization_id, role FROM organization_members
       WHERE user_id = ? AND status = 'active'
       LIMIT 1`
    )
    .bind(session.user.id)
    .first<{ organization_id: string; role: string }>();

  if (!currentMembership) {
    return forbidden('Not a member of any organization');
  }

  // Only admins can remove members
  if (currentMembership.role !== 'admin') {
    return forbidden('Only admins can remove members');
  }

  // Get the target member
  const targetMember = await db
    .prepare(
      `SELECT id, user_id, organization_id FROM organization_members WHERE id = ?`
    )
    .bind(memberId)
    .first<{ id: string; user_id: string; organization_id: string }>();

  if (!targetMember) {
    return notFound('Member not found');
  }

  // Verify same organization
  if (targetMember.organization_id !== currentMembership.organization_id) {
    return forbidden('Cannot remove members of other organizations');
  }

  // Cannot remove yourself
  if (targetMember.user_id === session.user.id) {
    return badRequest('Cannot remove yourself from the organization');
  }

  // Set status to inactive instead of hard delete
  await db
    .prepare(
      `UPDATE organization_members SET status = 'inactive', updated_at = ? WHERE id = ?`
    )
    .bind(new Date().toISOString(), memberId)
    .run();

  // Also remove from all teams
  await db
    .prepare(
      `DELETE FROM team_members WHERE user_id = ? AND team_id IN (
        SELECT id FROM teams WHERE organization_id = ?
      )`
    )
    .bind(targetMember.user_id, targetMember.organization_id)
    .run();

  return success({ removed: true });
}
