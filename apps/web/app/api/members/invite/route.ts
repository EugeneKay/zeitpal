import { NextRequest } from 'next/server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { z } from 'zod';

import { auth } from '~/lib/auth/auth';
import {
  created,
  unauthorized,
  forbidden,
  conflict,
  validationError,
} from '~/lib/api/responses';

export const runtime = 'edge';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
  teamIds: z.array(z.string()).optional(),
});

/**
 * POST /api/members/invite
 * Invite a new member to the organization
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const { email, role, teamIds } = parsed.data;
  const { env } = getRequestContext();
  const db = env.DB;

  // Get user's organization and verify they have permission to invite
  const membership = await db
    .prepare(
      `SELECT organization_id, role FROM organization_members
       WHERE user_id = ? AND status = 'active'
       LIMIT 1`
    )
    .bind(session.user.id)
    .first<{ organization_id: string; role: string }>();

  if (!membership) {
    return forbidden('Not a member of any organization');
  }

  // Only admins and managers can invite
  if (membership.role !== 'admin' && membership.role !== 'manager') {
    return forbidden('Only admins and managers can invite members');
  }

  // Managers can only invite members, not admins or other managers
  if (membership.role === 'manager' && role !== 'member') {
    return forbidden('Managers can only invite regular members');
  }

  // Check if there's already a pending invite for this email
  const existingInvite = await db
    .prepare(
      `SELECT id FROM organization_invites
       WHERE organization_id = ? AND email = ? AND status = 'pending' AND expires_at > datetime('now')`
    )
    .bind(membership.organization_id, email)
    .first();

  if (existingInvite) {
    return conflict('An invite for this email is already pending');
  }

  // Check if user is already a member
  const existingMember = await db
    .prepare(
      `SELECT om.id FROM organization_members om
       JOIN users u ON om.user_id = u.id
       WHERE om.organization_id = ? AND u.email = ? AND om.status = 'active'`
    )
    .bind(membership.organization_id, email)
    .first();

  if (existingMember) {
    return conflict('This user is already a member of the organization');
  }

  // Create the invite
  const inviteId = crypto.randomUUID();
  const token = crypto.randomUUID();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  await db
    .prepare(
      `INSERT INTO organization_invites (
        id, organization_id, email, role, token, invited_by, status, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
    )
    .bind(
      inviteId,
      membership.organization_id,
      email,
      role,
      token,
      session.user.id,
      expiresAt,
      now
    )
    .run();

  // TODO: Send invite email with token
  // For now, we'll return the invite details
  // In production, this would trigger an email via Mailgun

  return created({
    id: inviteId,
    email,
    role,
    expiresAt,
    // Include token for development/testing - remove in production
    inviteUrl: `/invite/${token}`,
  });
}
