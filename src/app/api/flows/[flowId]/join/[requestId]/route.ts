import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { flows, joinRequests, flowParticipants, users } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { z } from 'zod';

const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const PATCH = withMiddleware(
  requireAuth(),
  validateBody(reviewSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { flowId, requestId } = ctx.params!;
    const body = ctx.body as { status: 'approved' | 'rejected' };

    const [flow] = await db
      .select({ id: flows.id, orgId: flows.orgId })
      .from(flows)
      .where(eq(flows.id, flowId))
      .limit(1);

    if (!flow || flow.orgId !== ctx.user!.orgId) {
      throw new ForbiddenError('Only the flow owner org can review join requests');
    }

    requirePermission(ctx.user!.role, 'flow.manage_templates');

    const [request] = await db
      .select()
      .from(joinRequests)
      .where(
        and(
          eq(joinRequests.id, requestId),
          eq(joinRequests.flowId, flowId),
          eq(joinRequests.status, 'pending'),
        ),
      )
      .limit(1);

    if (!request) {
      throw new NotFoundError('Join request', requestId);
    }

    const [updated] = await db
      .update(joinRequests)
      .set({
        status: body.status,
        reviewedBy: ctx.user!.sub,
        reviewedAt: new Date(),
      })
      .where(eq(joinRequests.id, requestId))
      .returning();

    if (body.status === 'approved') {
      const [requester] = await db
        .select({ partyId: users.partyId })
        .from(users)
        .where(eq(users.id, request.requesterId))
        .limit(1);

      if (requester) {
        await db
          .insert(flowParticipants)
          .values({
            flowId,
            participantId: requester.partyId,
            addedBy: ctx.user!.sub,
          })
          .onConflictDoNothing();
      }
    }

    return successResponse({ joinRequest: updated });
  },
);
