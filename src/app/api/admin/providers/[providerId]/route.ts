import { NextRequest } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { providers, providerApplications, users, organizations } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { updateProviderSchema } from '@/lib/validators/admin';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { providerId } = ctx.params!;

    const [providerData] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, providerId))
      .limit(1);

    if (!providerData) {
      throw new NotFoundError('Provider', providerId);
    }

    const applications = await db
      .select({
        id: providerApplications.id,
        userId: providerApplications.userId,
        orgId: providerApplications.orgId,
        message: providerApplications.message,
        status: providerApplications.status,
        reviewedBy: providerApplications.reviewedBy,
        reviewedAt: providerApplications.reviewedAt,
        createdAt: providerApplications.createdAt,
        userDisplayName: users.displayName,
        userEmail: users.email,
        orgName: organizations.name,
      })
      .from(providerApplications)
      .leftJoin(users, eq(providerApplications.userId, users.id))
      .leftJoin(organizations, eq(providerApplications.orgId, organizations.id))
      .where(eq(providerApplications.providerId, providerId))
      .orderBy(desc(providerApplications.createdAt));

    return successResponse({ 
      provider: providerData,
      applications,
    });
  },
);

export const PATCH = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(updateProviderSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const { providerId } = ctx.params!;
    const body = ctx.body as {
      name?: string;
      category?: 'strategy' | 'development' | 'creative';
      description?: string;
      website?: string;
      contactEmail?: string;
      logoUrl?: string;
      status?: 'pending' | 'active' | 'inactive';
      metadata?: Record<string, unknown>;
    };

    const [existing] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, providerId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Provider', providerId);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.description !== undefined) updates.description = body.description;
    if (body.website !== undefined) updates.website = body.website;
    if (body.contactEmail !== undefined) updates.contactEmail = body.contactEmail;
    if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;
    if (body.status !== undefined) updates.status = body.status;
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    const [updated] = await db
      .update(providers)
      .set(updates)
      .where(eq(providers.id, providerId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    const action = body.status === 'active' ? 'provider.approve' : 
                  body.status === 'inactive' ? 'provider.reject' : 
                  'provider.approve';
    
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action,
      resourceType: 'provider',
      resourceId: providerId,
      metadata: { changes: updates },
      ...reqMeta,
    });

    return successResponse({ provider: updated });
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    const { providerId } = ctx.params!;

    const [existing] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, providerId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Provider', providerId);
    }

    await db
      .update(providers)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(providers.id, providerId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'provider.reject',
      resourceType: 'provider',
      resourceId: providerId,
      metadata: { deactivated: true, name: existing.name },
      ...reqMeta,
    });

    return successResponse({ success: true, deactivated: true });
  },
);