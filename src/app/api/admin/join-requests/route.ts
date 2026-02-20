import { NextRequest } from 'next/server';
import { desc, asc, ilike, count, eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { joinRequests, flows } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { paginationParamsSchema } from '@/lib/validators/admin';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, _ctx: ApiContext) => {
    const url = new URL(req.url);
    const { limit, offset, search, sortBy, sortDir } = paginationParamsSchema.parse({
      limit: url.searchParams.get('limit'),
      offset: url.searchParams.get('offset'),
      search: url.searchParams.get('search'),
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortDir: url.searchParams.get('sortDir'),
    });

    const status = url.searchParams.get('status');

    const conditions = [];
    if (search) {
      conditions.push(ilike(flows.title, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(joinRequests.status, status as 'pending' | 'approved' | 'rejected'));
    }

    const sortColumn = sortBy === 'createdAt' ? joinRequests.createdAt : joinRequests.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [requestsData, totalCount] = await Promise.all([
      db
        .select({
          id: joinRequests.id,
          flowId: joinRequests.flowId,
          flowTitle: flows.title,
          requesterId: joinRequests.requesterId,
          message: joinRequests.message,
          status: joinRequests.status,
          reviewedBy: joinRequests.reviewedBy,
          reviewedAt: joinRequests.reviewedAt,
          createdAt: joinRequests.createdAt,
        })
        .from(joinRequests)
        .leftJoin(flows, eq(joinRequests.flowId, flows.id))
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(joinRequests)
        .leftJoin(flows, eq(joinRequests.flowId, flows.id))
        .where(whereClause)
        .then(result => result[0].count)
    ]);

    return successResponse({
      joinRequests: requestsData,
      total: totalCount,
    });
  },
);
