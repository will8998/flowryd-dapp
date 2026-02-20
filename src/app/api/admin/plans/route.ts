import { NextRequest } from 'next/server';
import { desc, asc, ilike, count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { plans, subscriptions } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { paginationParamsSchema, createPlanSchema } from '@/lib/validators/admin';

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
      conditions.push(ilike(plans.name, `%${search}%`));
    }

    const sortColumn = sortBy === 'name' ? plans.name : 
                      sortBy === 'tier' ? plans.tier :
                      sortBy === 'priceAmount' ? plans.priceAmount :
                      plans.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [plansData, totalCount] = await Promise.all([
      db
        .select({
          id: plans.id,
          name: plans.name,
          tier: plans.tier,
          priceAmount: plans.priceAmount,
          priceCurrency: plans.priceCurrency,
          interval: plans.interval,
          features: plans.features,
          isActive: plans.isActive,
          createdAt: plans.createdAt,
          updatedAt: plans.updatedAt,
          subscriberCount: count(subscriptions.id),
        })
        .from(plans)
        .leftJoin(subscriptions, eq(subscriptions.planId, plans.id))
        .where(conditions.length > 0 ? conditions[0] : undefined)
        .groupBy(plans.id)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(plans)
        .where(conditions.length > 0 ? conditions[0] : undefined)
        .then(result => result[0].count)
    ]);

    const hasMore = offset + limit < totalCount;

    return successResponse({
      data: plansData,
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
  validateBody(createPlanSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as {
      name: string;
      tier: 'discover' | 'navigate' | 'activate';
      priceAmount: number;
      priceCurrency?: string;
      interval?: string;
      features?: string[];
      isActive?: boolean;
    };

    const [newPlan] = await db
      .insert(plans)
      .values({
        name: body.name,
        tier: body.tier,
        priceAmount: body.priceAmount,
        priceCurrency: body.priceCurrency || '$CC',
        interval: body.interval || 'monthly',
        features: body.features || [],
        isActive: body.isActive ?? true,
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.create',
      resourceType: 'plan',
      resourceId: newPlan.id,
      metadata: { name: body.name, tier: body.tier, priceAmount: body.priceAmount },
      ...reqMeta,
    });

    return successResponse({ plan: newPlan }, 201);
  },
);