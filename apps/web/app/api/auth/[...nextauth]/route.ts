export const runtime = 'edge';

import type { NextRequest } from 'next/server';

import { getHandlers } from '~/lib/auth/auth';

// Dynamic handlers that initialize Auth.js with D1 adapter per-request
export async function GET(request: NextRequest) {
  const { GET } = getHandlers();
  return GET(request);
}

export async function POST(request: NextRequest) {
  const { POST } = getHandlers();
  return POST(request);
}
