import { NextRequest } from 'next/server';
import { desc, asc, ilike, count, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { deals, organizations, flows, users } from '@/db/schema';
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
      conditions.push(ilike(deals.title, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(deals.status, status as 'draft' | 'open' | 'negotiating' | 'locked' | 'committed'));
    }

    const sortColumn = sortBy === 'title' ? deals.title : 
                      sortBy === 'status' ? deals.status :
                      sortBy === 'volume' ? deals.volume :
                      deals.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const whereClause = conditions.length > 0 ? sql`${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`, sql`1=1`)}` : undefined;

    const [dealsData, totalCount] = await Promise.all([
      db
        .select({
          id: deals.id,
          flowId: deals.flowId,
          orgId: deals.orgId,
          title: deals.title,
          description: deals.description,
          status: deals.status,
          volume: deals.volume,
          metadata: deals.metadata,
          createdBy: deals.createdBy,
          createdAt: deals.createdAt,
          updatedAt: deals.updatedAt,
          orgName: organizations.name,
          orgSlug: organizations.slug,
          flowTitle: flows.title,
          createdByName: users.displayName,
        })
        .from(deals)
        .leftJoin(organizations, eq(deals.orgId, organizations.id))
        .leftJoin(flows, eq(deals.flowId, flows.id))
        .leftJoin(users, eq(deals.createdBy, users.id))
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(deals)
        .where(whereClause)
        .then(result => result[0].count)
    ]);

    const hasMore = offset + limit < totalCount;

    return successResponse({
      deals: dealsData,
      total: totalCount,
    });
  },
);