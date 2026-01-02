import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

import { MailgunProvider } from './mailgun-provider';

type AuthEnv = Record<string, string | undefined>;

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Auth.js provider configuration for ZeitPal
 *
 * Providers:
 * - Google OAuth
 * - Microsoft Entra ID (Azure AD)
 * - Magic Link via Mailgun
 */
export function getAuthConfig(env: AuthEnv): NextAuthConfig {
  return {
    // In development, don't use secure cookies (allows HTTP localhost)
    useSecureCookies: isProduction,
    providers: [
      // Google OAuth
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
          },
        },
      }),

      // Microsoft Entra ID (Azure AD)
    MicrosoftEntraID({
      clientId: env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      allowDangerousEmailAccountLinking: true,
      // Configure tenant via issuer URL
      issuer: `https://login.microsoftonline.com/${env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ?? 'common'}/v2.0`,
      }),

      // Magic Link via Mailgun
      MailgunProvider({
        apiKey: env.MAILGUN_API_KEY ?? '',
        domain: env.MAILGUN_DOMAIN ?? 'mg.zeitpal.com',
        from: env.AUTH_EMAIL_FROM ?? 'ZeitPal <noreply@zeitpal.com>',
      }),
    ],

    pages: {
      signIn: '/auth/sign-in',
      signOut: '/auth/sign-out',
      error: '/auth/callback/error',
      verifyRequest: '/auth/verify',
      // Note: We don't use newUser page because it overrides the callbackUrl.
      // Instead, we handle new user redirects in the redirect callback below,
      // which allows invite links to work correctly.
    },

    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnHome = nextUrl.pathname.startsWith('/home');
        const isOnAuth = nextUrl.pathname.startsWith('/auth');
        const isOnOnboarding = nextUrl.pathname.startsWith('/onboarding');

        // Protect /home routes
        if (isOnHome) {
          if (isLoggedIn) return true;
          return false; // Redirect to login
        }

        // Redirect logged-in users away from auth pages
        if (isOnAuth && isLoggedIn) {
          return Response.redirect(new URL('/home', nextUrl));
        }

        // Allow onboarding for logged-in users
        if (isOnOnboarding && !isLoggedIn) {
          return Response.redirect(new URL('/auth/sign-in', nextUrl));
        }

        return true;
      },

      jwt({ token, user, account }) {
        // Initial sign in
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.picture = user.image;
        }

        // Add provider info
        if (account) {
          token.provider = account.provider;
        }

        return token;
      },

      session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.picture as string;
        }

        return session;
      },
    },

    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    trustHost: true,
  };
}
