import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api/response';
import { ApiError } from '@/lib/api/errors';

describe('Response functions', () => {
  describe('successResponse', () => {
    it('returns JSON with data shape and 200 status', async () => {
      const data = { id: 1, name: 'test' };
      const response = successResponse(data);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ data });
    });

    it('returns custom status code', async () => {
      const data = { created: true };
      const response = successResponse(data, 201);

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json).toEqual({ data });
    });

    it('handles null data', async () => {
      const response = successResponse(null);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ data: null });
    });

    it('handles array data', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = successResponse(data);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ data });
    });
  });

  describe('errorResponse', () => {
    it('returns correct error shape', async () => {
      const error = new ApiError('TEST_ERROR', 'Something went wrong', 400);
      const response = errorResponse(error);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json).toEqual({
        error: {
          code: 'TEST_ERROR',
          message: 'Something went wrong',
        },
      });
    });

    it('includes details when present', async () => {
      const details = { field: 'email', issue: 'invalid format' };
      const error = new ApiError('VALIDATION_ERROR', 'Validation failed', 422, details);
      const response = errorResponse(error);

      expect(response.status).toBe(422);
      const json = await response.json();
      expect(json).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details,
        },
      });
    });

    it('omits details when not present', async () => {
      const error = new ApiError('NOT_FOUND', 'Resource not found', 404);
      const response = errorResponse(error);

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      });
      expect(json.error).not.toHaveProperty('details');
    });

    it('handles error with undefined details', async () => {
      const error = new ApiError('SERVER_ERROR', 'Internal error', 500, undefined);
      const response = errorResponse(error);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json).toEqual({
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal error',
        },
      });
      expect(json.error).not.toHaveProperty('details');
    });
  });

  describe('paginatedResponse', () => {
    it('returns data with pagination cursor and hasMore', async () => {
      const data = [{ id: 1 }, { id: 2 }];
      const cursor = 'cursor123';
      const hasMore = true;
      const response = paginatedResponse(data, cursor, hasMore);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({
        data,
        pagination: { cursor, hasMore },
      });
    });

    it('handles null cursor', async () => {
      const data = [{ id: 1 }];
      const response = paginatedResponse(data, null, false);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({
        data,
        pagination: { cursor: null, hasMore: false },
      });
    });

    it('handles hasMore true', async () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const response = paginatedResponse(data, 'next-page', true);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.pagination.hasMore).toBe(true);
      expect(json.pagination.cursor).toBe('next-page');
    });

    it('handles hasMore false', async () => {
      const data = [{ id: 1 }];
      const response = paginatedResponse(data, 'last-cursor', false);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.pagination.hasMore).toBe(false);
      expect(json.pagination.cursor).toBe('last-cursor');
    });

    it('handles empty data array', async () => {
      const data: any[] = [];
      const response = paginatedResponse(data, null, false);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({
        data: [],
        pagination: { cursor: null, hasMore: false },
      });
    });
  });
});