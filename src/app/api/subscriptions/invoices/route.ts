import { NextRequest } from 'next/server';
import { desc, eq, and, lt } from 'drizzle-orm';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { paginatedResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 50);
    const cursor = url.searchParams.get('cursor');

    const conditions = [eq(invoices.orgId, ctx.user!.orgId)];
    
    if (cursor) {
      const cursorDate = new Date(cursor);
      conditions.push(lt(invoices.createdAt, cursorDate));
    }

    const rows = await db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;

    return paginatedResponse(data, nextCursor, hasMore);
  },
);