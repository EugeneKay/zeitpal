import { NextRequest } from 'next/server';

import { getRequestContext } from '@cloudflare/next-on-pages';
import { z } from 'zod';

import { auth } from '~/lib/auth/auth';
import {
  badRequest,
  success,
  unauthorized,
  validationError,
} from '~/lib/api/responses';

export const runtime = 'edge';

// Notification preferences schema
const notificationPreferencesSchema = z.object({
  emailOnApproval: z.boolean().optional(),
  emailOnRejection: z.boolean().optional(),
  emailOnRequestSubmitted: z.boolean().optional(),
  emailOnTeamAbsence: z.boolean().optional(),
  emailDigestFrequency: z.enum(['immediate', 'daily', 'weekly', 'none']).optional(),
  emailOnApprovalNeeded: z.boolean().optional(),
  emailOnUpcomingLeave: z.boolean().optional(),
});

const updatePreferencesSchema = z.object({
  notificationPreferences: notificationPreferencesSchema.optional(),
  locale: z.string().min(2).max(5).optional(),
  timezone: z.string().optional(),
});

/**
 * GET /api/user/preferences
 * Get the current user's preferences
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const { env } = getRequestContext();
  const db = env.DB;

  const user = await db
    .prepare(
      `SELECT
        notification_preferences,
        locale,
        timezone
      FROM users
      WHERE id = ?`
    )
    .bind(session.user.id)
    .first<{
      notification_preferences: string | null;
      locale: string | null;
      timezone: string | null;
    }>();

  if (!user) {
    return badRequest('User not found');
  }

  // Parse notification preferences from JSON
  let notificationPreferences = {};
  if (user.notification_preferences) {
    try {
      notificationPreferences = JSON.parse(user.notification_preferences);
    } catch {
      // Invalid JSON, use empty object
    }
  }

  return success({
    notificationPreferences,
    locale: user.locale || 'de',
    timezone: user.timezone || 'Europe/Berlin',
  });
}

/**
 * PATCH /api/user/preferences
 * Update the current user's preferences
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = updatePreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const updates = parsed.data;
  const { env } = getRequestContext();
  const db = env.DB;

  // Build dynamic update query
  const setClauses: string[] = [];
  const params: (string | number | null)[] = [];

  if (updates.notificationPreferences !== undefined) {
    setClauses.push('notification_preferences = ?');
    params.push(JSON.stringify(updates.notificationPreferences));
  }

  if (updates.locale !== undefined) {
    setClauses.push('locale = ?');
    params.push(updates.locale);
  }

  if (updates.timezone !== undefined) {
    setClauses.push('timezone = ?');
    params.push(updates.timezone);
  }

  if (setClauses.length === 0) {
    return badRequest('No fields to update');
  }

  const now = new Date().toISOString();
  setClauses.push('updated_at = ?');
  params.push(now);
  params.push(session.user.id);

  await db
    .prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`)
    .bind(...params)
    .run();

  // Fetch updated preferences
  const user = await db
    .prepare(
      `SELECT
        notification_preferences,
        locale,
        timezone
      FROM users
      WHERE id = ?`
    )
    .bind(session.user.id)
    .first<{
      notification_preferences: string | null;
      locale: string | null;
      timezone: string | null;
    }>();

  if (!user) {
    return badRequest('User not found');
  }

  let notificationPreferences = {};
  if (user.notification_preferences) {
    try {
      notificationPreferences = JSON.parse(user.notification_preferences);
    } catch {
      // Invalid JSON, use empty object
    }
  }

  return success({
    notificationPreferences,
    locale: user.locale || 'de',
    timezone: user.timezone || 'Europe/Berlin',
  });
}
