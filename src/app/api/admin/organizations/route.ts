import { NextRequest } from 'next/server';
import { desc, asc, ilike, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { organizations, users, flows, deals } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { paginationParamsSchema, createOrganizationSchema } from '@/lib/validators/admin';

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

    const conditions = [];
    if (search) {
      conditions.push(ilike(organizations.name, `%${search}%`));
    }

    const sortColumn = sortBy === 'name' ? organizations.name : organizations.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [orgsData, totalCount] = await Promise.all([
      db
        .select({
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          domain: organizations.domain,
          createdAt: organizations.createdAt,
          updatedAt: organizations.updatedAt,
          userCount: count(users.id),
          flowCount: count(flows.id),
          dealCount: count(deals.id),
        })
        .from(organizations)
        .leftJoin(users, sql`${users.orgId} = ${organizations.id}`)
        .leftJoin(flows, sql`${flows.orgId} = ${organizations.id}`)
        .leftJoin(deals, sql`${deals.orgId} = ${organizations.id}`)
        .where(conditions.length > 0 ? sql`${conditions[0]}` : undefined)
        .groupBy(organizations.id)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(organizations)
        .where(conditions.length > 0 ? sql`${conditions[0]}` : undefined)
        .then(result => result[0].count)
    ]);

    const hasMore = offset + limit < totalCount;

    return successResponse({
      organizations: orgsData,
      total: totalCount,
    });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(createOrganizationSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as { name: string; slug: string; domain?: string };

    const [newOrg] = await db
      .insert(organizations)
      .values({
        name: body.name,
        slug: body.slug,
        domain: body.domain,
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'user.register',
      resourceType: 'organization',
      resourceId: newOrg.id,
      metadata: { name: body.name, slug: body.slug },
      ...reqMeta,
    });

    return successResponse({ organization: newOrg }, 201);
  },
);