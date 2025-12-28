import NextAuth from 'next-auth';
import { D1Adapter } from '@auth/d1-adapter';
import { getOptionalRequestContext } from '@cloudflare/next-on-pages';

import { authConfig } from './auth.config';

/**
 * Initialize NextAuth with D1 database adapter
 *
 * The D1 adapter is initialized dynamically per-request since
 * the D1 binding is only available via getRequestContext() in
 * Cloudflare Pages edge runtime.
 *
 * In development (Node.js runtime), we use a simpler setup without D1.
 * Note: Email providers (Mailgun) are only available when D1 is available,
 * as they require an adapter to store verification tokens.
 */
function getAuth() {
  // Try to get Cloudflare bindings (only available in edge runtime)
  // The getOptionalRequestContext() function throws an error in Node.js runtime,
  // so we need to catch that and fall back to the JWT-only setup
  try {
    const ctx = getOptionalRequestContext();

    if (ctx?.env?.DB) {
      // Edge runtime with D1 database - all providers available
      return NextAuth({
        ...authConfig,
        adapter: D1Adapter(ctx.env.DB),
        secret: ctx.env.AUTH_SECRET ?? process.env.AUTH_SECRET,
      });
    }
  } catch {
    // Not in edge runtime - fall through to Node.js setup
  }

  // Node.js runtime (development) - no D1 adapter
  // Sessions are stored in JWT only
  // Filter out email providers since they require an adapter
  const oauthOnlyProviders = authConfig.providers.filter(
    (provider) => {
      // Provider can be a function or an object
      const providerObj = typeof provider === 'function' ? provider : provider;
      return providerObj.type !== 'email';
    }
  );

  return NextAuth({
    ...authConfig,
    providers: oauthOnlyProviders,
    secret: process.env.AUTH_SECRET,
  });
}

// Export auth functions that initialize per-request
export async function auth() {
  const { auth } = getAuth();
  return auth();
}

export async function signIn(
  provider?: string,
  options?: { redirectTo?: string; redirect?: boolean }
) {
  const { signIn } = getAuth();
  return signIn(provider, options);
}

export async function signOut(options?: { redirectTo?: string }) {
  const { signOut } = getAuth();
  return signOut(options);
}

// Export handlers for API route
export function getHandlers() {
  const { handlers } = getAuth();
  return handlers;
}

// Type exports
export type { Session, User } from 'next-auth';
