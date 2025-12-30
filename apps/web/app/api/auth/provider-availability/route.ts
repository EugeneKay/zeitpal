
import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Check which auth providers are available in the current runtime.
 *
 * Email providers (magic link) require a D1 database adapter,
 * which is only available in Cloudflare edge runtime.
 */
export async function GET() {
  let hasEmailProvider = false;

  try {
    const ctx = getCloudflareContext();
    // Email provider is only available when D1 is available
    hasEmailProvider = !!ctx?.env?.DB;
  } catch {
    // Not in edge runtime, email provider not available
    hasEmailProvider = false;
  }

  return NextResponse.json({
    emailAvailable: hasEmailProvider,
    oauthAvailable: true,
  });
}
