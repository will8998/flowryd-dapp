import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export const POST = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    // Mark all notifications as read for the current user
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, ctx.user!.sub));

    return successResponse({ 
      message: 'All notifications marked as read'
    });
  },
);