import { NextRequest } from 'next/server';
import { eq, and, notInArray } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions, plans } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { z } from 'zod';

const setTierSchema = z.object({
  tier: z.enum(['discover', 'navigate', 'activate']),
  orgId: z.string().uuid().optional(),
});

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
