import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { invoices, organizations, subscriptions, plans } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { updateInvoiceSchema } from '@/lib/validators/admin';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { invoiceId } = ctx.params!;

    const [invoiceData] = await db
      .select({
        id: invoices.id,
        orgId: invoices.orgId,
        subscriptionId: invoices.subscriptionId,
        amountDue: invoices.amountDue,
        currency: invoices.currency,
        status: invoices.status,
        lineItems: invoices.lineItems,
        paidAt: invoices.paidAt,
        dueDate: invoices.dueDate,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        orgName: organizations.name,
        orgSlug: organizations.slug,
        planName: plans.name,
        planTier: plans.tier,
        subscriptionStatus: subscriptions.status,
      })
      .from(invoices)
      .leftJoin(organizations, eq(invoices.orgId, organizations.id))
      .leftJoin(subscriptions, eq(invoices.subscriptionId, subscriptions.id))
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoiceData) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    return successResponse({ invoice: invoiceData });
  },
);

export const PATCH = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(updateInvoiceSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const { invoiceId } = ctx.params!;
    const body = ctx.body as {
      status?: string;
      paidAt?: string;
    };

    const [existing] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Invoice', invoiceId);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status !== undefined) updates.status = body.status;
    if (body.paidAt !== undefined) updates.paidAt = new Date(body.paidAt);

    const [updated] = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, invoiceId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.renew',
      resourceType: 'invoice',
      resourceId: invoiceId,
      metadata: { changes: updates, previousStatus: existing.status },
      ...reqMeta,
    });

    return successResponse({ invoice: updated });
  },
);