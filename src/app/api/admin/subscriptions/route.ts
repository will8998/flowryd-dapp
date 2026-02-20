import { NextRequest } from 'next/server';
import { eq, and, notInArray, desc, asc, ilike, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions, plans, organizations } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { paginationParamsSchema, createSubscriptionSchema } from '@/lib/validators/admin';
import { z } from 'zod';

const setTierSchema = z.object({
  tier: z.enum(['discover', 'navigate', 'activate']),
  orgId: z.string().uuid().optional(),
});

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
      conditions.push(ilike(organizations.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(subscriptions.status, status as 'pending' | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'));
    }

    const sortColumn = sortBy === 'status' ? subscriptions.status : 
                      sortBy === 'currentPeriodEnd' ? subscriptions.currentPeriodEnd :
                      subscriptions.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const whereClause = conditions.length > 0 ? sql`${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`, sql`1=1`)}` : undefined;

    const [subscriptionsData, totalCount] = await Promise.all([
      db
        .select({
          id: subscriptions.id,
          orgId: subscriptions.orgId,
          planId: subscriptions.planId,
          status: subscriptions.status,
          currentPeriodStart: subscriptions.currentPeriodStart,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          cancelledAt: subscriptions.cancelledAt,
          trialEndsAt: subscriptions.trialEndsAt,
          metadata: subscriptions.metadata,
          createdAt: subscriptions.createdAt,
          updatedAt: subscriptions.updatedAt,
          orgName: organizations.name,
          orgSlug: organizations.slug,
          planName: plans.name,
          planTier: plans.tier,
          planPriceAmount: plans.priceAmount,
        })
        .from(subscriptions)
        .leftJoin(organizations, eq(subscriptions.orgId, organizations.id))
        .leftJoin(plans, eq(subscriptions.planId, plans.id))
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(subscriptions)
        .leftJoin(organizations, eq(subscriptions.orgId, organizations.id))
        .where(whereClause)
        .then(result => result[0].count)
    ]);

    const enriched = subscriptionsData.map(s => ({
      id: s.id,
      orgId: s.orgId,
      planId: s.planId,
      status: s.status,
      currentPeriodStart: s.currentPeriodStart,
      currentPeriodEnd: s.currentPeriodEnd,
      cancelledAt: s.cancelledAt,
      trialEndsAt: s.trialEndsAt,
      metadata: s.metadata,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      organization: { id: s.orgId, name: s.orgName },
      plan: { id: s.planId, name: s.planName, tier: s.planTier },
    }));

    return successResponse({
      subscriptions: enriched,
      total: totalCount,
    });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(createSubscriptionSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as {
      orgId: string;
      planId: string;
      status?: 'pending' | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
      currentPeriodStart?: string;
      currentPeriodEnd?: string;
      trialEndsAt?: string;
      metadata?: Record<string, unknown>;
    };

    const [newSubscription] = await db
      .insert(subscriptions)
      .values({
        orgId: body.orgId,
        planId: body.planId,
        status: body.status || 'pending',
        currentPeriodStart: body.currentPeriodStart ? new Date(body.currentPeriodStart) : undefined,
        currentPeriodEnd: body.currentPeriodEnd ? new Date(body.currentPeriodEnd) : undefined,
        trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : undefined,
        metadata: body.metadata,
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.create',
      resourceType: 'subscription',
      resourceId: newSubscription.id,
      metadata: { orgId: body.orgId, planId: body.planId, adminCreated: true },
      ...reqMeta,
    });

    return successResponse({ subscription: newSubscription }, 201);
  },
);

export const PATCH = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(setTierSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as { tier: 'discover' | 'navigate' | 'activate'; orgId?: string };
    const targetOrgId = body.orgId ?? ctx.user!.orgId;

    const [plan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.tier, body.tier), eq(plans.isActive, true)))
      .limit(1);

    if (!plan) {
      throw new NotFoundError(`No active plan found for tier: ${body.tier}`);
    }

    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.orgId, targetOrgId),
          notInArray(subscriptions.status, ['cancelled', 'expired'])
        )
      )
      .limit(1);

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    let subscription;

    if (existing) {
      [subscription] = await db
        .update(subscriptions)
        .set({
          planId: plan.id,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        })
        .where(eq(subscriptions.id, existing.id))
        .returning();
    } else {
      [subscription] = await db
        .insert(subscriptions)
        .values({
          orgId: targetOrgId,
          planId: plan.id,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        })
        .returning();
    }

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.create',
      resourceType: 'subscription',
      resourceId: subscription.id,
      metadata: { tier: body.tier, adminOverride: true },
      ...reqMeta,
    });

    return successResponse({ subscription, plan });
  },
);
