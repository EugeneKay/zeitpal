import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '~/lib/auth/auth';
import { badRequest, created, unauthorized } from '~/lib/api/responses';

export const runtime = 'edge';

const onboardingCompleteSchema = z.object({
  // Profile
  displayName: z.string().min(1).optional(),
  timezone: z.string().optional(),
  locale: z.enum(['en', 'de']).optional(),

  // Organization
  organizationName: z.string().min(2),
  organizationSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/),
  country: z.string().min(2),
  region: z.string().optional().nullable(),

  // Policy
  defaultVacationDays: z.coerce.number().min(1).max(60).default(30),
  carryoverEnabled: z.boolean().default(true),
  carryoverMaxDays: z.coerce.number().min(0).max(30).default(5),

  // Team (optional)
  teamName: z.string().min(2).optional().nullable(),
  teamColor: z.string().optional().nullable(),

  // Invites (optional)
  invites: z
    .array(
      z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'manager', 'hr', 'employee']),
      })
    )
    .optional()
    .default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const body = await request.json();
    const parsed = onboardingCompleteSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest('Invalid input', parsed.error.flatten());
    }

    const data = parsed.data;
    const userId = session.user.id;
    const { env } = getCloudflareContext();
    const db = env.DB;

    // Generate unique IDs
    const orgId = crypto.randomUUID();
    const memberId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Start a batch transaction
    const statements = [];

    // 1. Ensure user exists (UPSERT) and update profile
    // This handles the case where the D1 adapter wasn't used during auth
    statements.push(
      db
        .prepare(
          `INSERT INTO users (id, email, name, timezone, locale, onboarding_completed_at, onboarding_steps_completed, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = COALESCE(excluded.name, users.name),
             timezone = COALESCE(excluded.timezone, users.timezone),
             locale = COALESCE(excluded.locale, users.locale),
             onboarding_completed_at = excluded.onboarding_completed_at,
             onboarding_steps_completed = excluded.onboarding_steps_completed,
             updated_at = excluded.updated_at`
        )
        .bind(
          userId,
          session.user.email,
          data.displayName || session.user.name || null,
          data.timezone || 'Europe/Berlin',
          data.locale || 'en',
          now,
          JSON.stringify([
            'welcome',
            'profile',
            'organization',
            'location',
            'policy',
            'team',
            'invite',
            'complete',
          ]),
          now,
          now
        )
    );

    // 2. Create organization
    statements.push(
      db
        .prepare(
          `INSERT INTO organizations (
             id, name, slug, country, region, bundesland,
             default_vacation_days, carryover_enabled, carryover_max_days,
             created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          orgId,
          data.organizationName,
          data.organizationSlug,
          data.country,
          data.region || null,
          data.country === 'DE' ? data.region : null, // For backwards compatibility
          data.defaultVacationDays,
          data.carryoverEnabled ? 1 : 0,
          data.carryoverMaxDays,
          now,
          now
        )
    );

    // 3. Add user as admin member of the organization
    statements.push(
      db
        .prepare(
          `INSERT INTO organization_members (
             id, organization_id, user_id, role, status, joined_at, created_at, updated_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(memberId, orgId, userId, 'admin', 'active', now, now, now)
    );

    // 4. Create initial leave balances for the user
    const currentYear = new Date().getFullYear();

    // Get all active leave types
    const leaveTypes = await db
      .prepare(
        `SELECT id, code, default_days_per_year, has_allowance
         FROM leave_types
         WHERE organization_id IS NULL AND is_active = 1`
      )
      .all();

    for (const leaveType of leaveTypes.results || []) {
      const balanceId = crypto.randomUUID();
      const entitled =
        leaveType.code === 'vacation'
          ? data.defaultVacationDays
          : (leaveType.default_days_per_year as number | null) || 0;

      statements.push(
        db
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
            leaveType.id as string,
            currentYear,
            entitled,
            now,
            now
          )
      );
    }

    // 5. Create team if provided
    let teamId: string | null = null;
    if (data.teamName) {
      teamId = crypto.randomUUID();
      const teamMemberId = crypto.randomUUID();

      statements.push(
        db
          .prepare(
            `INSERT INTO teams (id, organization_id, name, color, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .bind(
            teamId,
            orgId,
            data.teamName,
            data.teamColor || '#3B82F6',
            now,
            now
          )
      );

      // Add current user as team lead
      statements.push(
        db
          .prepare(
            `INSERT INTO team_members (id, team_id, user_id, is_lead, created_at)
             VALUES (?, ?, ?, 1, ?)`
          )
          .bind(teamMemberId, teamId, userId, now)
      );
    }

    // 6. Create invites if provided
    for (const invite of data.invites) {
      const inviteId = crypto.randomUUID();
      const token = crypto.randomUUID();
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(); // 7 days

      statements.push(
        db
          .prepare(
            `INSERT INTO organization_invites (
               id, organization_id, email, role, token, invited_by,
               team_id, expires_at, created_at
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            inviteId,
            orgId,
            invite.email.toLowerCase(),
            invite.role,
            token,
            userId,
            teamId,
            expiresAt,
            now
          )
      );

      // TODO: Send invite email via Mailgun
      // await sendInviteEmail(invite.email, token, data.organizationName);
    }

    // 7. Create audit log entry
    const auditId = crypto.randomUUID();
    statements.push(
      db
        .prepare(
          `INSERT INTO audit_logs (
             id, organization_id, user_id, action, entity_type, entity_id,
             new_values, created_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          auditId,
          orgId,
          userId,
          'organization.created',
          'organization',
          orgId,
          JSON.stringify({
            name: data.organizationName,
            country: data.country,
            region: data.region,
          }),
          now
        )
    );

    // Execute all statements in batch
    await db.batch(statements);

    return created({
      success: true,
      organizationId: orgId,
      organizationSlug: data.organizationSlug,
      teamId,
      invitesSent: data.invites.length,
    });
  } catch (error) {
    console.error('Onboarding completion error:', error);

    // Check for unique constraint violation (slug already exists)
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed')
    ) {
      return badRequest(
        'An organization with this URL already exists. Please choose a different one.'
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
