import { NextRequest } from 'next/server';
import { eq, and, count } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants, users } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { updateDealStatusSchema } from '@/lib/validators/deals';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { validateTransition } from '@/lib/deals/state-machine';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const GET = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { dealId } = ctx.params!;

    const [deal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    const participants = await db
      .select({
        id: dealParticipants.id,
        userId: dealParticipants.userId,
        role: dealParticipants.role,
        joinedAt: dealParticipants.joinedAt,
        displayName: users.displayName,
        partyId: users.partyId,
      })
      .from(dealParticipants)
      .leftJoin(users, eq(dealParticipants.userId, users.id))
      .where(eq(dealParticipants.dealId, dealId));

    return successResponse({ deal, participants });
  },
);

export const PATCH = withMiddleware(
  requireAuth(),
  validateBody(updateDealStatusSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const { dealId } = ctx.params!;
    const body = ctx.body as { status: 'draft' | 'open' | 'negotiating' | 'locked' | 'committed' };

    const [deal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    const [participantCount] = await db
      .select({ value: count() })
      .from(dealParticipants)
      .where(eq(dealParticipants.dealId, dealId));

    validateTransition(deal.status!, body.status, ctx.user!.role, participantCount.value);

    const [updated] = await db
      .update(deals)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(deals.id, dealId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'deal.status_change',
      resourceType: 'deal',
      resourceId: dealId,
      metadata: { from: deal.status, to: body.status },
      ...reqMeta,
    });

    return successResponse({ deal: updated });
  },
);
