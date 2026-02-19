import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { cancelSubscriptionSchema } from '@/lib/validators/subscriptions';
import { successResponse } from '@/lib/api/response';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { NotFoundError, ConflictError } from '@/lib/api/errors';

export const PATCH = withMiddleware(
  requireAuth(),
  validateBody(cancelSubscriptionSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'subscription.manage');

    const subscriptionId = ctx.params!.subscriptionId;
    const body = ctx.body as { reason?: string };

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.id, subscriptionId),
          eq(subscriptions.orgId, ctx.user!.orgId)
        )
      )
      .limit(1);

    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      throw new ConflictError('Subscription is already cancelled or expired');
    }

    const now = new Date();
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        status: 'cancelled',
        cancelledAt: now,
        metadata: {
          ...(subscription.metadata as Record<string, unknown> || {}),
          cancelReason: body.reason,
        },
      })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.cancel',
      resourceType: 'subscription',
      resourceId: subscriptionId,
      ...reqMeta,
    });

    return successResponse({ subscription: updatedSubscription });
  },
);