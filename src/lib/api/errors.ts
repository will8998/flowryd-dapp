export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} '${id}' not found` : `${resource} not found`;
    super('NOT_FOUND', message, 404);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
  }
}

export class ValidationError extends ApiError {
  constructor(details: unknown) {
    super('VALIDATION_ERROR', 'Validation failed', 422, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}
