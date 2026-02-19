import { NextRequest } from 'next/server';
import { desc, eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { flows, flowVersions } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { createFlowSchema } from '@/lib/validators/flows';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 50);
    const status = url.searchParams.get('status');

    const conditions = [eq(flows.orgId, ctx.user!.orgId)];
    if (status) {
      conditions.push(eq(flows.status, status as 'draft' | 'published' | 'archived'));
    }

    const rows = await db
      .select()
      .from(flows)
      .where(and(...conditions))
      .orderBy(desc(flows.updatedAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return paginatedResponse(data, nextCursor, hasMore);
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(createFlowSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'flow.create');

    const body = ctx.body as { title: string; description?: string; workflowType?: string };

    const [flow] = await db
      .insert(flows)
      .values({
        orgId: ctx.user!.orgId,
        title: body.title,
        description: body.description,
        workflowType: body.workflowType,
        createdBy: ctx.user!.sub,
        updatedBy: ctx.user!.sub,
      })
      .returning();

    await db.insert(flowVersions).values({
      flowId: flow.id,
      version: 1,
      nodes: [],
      edges: [],
      createdBy: ctx.user!.sub,
    });

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'flow.create',
      resourceType: 'flow',
      resourceId: flow.id,
      ...reqMeta,
    });

    return successResponse({ flow }, 201);
  },
);
