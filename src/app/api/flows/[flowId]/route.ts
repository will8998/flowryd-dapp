import { NextRequest } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { flows, flowVersions, flowParticipants } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { updateFlowSchema } from '@/lib/validators/flows';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const GET = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { flowId } = ctx.params!;

    const [flow] = await db
      .select()
      .from(flows)
      .where(and(eq(flows.id, flowId), eq(flows.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!flow) {
      throw new NotFoundError('Flow', flowId);
    }

    const [latestVersion] = await db
      .select()
      .from(flowVersions)
      .where(eq(flowVersions.flowId, flowId))
      .orderBy(desc(flowVersions.version))
      .limit(1);

    const participants = await db
      .select()
      .from(flowParticipants)
      .where(eq(flowParticipants.flowId, flowId));

    return successResponse({
      flow,
      version: latestVersion ?? null,
      participants,
    });
  },
);

export const PATCH = withMiddleware(
  requireAuth(),
  validateBody(updateFlowSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'flow.edit');

    const { flowId } = ctx.params!;
    const body = ctx.body as Record<string, unknown>;

    const [existing] = await db
      .select({ id: flows.id })
      .from(flows)
      .where(and(eq(flows.id, flowId), eq(flows.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Flow', flowId);
    }

    const [updated] = await db
      .update(flows)
      .set({
        ...body,
        updatedBy: ctx.user!.sub,
        updatedAt: new Date(),
      })
      .where(eq(flows.id, flowId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'flow.update',
      resourceType: 'flow',
      resourceId: flowId,
      ...reqMeta,
    });

    return successResponse({ flow: updated });
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'flow.delete');

    const { flowId } = ctx.params!;

    const [existing] = await db
      .select({ id: flows.id })
      .from(flows)
      .where(and(eq(flows.id, flowId), eq(flows.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Flow', flowId);
    }

    await db.delete(flowParticipants).where(eq(flowParticipants.flowId, flowId));
    await db.delete(flowVersions).where(eq(flowVersions.flowId, flowId));
    await db.delete(flows).where(eq(flows.id, flowId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'flow.delete',
      resourceType: 'flow',
      resourceId: flowId,
      ...reqMeta,
    });

    return successResponse({ deleted: true });
  },
);
