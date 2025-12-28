/**
 * Get the CSRF token from the meta tag.
 * Used for API requests that require CSRF protection.
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}
