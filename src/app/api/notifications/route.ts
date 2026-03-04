import { NextRequest } from 'next/server';
import { desc, eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { notifications } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { paginatedResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 50);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    const conditions = [eq(notifications.userId, ctx.user!.sub)];
    
    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    const rows = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? String(offset + limit) : null;

    return paginatedResponse(data, nextCursor, hasMore);
  },
);