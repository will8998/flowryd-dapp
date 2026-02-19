import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { flows } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { updateFlowFeaturedSchema } from '@/lib/validators/flows';
import { successResponse } from '@/lib/api/response';
import { requirePermission } from '@/lib/auth/rbac';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const PATCH = withMiddleware(
  requireAuth(),
  validateBody(updateFlowFeaturedSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'flow.manage_templates');

    const flowId = ctx.params!.flowId;
    const body = ctx.body as { isFeatured: boolean; featuredHeadline?: string; featuredSource?: string };

    const [existingFlow] = await db
      .select()
      .from(flows)
      .where(
        and(
          eq(flows.id, flowId),
          eq(flows.orgId, ctx.user!.orgId)
        )
      )
      .limit(1);

    if (!existingFlow) {
      throw new NotFoundError('Flow', flowId);
    }

    const [updatedFlow] = await db
      .update(flows)
      .set({
        isFeatured: body.isFeatured,
        featuredHeadline: body.featuredHeadline,
        featuredSource: body.featuredSource,
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

    return successResponse({ flow: updatedFlow });
  },
);