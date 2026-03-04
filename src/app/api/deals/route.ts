import { NextRequest } from 'next/server';
import { desc, eq, and, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { createDealSchema } from '@/lib/validators/deals';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const includeArchived = url.searchParams.get('includeArchived') === 'true';
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 50);

    const conditions = [eq(deals.orgId, ctx.user!.orgId)];
    
    // Exclude archived deals by default
    if (!includeArchived) {
      conditions.push(isNull(deals.archivedAt));
    }
    
    if (status) {
      conditions.push(eq(deals.status, status as 'draft' | 'open' | 'negotiating' | 'locked' | 'committed'));
    }

    const rows = await db
      .select()
      .from(deals)
      .where(and(...conditions))
      .orderBy(desc(deals.updatedAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return paginatedResponse(data, nextCursor, hasMore);
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(createDealSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.create');

    const body = ctx.body as {
      title: string;
      description?: string;
      flowId?: string;
      volume?: string;
      metadata?: Record<string, unknown>;
    };

    const [deal] = await db
      .insert(deals)
      .values({
        orgId: ctx.user!.orgId,
        title: body.title,
        description: body.description,
        flowId: body.flowId,
        volume: body.volume,
        metadata: body.metadata ?? null,
        createdBy: ctx.user!.sub,
      })
      .returning();

    await db.insert(dealParticipants).values({
      dealId: deal.id,
      userId: ctx.user!.sub,
      role: 'admin',
    });

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'deal.create',
      resourceType: 'deal',
      resourceId: deal.id,
      ...reqMeta,
    });

    return successResponse({ deal }, 201);
  },
);
