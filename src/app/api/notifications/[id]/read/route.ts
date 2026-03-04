import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse, errorResponse } from '@/lib/api/response';
import { NotFoundError, ValidationError } from '@/lib/api/errors';

export const PATCH = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const notificationId = ctx.params!.id;

    if (!notificationId) {
      return errorResponse(new ValidationError('Notification ID is required'));
    }

    // Verify the notification belongs to the current user
    const notification = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, ctx.user!.sub)
      ))
      .limit(1);

    if (notification.length === 0) {
      return errorResponse(new NotFoundError('Notification not found'));
    }

    // Mark as read
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, ctx.user!.sub)
      ));

    return successResponse({ message: 'Notification marked as read' });
  },
);