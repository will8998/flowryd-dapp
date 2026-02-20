import { NextRequest } from 'next/server';
import { eq, and, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { organizations, users, flows, deals } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { updateOrganizationSchema } from '@/lib/validators/admin';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { orgId } = ctx.params!;

    const [orgData] = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        domain: organizations.domain,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        userCount: count(users.id),
        flowCount: count(flows.id),
        dealCount: count(deals.id),
      })
      .from(organizations)
      .leftJoin(users, eq(users.orgId, organizations.id))
      .leftJoin(flows, eq(flows.orgId, organizations.id))
      .leftJoin(deals, eq(deals.orgId, organizations.id))
      .where(eq(organizations.id, orgId))
      .groupBy(organizations.id)
      .limit(1);

    if (!orgData) {
      throw new NotFoundError('Organization', orgId);
    }

    return successResponse({ organization: orgData });
  },
);

export const PATCH = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(updateOrganizationSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const { orgId } = ctx.params!;
    const body = ctx.body as { name?: string; domain?: string };

    const [existing] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Organization', orgId);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.domain !== undefined) updates.domain = body.domain;

    const [updated] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, orgId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'user.register',
      resourceType: 'organization',
      resourceId: orgId,
      metadata: { changes: updates },
      ...reqMeta,
    });

    return successResponse({ organization: updated });
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    const { orgId } = ctx.params!;

    const [existing] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Organization', orgId);
    }

    const [activeFlowsCount, activeDealsCount] = await Promise.all([
      db
        .select({ count: count() })
        .from(flows)
        .where(and(eq(flows.orgId, orgId), sql`${flows.status} != 'archived'`))
        .then(result => result[0].count),
      
      db
        .select({ count: count() })
        .from(deals)
        .where(and(eq(deals.orgId, orgId), sql`${deals.status} != 'draft'`))
        .then(result => result[0].count)
    ]);

    if (activeFlowsCount > 0 || activeDealsCount > 0) {
      return successResponse(
        { 
          error: 'Cannot delete organization with active flows or deals',
          activeFlows: activeFlowsCount,
          activeDeals: activeDealsCount,
        },
        400
      );
    }

    await db.delete(organizations).where(eq(organizations.id, orgId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'user.register',
      resourceType: 'organization',
      resourceId: orgId,
      metadata: { deleted: true, name: existing.name },
      ...reqMeta,
    });

    return successResponse({ success: true });
  },
);