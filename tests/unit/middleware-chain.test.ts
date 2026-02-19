import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock jose before importing middleware-chain
vi.mock('jose', () => ({
  SignJWT: vi.fn(),
  jwtVerify: vi.fn(),
}));

// Mock the JWT module
vi.mock('@/lib/auth/jwt', () => ({
  verifyAccessToken: vi.fn(),
}));

import { jwtVerify } from 'jose';
import { verifyAccessToken } from '@/lib/auth/jwt';
import {
  withMiddleware,
  requireAuth,
  requireRole,
  validateBody,
  type ApiContext,
} from '@/lib/api/middleware-chain';
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from '@/lib/api/errors';

const mockJwtVerify = vi.mocked(jwtVerify);
const mockVerifyAccessToken = vi.mocked(verifyAccessToken);

describe('middleware-chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withMiddleware', () => {
    it('calls handler directly with no middleware', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const req = new NextRequest('http://localhost:3000/api/test');
      const routeCtx = { params: Promise.resolve({}) };

      const wrappedHandler = withMiddleware(handler);
      const result = await wrappedHandler(req, routeCtx);

      expect(handler).toHaveBeenCalledWith(req, { params: {} });
      expect(result.status).toBe(200);
    });

    it('chains middlewares in order', async () => {
      const breadcrumbs: string[] = [];
      
      const middleware1 = vi.fn().mockImplementation(async (req, ctx, next) => {
        breadcrumbs.push('mw1-start');
        const result = await next();
        breadcrumbs.push('mw1-end');
        return result;
      });

      const middleware2 = vi.fn().mockImplementation(async (req, ctx, next) => {
        breadcrumbs.push('mw2-start');
        const result = await next();
        breadcrumbs.push('mw2-end');
        return result;
      });

      const handler = vi.fn().mockImplementation(() => {
        breadcrumbs.push('handler');
        return NextResponse.json({ success: true });
      });

      const req = new NextRequest('http://localhost:3000/api/test');
      const routeCtx = { params: Promise.resolve({}) };

      const wrappedHandler = withMiddleware(middleware1, middleware2, handler);
      await wrappedHandler(req, routeCtx);

      expect(breadcrumbs).toEqual(['mw1-start', 'mw2-start', 'handler', 'mw2-end', 'mw1-end']);
    });

    it('catches ApiError and returns errorResponse', async () => {
      const handler = vi.fn().mockRejectedValue(new ValidationError({ message: 'Invalid data' }));
      const req = new NextRequest('http://localhost:3000/api/test');
      const routeCtx = { params: Promise.resolve({}) };

      const wrappedHandler = withMiddleware(handler);
      const result = await wrappedHandler(req, routeCtx);

      expect(result.status).toBe(422);
      const body = await result.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('catches unknown errors and returns 500', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const handler = vi.fn().mockRejectedValue(new Error('Unexpected error'));
      const req = new NextRequest('http://localhost:3000/api/test');
      const routeCtx = { params: Promise.resolve({}) };

      const wrappedHandler = withMiddleware(handler);
      const result = await wrappedHandler(req, routeCtx);

      expect(result.status).toBe(500);
      const body = await result.json();
      expect(body.error.code).toBe('INTERNAL_ERROR');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled API error:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    it('resolves params from routeCtx.params Promise', async () => {
      const handler = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));
      const req = new NextRequest('http://localhost:3000/api/test');
      const routeCtx = { params: Promise.resolve({ id: '123', slug: 'test' }) };

      const wrappedHandler = withMiddleware(handler);
      await wrappedHandler(req, routeCtx);

      expect(handler).toHaveBeenCalledWith(req, { params: { id: '123', slug: 'test' } });
    });
  });

  describe('requireAuth', () => {
    it('passes when valid Bearer token present', async () => {
      const mockPayload = { sub: 'user1', partyId: 'org::1', role: 'admin' as const, orgId: 'org1' };
      mockVerifyAccessToken.mockResolvedValue(mockPayload);

      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer valid-token' },
      });
      const ctx: ApiContext = {};
      const next = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const middleware = requireAuth();
      await middleware(req, ctx, next);

      expect(mockVerifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(ctx.user).toEqual(mockPayload);
      expect(next).toHaveBeenCalled();
    });

    it('reads token from cookie when no Authorization header', async () => {
      const mockPayload = { sub: 'user1', partyId: 'org::1', role: 'admin' as const, orgId: 'org1' };
      mockVerifyAccessToken.mockResolvedValue(mockPayload);

      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Cookie': 'flowryd-access-token=cookie-token' },
      });
      const ctx: ApiContext = {};
      const next = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const middleware = requireAuth();
      await middleware(req, ctx, next);

      expect(mockVerifyAccessToken).toHaveBeenCalledWith('cookie-token');
      expect(ctx.user).toEqual(mockPayload);
    });

    it('throws UnauthorizedError when no token at all', async () => {
      const req = new NextRequest('http://localhost:3000/api/test');
      const ctx: ApiContext = {};
      const next = vi.fn();

      const middleware = requireAuth();
      
      await expect(middleware(req, ctx, next)).rejects.toThrow(UnauthorizedError);
      expect(next).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedError when verifyAccessToken rejects', async () => {
      mockVerifyAccessToken.mockRejectedValue(new Error('Invalid token'));

      const req = new NextRequest('http://localhost:3000/api/test', {
        headers: { 'Authorization': 'Bearer invalid-token' },
      });
      const ctx: ApiContext = {};
      const next = vi.fn();

      const middleware = requireAuth();
      
      await expect(middleware(req, ctx, next)).rejects.toThrow(UnauthorizedError);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('passes when user role matches', async () => {
      const req = new NextRequest('http://localhost:3000/api/test');
      const ctx: ApiContext = {
        user: { sub: 'user1', partyId: 'org::1', role: 'admin', orgId: 'org1' },
      };
      const next = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const middleware = requireRole('admin', 'editor');
      await middleware(req, ctx, next);

      expect(next).toHaveBeenCalled();
    });

    it('throws ForbiddenError when role does not match', async () => {
      const req = new NextRequest('http://localhost:3000/api/test');
      const ctx: ApiContext = {
        user: { sub: 'user1', partyId: 'org::1', role: 'viewer', orgId: 'org1' },
      };
      const next = vi.fn();

      const middleware = requireRole('admin', 'editor');
      
      await expect(middleware(req, ctx, next)).rejects.toThrow(ForbiddenError);
      expect(next).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedError when no user in context', async () => {
      const req = new NextRequest('http://localhost:3000/api/test');
      const ctx: ApiContext = {};
      const next = vi.fn();

      const middleware = requireRole('admin');
      
      await expect(middleware(req, ctx, next)).rejects.toThrow(UnauthorizedError);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateBody', () => {
    it('passes when body matches schema', async () => {
      const schema = z.object({ title: z.string() });
      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'test' }),
      });
      const ctx: ApiContext = {};
      const next = vi.fn().mockResolvedValue(NextResponse.json({ success: true }));

      const middleware = validateBody(schema);
      await middleware(req, ctx, next);

      expect(ctx.body).toEqual({ title: 'test' });
      expect(next).toHaveBeenCalled();
    });

    it('throws ValidationError on invalid body', async () => {
      const schema = z.object({ title: z.string() });
      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 123 }), // Invalid: number instead of string
      });
      const ctx: ApiContext = {};
      const next = vi.fn();

      const middleware = validateBody(schema);
      
      await expect(middleware(req, ctx, next)).rejects.toThrow(ValidationError);
      expect(next).not.toHaveBeenCalled();
    });

    it('throws ValidationError on non-JSON body', async () => {
      const schema = z.object({ title: z.string() });
      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json{',
      });
      const ctx: ApiContext = {};
      const next = vi.fn();

      const middleware = validateBody(schema);
      
      await expect(middleware(req, ctx, next)).rejects.toThrow(ValidationError);
      const error = await middleware(req, ctx, next).catch(e => e);
      expect(error.details).toEqual({ message: 'Invalid JSON body' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});