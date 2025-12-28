import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import { auth } from '~/lib/auth/auth';
import pathsConfig from '~/config/paths.config';

/**
 * @name requireUserInServerComponent
 * @description Require the user to be authenticated in a server component.
 * We reuse this function in multiple server components - it is cached so that the data is only fetched once per request.
 * Use this instead of calling auth() directly in server components, so you don't need to hit the database multiple times in a single request.
 */
export const requireUserInServerComponent = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    redirect(pathsConfig.auth.signIn);
  }

  return session.user;
});
