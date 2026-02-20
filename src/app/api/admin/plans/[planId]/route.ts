import { NextRequest } from 'next/server';
import { eq, count, notInArray } from 'drizzle-orm';
import { db } from '@/db';
import { plans, subscriptions } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { updatePlanSchema } from '@/lib/validators/admin';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { planId } = ctx.params!;

    const [planData] = await db
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
      .where(eq(plans.id, planId))
      .groupBy(plans.id)
      .limit(1);

    if (!planData) {
      throw new NotFoundError('Plan', planId);
    }

    return successResponse({ plan: planData });
  },
);

export const PATCH = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(updatePlanSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const { planId } = ctx.params!;
    const body = ctx.body as {
      name?: string;
      priceAmount?: number;
      priceCurrency?: string;
      interval?: string;
      features?: string[];
      isActive?: boolean;
    };

    const [existing] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Plan', planId);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.priceAmount !== undefined) updates.priceAmount = body.priceAmount;
    if (body.priceCurrency !== undefined) updates.priceCurrency = body.priceCurrency;
    if (body.interval !== undefined) updates.interval = body.interval;
    if (body.features !== undefined) updates.features = body.features;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    const [updated] = await db
      .update(plans)
      .set(updates)
      .where(eq(plans.id, planId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.create',
      resourceType: 'plan',
      resourceId: planId,
      metadata: { changes: updates },
      ...reqMeta,
    });

    return successResponse({ plan: updated });
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    const { planId } = ctx.params!;

    const [existing] = await db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Plan', planId);
    }

    const [activeSubscriptionsCount] = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        eq(subscriptions.planId, planId) &&
        notInArray(subscriptions.status, ['cancelled', 'expired'])
      )
      .then(result => [result[0].count]);

    if (activeSubscriptionsCount > 0) {
      return successResponse(
        { 
          error: 'Cannot delete plan with active subscriptions. Deactivate instead.',
          activeSubscriptions: activeSubscriptionsCount,
        },
        400
      );
    }

    await db
      .update(plans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(plans.id, planId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.cancel',
      resourceType: 'plan',
      resourceId: planId,
      metadata: { deactivated: true, name: existing.name },
      ...reqMeta,
    });

    return successResponse({ success: true, deactivated: true });
  },
);