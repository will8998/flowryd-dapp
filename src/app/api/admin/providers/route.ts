import { NextRequest } from 'next/server';
import { desc, asc, ilike, count, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { providers, providerApplications } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { paginationParamsSchema, createProviderSchema } from '@/lib/validators/admin';

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

    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');

    const conditions = [];
    if (search) {
      conditions.push(ilike(providers.name, `%${search}%`));
    }
    if (category) {
      conditions.push(eq(providers.category, category as 'strategy' | 'development' | 'creative'));
    }
    if (status) {
      conditions.push(eq(providers.status, status as 'pending' | 'active' | 'inactive'));
    }

    const sortColumn = sortBy === 'name' ? providers.name : 
                      sortBy === 'category' ? providers.category :
                      sortBy === 'status' ? providers.status :
                      providers.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const whereClause = conditions.length > 0 ? sql`${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`, sql`1=1`)}` : undefined;

    const [providersData, totalCount] = await Promise.all([
      db
        .select({
          id: providers.id,
          name: providers.name,
          category: providers.category,
          description: providers.description,
          website: providers.website,
          contactEmail: providers.contactEmail,
          logoUrl: providers.logoUrl,
          status: providers.status,
          createdAt: providers.createdAt,
          updatedAt: providers.updatedAt,
          applicationCount: count(providerApplications.id),
        })
        .from(providers)
        .leftJoin(providerApplications, eq(providerApplications.providerId, providers.id))
        .where(whereClause)
        .groupBy(providers.id)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(providers)
        .where(whereClause)
        .then(result => result[0].count)
    ]);

    const hasMore = offset + limit < totalCount;

    return successResponse({
      data: providersData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore,
      },
    });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(createProviderSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as {
      name: string;
      category: 'strategy' | 'development' | 'creative';
      description?: string;
      website?: string;
      contactEmail?: string;
      logoUrl?: string;
      status?: 'pending' | 'active' | 'inactive';
      metadata?: Record<string, unknown>;
    };

    const [newProvider] = await db
      .insert(providers)
      .values({
        name: body.name,
        category: body.category,
        description: body.description,
        website: body.website,
        contactEmail: body.contactEmail,
        logoUrl: body.logoUrl,
        status: body.status || 'active',
        metadata: body.metadata,
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'provider.approve',
      resourceType: 'provider',
      resourceId: newProvider.id,
      metadata: { name: body.name, category: body.category },
      ...reqMeta,
    });

    return successResponse({ provider: newProvider }, 201);
  },
);