import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const POST = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.create');
    
    const { dealId } = ctx.params!;

    // Get the original deal
    const [originalDeal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!originalDeal) {
      throw new NotFoundError('Deal', dealId);
    }

    // Create the cloned deal
    const [clonedDeal] = await db
      .insert(deals)
      .values({
        orgId: ctx.user!.orgId,
        title: `${originalDeal.title} (Copy)`,
        description: originalDeal.description,
        flowId: originalDeal.flowId,
        status: 'draft',
        volume: originalDeal.volume,
        metadata: originalDeal.metadata,
        createdBy: ctx.user!.sub,
      })
      .returning();

    // Add the creator as a participant
    await db.insert(dealParticipants).values({
      dealId: clonedDeal.id,
      userId: ctx.user!.sub,
      role: 'admin',
    });

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'deal.create',
      resourceType: 'deal',
      resourceId: clonedDeal.id,
      metadata: { clonedFrom: dealId },
      ...reqMeta,
    });

    return successResponse({ deal: clonedDeal }, 201);
  },
);