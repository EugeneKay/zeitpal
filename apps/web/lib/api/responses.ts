import { NextResponse } from 'next/server';

import type { ApiError, PaginatedResponse } from '~/lib/types';

/**
 * API Response Helpers
 *
 * Consistent response formatting for all API routes.
 * Follows the ApiError interface for error responses.
 */

// Success responses

interface SuccessResponse<T> {
  data: T;
}

export function success<T>(data: T, status = 200): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({ data }, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

// Error responses

export function unauthorized(
  message = 'Unauthorized',
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: 401 },
  );
}

export function forbidden(
  message = 'Forbidden',
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message, code: 'FORBIDDEN' },
    { status: 403 },
  );
}

export function notFound(
  resource = 'Resource',
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: `${resource} not found`, code: 'NOT_FOUND' },
    { status: 404 },
  );
}

export function badRequest(
  message: string,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message, code: 'BAD_REQUEST', details },
    { status: 400 },
  );
}

export function validationError(
  details: unknown,
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: 'Validation failed', code: 'VALIDATION_ERROR', details },
    { status: 400 },
  );
}

export function conflict(
  message: string,
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message, code: 'CONFLICT' },
    { status: 409 },
  );
}

export function internalError(
  message = 'An error occurred',
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message, code: 'INTERNAL_ERROR' },
    { status: 500 },
  );
}

// Helper to wrap async route handlers with error handling
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>,
): Promise<NextResponse<T | ApiError>> {
  return handler().catch((error) => {
    console.error('API Error:', error);
    return internalError();
  });
}
