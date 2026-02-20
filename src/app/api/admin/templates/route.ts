import { NextRequest } from 'next/server';
import { desc, asc, ilike, count, eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { flows } from '@/db/schema';
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
      sortBy: url.searchParams.get('sortBy') || 'title',
      sortDir: url.searchParams.get('sortDir'),
    });

    const conditions = [eq(flows.isTemplate, true)];
    if (search) {
      conditions.push(ilike(flows.title, `%${search}%`));
    }

    const sortColumn = sortBy === 'title' ? flows.title : flows.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const whereClause = and(...conditions);

    const [templatesData, totalCount] = await Promise.all([
      db
        .select({
          id: flows.id,
          title: flows.title,
          description: flows.description,
          status: flows.status,
          isTemplate: flows.isTemplate,
          isPublic: flows.isPublic,
          workflowType: flows.workflowType,
          createdBy: flows.createdBy,
          orgId: flows.orgId,
          createdAt: flows.createdAt,
          updatedAt: flows.updatedAt,
          featured: flows.isFeatured,
        })
        .from(flows)
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

    return successResponse({
      templates: templatesData,
      total: totalCount,
    });
  },
);
