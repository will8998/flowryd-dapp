import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { addParticipantSchema, removeParticipantSchema } from '@/lib/validators/deals';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ConflictError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const POST = withMiddleware(
  requireAuth(),
  validateBody(addParticipantSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.create');

    const { dealId } = ctx.params!;
    const body = ctx.body as { userId: string; role: 'admin' | 'editor' | 'viewer' };

    const [deal] = await db
      .select({ id: deals.id })
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    const [existing] = await db
      .select({ id: dealParticipants.id })
      .from(dealParticipants)
      .where(
        and(
          eq(dealParticipants.dealId, dealId),
          eq(dealParticipants.userId, body.userId),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ConflictError('User is already a participant');
    }

    const [participant] = await db
      .insert(dealParticipants)
      .values({
        dealId,
        userId: body.userId,
        role: body.role,
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'deal.participant_add',
      resourceType: 'deal',
      resourceId: dealId,
      metadata: { addedUserId: body.userId, role: body.role },
      ...reqMeta,
    });

    return successResponse({ participant }, 201);
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  validateBody(removeParticipantSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.create');

    const { dealId } = ctx.params!;
    const body = ctx.body as { userId: string };

    const deleted = await db
      .delete(dealParticipants)
      .where(
        and(
          eq(dealParticipants.dealId, dealId),
          eq(dealParticipants.userId, body.userId),
        ),
      )
      .returning();

    if (deleted.length === 0) {
      throw new NotFoundError('Participant');
    }

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'deal.participant_remove',
      resourceType: 'deal',
      resourceId: dealId,
      metadata: { removedUserId: body.userId },
      ...reqMeta,
    });

    return successResponse({ removed: true });
  },
);
