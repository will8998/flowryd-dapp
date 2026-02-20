import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { flows } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { updateFlowSchema } from '@/lib/validators/admin';

export const PATCH = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(updateFlowSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const { flowId } = ctx.params!;
    const body = ctx.body as {
      title?: string;
      description?: string;
      status?: 'draft' | 'published' | 'archived';
      isTemplate?: boolean;
      isPublic?: boolean;
      isFeatured?: boolean;
      featuredHeadline?: string;
      featuredSource?: string;
      workflowType?: string;
    };

    const [existing] = await db
      .select()
      .from(flows)
      .where(eq(flows.id, flowId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Flow', flowId);
    }

    const updates: Record<string, unknown> = { 
      updatedAt: new Date(),
      updatedBy: ctx.user!.sub,
    };
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.isTemplate !== undefined) updates.isTemplate = body.isTemplate;
    if (body.isPublic !== undefined) updates.isPublic = body.isPublic;
    if (body.isFeatured !== undefined) updates.isFeatured = body.isFeatured;
    if (body.featuredHeadline !== undefined) updates.featuredHeadline = body.featuredHeadline;
    if (body.featuredSource !== undefined) updates.featuredSource = body.featuredSource;
    if (body.workflowType !== undefined) updates.workflowType = body.workflowType;

    const [updated] = await db
      .update(flows)
      .set(updates)
      .where(eq(flows.id, flowId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    const action = body.status === 'published' ? 'flow.publish' : 'flow.update';
    
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action,
      resourceType: 'flow',
      resourceId: flowId,
      metadata: { 
        changes: updates,
        previousStatus: existing.status,
        adminUpdate: true,
      },
      ...reqMeta,
    });

    return successResponse({ flow: updated });
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    const { flowId } = ctx.params!;

    const [existing] = await db
      .select()
      .from(flows)
      .where(eq(flows.id, flowId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Flow', flowId);
    }

    await db.delete(flows).where(eq(flows.id, flowId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'flow.delete',
      resourceType: 'flow',
      resourceId: flowId,
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