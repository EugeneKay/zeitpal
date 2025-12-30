
import { redirect } from 'next/navigation';

import pathsConfig from '~/config/paths.config';

/**
 * Auth callback route
 *
 * NextAuth handles callbacks automatically via /api/auth/callback/[provider].
 * This route exists for backwards compatibility and redirects to the app home.
 */
export async function GET() {
  return redirect(pathsConfig.app.home);
}
