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

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

/**
 * GET /api/user/profile
 * Get the current user's profile
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
        id,
        name,
        email,
        image,
        phone,
        locale,
        timezone,
        employee_id,
        start_date,
        weekly_hours,
        work_days_per_week
      FROM users
      WHERE id = ?`
    )
    .bind(session.user.id)
    .first<Record<string, unknown>>();

  if (!user) {
    return badRequest('User not found');
  }

  return success({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    phone: user.phone,
    locale: user.locale || 'de',
    timezone: user.timezone || 'Europe/Berlin',
    employeeId: user.employee_id,
    startDate: user.start_date,
    weeklyHours: user.weekly_hours,
    workDaysPerWeek: user.work_days_per_week,
  });
}

/**
 * PATCH /api/user/profile
 * Update the current user's profile
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error.flatten());
  }

  const updates = parsed.data;
  const { env } = getRequestContext();
  const db = env.DB;

  // Build dynamic update query
  const setClauses: string[] = [];
  const params: (string | number | null)[] = [];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    params.push(updates.name);
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

  // Fetch updated profile
  const user = await db
    .prepare(
      `SELECT
        id,
        name,
        email,
        image,
        locale,
        timezone
      FROM users
      WHERE id = ?`
    )
    .bind(session.user.id)
    .first<Record<string, unknown>>();

  if (!user) {
    return badRequest('User not found');
  }

  return success({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    locale: user.locale || 'de',
    timezone: user.timezone || 'Europe/Berlin',
  });
}
