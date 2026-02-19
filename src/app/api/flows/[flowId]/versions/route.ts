import { NextRequest } from 'next/server';
import { eq, and, desc, max } from 'drizzle-orm';
import { db } from '@/db';
import { flows, flowVersions } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { saveVersionSchema } from '@/lib/validators/flows';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const GET = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { flowId } = ctx.params!;

    const [flow] = await db
      .select({ id: flows.id })
      .from(flows)
      .where(and(eq(flows.id, flowId), eq(flows.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!flow) {
      throw new NotFoundError('Flow', flowId);
    }

    const versions = await db
      .select()
      .from(flowVersions)
      .where(eq(flowVersions.flowId, flowId))
      .orderBy(desc(flowVersions.version));

    return successResponse({ versions });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(saveVersionSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'flow.edit');

    const { flowId } = ctx.params!;
    const body = ctx.body as {
      nodes: unknown[];
      edges: unknown[];
      viewport?: { x: number; y: number; zoom: number };
      snapshotName?: string;
    };

    const [flow] = await db
      .select({ id: flows.id })
      .from(flows)
      .where(and(eq(flows.id, flowId), eq(flows.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!flow) {
      throw new NotFoundError('Flow', flowId);
    }

    const [maxVersion] = await db
      .select({ value: max(flowVersions.version) })
      .from(flowVersions)
      .where(eq(flowVersions.flowId, flowId));

    const nextVersion = (maxVersion.value ?? 0) + 1;

    const [version] = await db
      .insert(flowVersions)
      .values({
        flowId,
        version: nextVersion,
        nodes: body.nodes,
        edges: body.edges,
        viewport: body.viewport ?? null,
        snapshotName: body.snapshotName,
        createdBy: ctx.user!.sub,
      })
      .returning();

    await db
      .update(flows)
      .set({ updatedBy: ctx.user!.sub, updatedAt: new Date() })
      .where(eq(flows.id, flowId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'flow.version',
      resourceType: 'flow_version',
      resourceId: version.id,
      metadata: { flowId, version: nextVersion },
      ...reqMeta,
    });

    return successResponse({ version }, 201);
  },
);
