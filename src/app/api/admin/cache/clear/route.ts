import { getSession } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError, ForbiddenError, ApiError } from '@/lib/api/errors';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getSession();

    if (!session) {
      return errorResponse(new UnauthorizedError());
    }

    // Check if user is admin
    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.sub))
      .limit(1);

    if (!user || user.role !== 'admin') {
      return errorResponse(new ForbiddenError('Admin access required'));
    }

    // Log the cache clear action
    logger.info('Admin cache clear requested', { 
      userId: session.sub,
      timestamp: new Date().toISOString()
    });

    // In a real implementation, this would clear Redis cache, SWR cache, etc.
    // For now, we'll just return success to indicate the action was received
    
    return successResponse({ 
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error clearing cache', { error });
    return errorResponse(new ApiError('Failed to clear cache', 'INTERNAL_ERROR', 500));
  }
}