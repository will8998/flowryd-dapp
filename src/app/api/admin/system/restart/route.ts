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

    // Log the restart action
    logger.warn('Admin system restart requested', { 
      userId: session.sub,
      timestamp: new Date().toISOString()
    });

    // IMPORTANT: This is a simulated restart for safety
    // In production, this would trigger PM2 restart or similar
    // We don't actually restart from the UI for security reasons
    
    return successResponse({ 
      message: 'System restart initiated (simulated)',
      timestamp: new Date().toISOString(),
      note: 'This is a simulated restart for safety. Actual system restarts should be performed via deployment tools.'
    });
  } catch (error) {
    logger.error('Error processing restart request', { error });
    return errorResponse(new ApiError('Failed to process restart request', 'INTERNAL_ERROR', 500));
  }
}