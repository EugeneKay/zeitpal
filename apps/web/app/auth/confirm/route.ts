import { redirect } from 'next/navigation';

import pathsConfig from '~/config/paths.config';

/**
 * Auth confirm route
 *
 * NextAuth handles email verification automatically.
 * This route exists for backwards compatibility and redirects to the app home.
 */
export async function GET() {
  return redirect(pathsConfig.app.home);
}
