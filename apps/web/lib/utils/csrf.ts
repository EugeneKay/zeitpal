/**
 * Get the CSRF token from the meta tag.
 * Used for API requests that require CSRF protection.
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

/**
 * Fetch wrapper that automatically includes CSRF token and Content-Type headers.
 * Use this for all mutating API requests (POST, PUT, PATCH, DELETE).
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string; status: number }> {
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.method && options.method !== 'GET') {
    headers.set('x-csrf-token', getCsrfToken());
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return {
      error: errorData.error || `Request failed (${response.status})`,
      status: response.status,
    };
  }

  const data = await response.json().catch(() => ({}));
  return { data: data.data ?? data, status: response.status };
}
