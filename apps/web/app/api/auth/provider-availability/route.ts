
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Check which auth providers are available in the current runtime.
 *
 * Email providers (magic link) require:
 * - Mailgun credentials (API key and domain)
 * - Either D1 database (production) or local development mode
 */
export async function GET() {
  let hasEmailProvider = false;

  // Check if Mailgun credentials are configured
  const hasMailgunCredentials = !!(
    process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN
  );

  if (!hasMailgunCredentials) {
    // No email provider without Mailgun credentials
    return NextResponse.json({
      emailAvailable: false,
      oauthAvailable: true,
    });
  }

  try {
    const ctx = getCloudflareContext();
    // Email provider is available when D1 is available (production/preview)
    hasEmailProvider = !!ctx?.env?.DB;
  } catch {
    // Not in edge runtime - allow email in development if credentials are set
    // This enables local development with magic links
    hasEmailProvider = process.env.NODE_ENV === 'development';
  }

  return NextResponse.json({
    emailAvailable: hasEmailProvider,
    oauthAvailable: true,
  });
}
