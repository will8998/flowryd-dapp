import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { flows, joinRequests } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ConflictError, ForbiddenError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { z } from 'zod';

const joinRequestSchema = z.object({
  message: z.string().max(1000).optional(),
});


export const POST = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const { flowId } = ctx.params!;

    const [flow] = await db
      .select()
      .from(flows)
      .where(and(eq(flows.id, flowId), eq(flows.isPublic, true), eq(flows.status, 'published')))
      .limit(1);

    if (!flow) {
      throw new NotFoundError('Flow', flowId);
    }

    if (flow.orgId === ctx.user!.orgId) {
      throw new ConflictError('Cannot request to join your own flow');
    }

    const [existing] = await db
      .select()
      .from(joinRequests)
      .where(
        and(
          eq(joinRequests.flowId, flowId),
          eq(joinRequests.requesterId, ctx.user!.sub),
          eq(joinRequests.status, 'pending'),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ConflictError('Join request already pending');
    }

    let body: { message?: string } = {};
    try {
      const rawBody = await req.json();
      const parsed = joinRequestSchema.safeParse(rawBody);
      if (parsed.success) body = parsed.data;
    } catch {
      // empty body is valid for join requests
    }

    const [request] = await db
      .insert(joinRequests)
      .values({
        flowId,
        requesterId: ctx.user!.sub,
        message: body.message,
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'room.join',
      resourceType: 'join_request',
      resourceId: request.id,
      metadata: { flowId },
      ...reqMeta,
    });

    return successResponse({ joinRequest: request }, 201);
  },
);

export const GET = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { flowId } = ctx.params!;

    const [flow] = await db
      .select({ id: flows.id, orgId: flows.orgId })
      .from(flows)
      .where(eq(flows.id, flowId))
      .limit(1);

    if (!flow) {
      throw new NotFoundError('Flow', flowId);
    }

    if (flow.orgId !== ctx.user!.orgId) {
      throw new ForbiddenError('Only the flow owner org can view join requests');
    }

    requirePermission(ctx.user!.role, 'flow.manage_templates');

    const requests = await db
      .select()
      .from(joinRequests)
      .where(eq(joinRequests.flowId, flowId));

    return successResponse({ joinRequests: requests });
  },
);
