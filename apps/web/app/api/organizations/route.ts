import { NextRequest } from 'next/server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { z } from 'zod';

import { auth } from '~/lib/auth/auth';
import {
  badRequest,
  conflict,
  created,
  success,
  unauthorized,
  validationError,
} from '~/lib/api/responses';

export const runtime = 'edge';

// Validation schema for creating an organization
const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  bundesland: z.string().min(2).max(2),
  defaultVacationDays: z.coerce.number().min(20).max(50).default(30),
});

/**
 * GET /api/organizations
 * Get the current user's organization
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { env } = getRequestContext();
  const db = env.DB;

  // Get user's organization membership
  const result = await db
    .prepare(
      `SELECT
        o.*,
        om.role as member_role
      FROM organization_members om
      JOIN organizations o ON om.organization_id = o.id
      WHERE om.user_id = ? AND om.status = 'active'
      LIMIT 1`
    )
    .bind(session.user.id)
    .first<Record<string, unknown>>();

  if (!result) {
    return success(null);
  }

  const organization = {
    id: result.id,
    name: result.name,
    slug: result.slug,
    bundesland: result.bundesland,
    logoUrl: result.logo_url,
    primaryColor: result.primary_color,
    defaultVacationDays: result.default_vacation_days,
    carryoverEnabled: Boolean(result.carryover_enabled),
    carryoverMaxDays: result.carryover_max_days,
    carryoverExpiryDate: result.carryover_expiry_date,
    sickLeaveAuThreshold: result.sick_leave_au_threshold,
    requireApproval: Boolean(result.require_approval),
    autoApproveThreshold: result.auto_approve_threshold,
    memberRole: result.member_role,
  };

  return success(organization);
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = createOrganizationSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const { name, slug, bundesland, defaultVacationDays } = parsed.data;

  const { env } = getRequestContext();
  const db = env.DB;

  // Check if user already has an organization
  const existingMember = await db
    .prepare(
      `SELECT id FROM organization_members
       WHERE user_id = ? AND status = 'active' LIMIT 1`
    )
    .bind(session.user.id)
    .first();

  if (existingMember) {
    return badRequest('You are already a member of an organization');
  }

  // Check if slug is unique
  const existingOrg = await db
    .prepare('SELECT id FROM organizations WHERE slug = ?')
    .bind(slug)
    .first();

  if (existingOrg) {
    return conflict('An organization with this URL slug already exists');
  }

  const userId = session.user.id;
  const orgId = crypto.randomUUID();
  const memberId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Create organization and add user as admin in a batch
  await db.batch([
    db
      .prepare(
        `INSERT INTO organizations (
          id, name, slug, bundesland, default_vacation_days,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(orgId, name, slug, bundesland, defaultVacationDays, now, now),

    db
      .prepare(
        `INSERT INTO organization_members (
          id, organization_id, user_id, role, status, joined_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, 'admin', 'active', ?, ?, ?)`
      )
      .bind(memberId, orgId, userId, now, now, now),
  ]);

  // Copy default leave types for the organization
  const defaultLeaveTypes = await db
    .prepare('SELECT * FROM leave_types WHERE organization_id IS NULL')
    .all();

  // Create leave balances for the user
  const year = new Date().getFullYear();
  const balanceInserts = defaultLeaveTypes.results
    .filter((lt: Record<string, unknown>) => lt.has_allowance)
    .map((lt: Record<string, unknown>) => {
      const balanceId = crypto.randomUUID();
      return db
        .prepare(
          `INSERT INTO leave_balances (
            id, organization_id, user_id, leave_type_id, year,
            entitled, carried_over, adjustment, used, pending,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?)`
        )
        .bind(
          balanceId,
          orgId,
          userId,
          lt.id,
          year,
          lt.code === 'vacation' ? defaultVacationDays : (lt.default_days_per_year || 0),
          now,
          now
        );
    });

  if (balanceInserts.length > 0) {
    await db.batch(balanceInserts);
  }

  return created({
    id: orgId,
    name,
    slug,
    bundesland,
  });
}
