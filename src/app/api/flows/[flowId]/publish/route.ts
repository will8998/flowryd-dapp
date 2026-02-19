import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { flows } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { publishFlowSchema } from '@/lib/validators/flows';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const POST = withMiddleware(
  requireAuth(),
  validateBody(publishFlowSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'flow.publish');

    const { flowId } = ctx.params!;
    const body = ctx.body as { isTemplate?: boolean };

    const [flow] = await db
      .select()
      .from(flows)
      .where(and(eq(flows.id, flowId), eq(flows.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!flow) {
      throw new NotFoundError('Flow', flowId);
    }

    if (body.isTemplate) {
      requirePermission(ctx.user!.role, 'flow.manage_templates');
    }

    const [updated] = await db
      .update(flows)
      .set({
        status: 'published',
        isTemplate: body.isTemplate ?? false,
        updatedBy: ctx.user!.sub,
        updatedAt: new Date(),
      })
      .where(eq(flows.id, flowId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'flow.publish',
      resourceType: 'flow',
      resourceId: flowId,
      metadata: { isTemplate: body.isTemplate ?? false },
      ...reqMeta,
    });

    return successResponse({ flow: updated });
  },
);
