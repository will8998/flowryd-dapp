import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { deals } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { updateDealSchema } from '@/lib/validators/admin';

export const PATCH = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(updateDealSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const { dealId } = ctx.params!;
    const body = ctx.body as {
      title?: string;
      description?: string;
      status?: 'draft' | 'open' | 'negotiating' | 'locked' | 'committed';
      volume?: string;
      metadata?: Record<string, unknown>;
    };

    const [existing] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, dealId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Deal', dealId);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.volume !== undefined) updates.volume = body.volume;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    const [updated] = await db
      .update(deals)
      .set(updates)
      .where(eq(deals.id, dealId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    const action = body.status && body.status !== existing.status ? 'deal.status_change' : 'deal.create';
    
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action,
      resourceType: 'deal',
      resourceId: dealId,
      metadata: { 
        changes: updates,
        previousStatus: existing.status,
        adminUpdate: true,
      },
      ...reqMeta,
    });

    return successResponse({ deal: updated });
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    const { dealId } = ctx.params!;

    const [existing] = await db
      .select()
      .from(deals)
      .where(eq(deals.id, dealId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Deal', dealId);
    }

    await db.delete(deals).where(eq(deals.id, dealId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'deal.create',
      resourceType: 'deal',
      resourceId: dealId,
      metadata: { 
        deleted: true, 
        title: existing.title,
        status: existing.status,
        adminDelete: true,
      },
      ...reqMeta,
    });

    return successResponse({ success: true });
  },
);