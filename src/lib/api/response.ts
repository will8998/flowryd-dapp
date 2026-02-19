import { NextResponse } from 'next/server';
import { ApiError } from './errors';

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(error: ApiError): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    },
    { status: error.status },
  );
}

export function paginatedResponse<T>(
  data: T[],
  cursor: string | null,
  hasMore: boolean,
): NextResponse {
  return NextResponse.json({
    data,
    pagination: { cursor, hasMore },
  });
}
