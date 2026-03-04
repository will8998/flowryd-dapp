import { NextRequest } from 'next/server';
import { eq, and, count } from 'drizzle-orm';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, ctx.user!.sub),
        eq(notifications.read, false)
      ));

    const unreadCount = result[0]?.count || 0;

    return successResponse({ unreadCount });
  },
);