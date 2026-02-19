import { NextRequest } from 'next/server';
import { desc, eq, and, notInArray } from 'drizzle-orm';
import { db } from '@/db';
import { subscriptions, plans, invoices, paymentMethods } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { createSubscriptionSchema } from '@/lib/validators/subscriptions';
import { successResponse } from '@/lib/api/response';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { getPaymentProvider } from '@/lib/billing';
import { NotFoundError, ConflictError } from '@/lib/api/errors';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const [subscription] = await db
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
        plan: {
          id: plans.id,
          name: plans.name,
          tier: plans.tier,
          priceAmount: plans.priceAmount,
          priceCurrency: plans.priceCurrency,
          interval: plans.interval,
          features: plans.features,
        },
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.planId, plans.id))
      .where(
        and(
          eq(subscriptions.orgId, ctx.user!.orgId),
          notInArray(subscriptions.status, ['cancelled', 'expired'])
        )
      )
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    return successResponse({ subscription: subscription || null });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(createSubscriptionSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'subscription.manage');

    const body = ctx.body as { planId: string; paymentMethodId?: string };

    const [plan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, body.planId), eq(plans.isActive, true)))
      .limit(1);

    if (!plan) {
      throw new NotFoundError('Plan not found or inactive');
    }

    const [existingSubscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.orgId, ctx.user!.orgId),
          notInArray(subscriptions.status, ['cancelled', 'expired'])
        )
      )
      .limit(1);

    if (existingSubscription) {
      throw new ConflictError('Organization already has an active subscription');
    }

    const provider = getPaymentProvider();

    let paymentMethod = null;
    if (body.paymentMethodId) {
      [paymentMethod] = await db
        .select()
        .from(paymentMethods)
        .where(
          and(
            eq(paymentMethods.id, body.paymentMethodId),
            eq(paymentMethods.orgId, ctx.user!.orgId)
          )
        )
        .limit(1);

      if (!paymentMethod) {
        throw new NotFoundError('Payment method not found');
      }
    }

    await provider.createCharge({
      amount: plan.priceAmount,
      currency: plan.priceCurrency ?? '$CC',
      walletAddress: paymentMethod?.walletAddress ?? 'mock-wallet',
      description: `Subscription: ${plan.name}`,
    });

    const now = new Date();
    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        orgId: ctx.user!.orgId,
        planId: plan.id,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd,
      })
      .returning();

    const [invoice] = await db
      .insert(invoices)
      .values({
        orgId: ctx.user!.orgId,
        subscriptionId: subscription.id,
        amountDue: plan.priceAmount,
        status: 'paid',
        paidAt: now,
        dueDate: now,
        lineItems: [
          {
            description: `Subscription: ${plan.name}`,
            amount: plan.priceAmount,
            quantity: 1,
          },
        ],
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.create',
      resourceType: 'subscription',
      resourceId: subscription.id,
      ...reqMeta,
    });

    return successResponse({ subscription, invoice }, 201);
  },
);