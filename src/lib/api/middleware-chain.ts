import { NextRequest, NextResponse } from 'next/server';
import { type ZodType } from 'zod';
import { verifyAccessToken, type AccessTokenPayload } from '@/lib/auth/jwt';
import { ApiError, UnauthorizedError, ForbiddenError, ValidationError } from './errors';
import { errorResponse } from './response';

export interface ApiContext {
  user?: AccessTokenPayload;
  body?: unknown;
  params?: Record<string, string>;
}

type RouteHandler = (
  req: NextRequest,
  ctx: ApiContext,
) => Promise<NextResponse> | NextResponse;

type Middleware = (
  req: NextRequest,
  ctx: ApiContext,
  next: () => Promise<NextResponse>,
) => Promise<NextResponse>;

export function withMiddleware(
  ...fns: [...Middleware[], RouteHandler]
): (req: NextRequest, routeCtx: { params: Promise<Record<string, string>> }) => Promise<NextResponse> {
  return async (req: NextRequest, routeCtx: { params: Promise<Record<string, string>> }) => {
    const ctx: ApiContext = {};

    if (routeCtx?.params) {
      ctx.params = await routeCtx.params;
    }

    const handler = fns[fns.length - 1] as RouteHandler;
    const middlewares = fns.slice(0, -1) as Middleware[];

    let index = 0;

    const next = async (): Promise<NextResponse> => {
      if (index < middlewares.length) {
        const mw = middlewares[index++];
        return mw(req, ctx, next);
      }
      return handler(req, ctx);
    };

    try {
      return await next();
    } catch (error) {
      if (error instanceof ApiError) {
        return errorResponse(error);
      }
      console.error('Unhandled API error:', error);
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
        { status: 500 },
      );
    }
  };
}

export function requireAuth(): Middleware {
  return async (req, ctx, next) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('flowryd-access-token')?.value;

    if (!token) {
      throw new UnauthorizedError();
    }

    try {
      ctx.user = await verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }

    return next();
  };
}

export function requireRole(...roles: AccessTokenPayload['role'][]): Middleware {
  return async (_req, ctx, next) => {
    if (!ctx.user) {
      throw new UnauthorizedError();
    }

    if (!roles.includes(ctx.user.role)) {
      throw new ForbiddenError(`Required role: ${roles.join(' or ')}`);
    }

    return next();
  };
}

export function validateBody<T>(schema: ZodType<T>): Middleware {
  return async (req, ctx, next) => {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      throw new ValidationError({ message: 'Invalid JSON body' });
    }

    const result = schema.safeParse(rawBody);
    if (!result.success) {
      throw new ValidationError(result.error.issues);
    }

    ctx.body = result.data;
    return next();
  };
}
