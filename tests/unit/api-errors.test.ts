import { describe, it, expect } from 'vitest';
import {
  ApiError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
} from '@/lib/api/errors';

describe('API errors', () => {
  it('ApiError has correct properties', () => {
    const err = new ApiError('TEST', 'test message', 400, { detail: 'x' });
    expect(err.code).toBe('TEST');
    expect(err.message).toBe('test message');
    expect(err.status).toBe(400);
    expect(err.details).toEqual({ detail: 'x' });
    expect(err).toBeInstanceOf(Error);
  });

  it('NotFoundError returns 404', () => {
    const err = new NotFoundError('User', '123');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toContain('123');
  });

  it('UnauthorizedError returns 401', () => {
    const err = new UnauthorizedError();
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError returns 403', () => {
    const err = new ForbiddenError('Custom message');
    expect(err.status).toBe(403);
    expect(err.message).toBe('Custom message');
  });

  it('ValidationError returns 422 with details', () => {
    const details = [{ path: ['email'], message: 'Invalid' }];
    const err = new ValidationError(details);
    expect(err.status).toBe(422);
    expect(err.details).toEqual(details);
  });

  it('ConflictError returns 409', () => {
    const err = new ConflictError('Already exists');
    expect(err.status).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });
});
