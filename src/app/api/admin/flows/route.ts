import { NextRequest } from 'next/server';
import { desc, asc, ilike, count, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { flows, organizations, users } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { paginationParamsSchema } from '@/lib/validators/admin';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
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
      conditions.push(eq(flows.status, status as 'draft' | 'published' | 'archived'));
    }

    const sortColumn = sortBy === 'title' ? flows.title : 
                      sortBy === 'status' ? flows.status :
                      sortBy === 'workflowType' ? flows.workflowType :
                      flows.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const whereClause = conditions.length > 0 ? sql`${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`, sql`1=1`)}` : undefined;

    const [flowsData, totalCount] = await Promise.all([
      db
        .select({
          id: flows.id,
          orgId: flows.orgId,
          title: flows.title,
          description: flows.description,
          status: flows.status,
          isTemplate: flows.isTemplate,
          isPublic: flows.isPublic,
          isFeatured: flows.isFeatured,
          featuredHeadline: flows.featuredHeadline,
          featuredSource: flows.featuredSource,
          workflowType: flows.workflowType,
          createdBy: flows.createdBy,
          updatedBy: flows.updatedBy,
          createdAt: flows.createdAt,
          updatedAt: flows.updatedAt,
          orgName: organizations.name,
          orgSlug: organizations.slug,
          createdByName: users.displayName,
        })
        .from(flows)
        .leftJoin(organizations, eq(flows.orgId, organizations.id))
        .leftJoin(users, eq(flows.createdBy, users.id))
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(flows)
        .where(whereClause)
        .then(result => result[0].count)
    ]);

    const hasMore = offset + limit < totalCount;

    return successResponse({
      data: flowsData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore,
      },
    });
  },
);