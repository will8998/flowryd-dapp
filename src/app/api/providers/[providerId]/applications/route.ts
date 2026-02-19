import { NextRequest } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { providerApplications } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { reviewApplicationSchema } from '@/lib/validators/providers';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'admin.manage_users');

    const providerId = ctx.params!.providerId as string;

    const applications = await db
      .select()
      .from(providerApplications)
      .where(eq(providerApplications.providerId, providerId))
      .orderBy(desc(providerApplications.createdAt));

    return successResponse({ applications });
  },
);

export const PATCH = withMiddleware(
  requireAuth(),
  validateBody(reviewApplicationSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'admin.manage_users');

    const providerId = ctx.params!.providerId as string;
    const url = new URL(req.url);
    const applicationId = url.searchParams.get('applicationId');

    if (!applicationId) {
      throw new NotFoundError('Application ID is required');
    }

    const body = ctx.body as {
      status: 'approved' | 'rejected';
    };

    const [existingApplication] = await db
      .select()
      .from(providerApplications)
      .where(and(
        eq(providerApplications.id, applicationId),
        eq(providerApplications.providerId, providerId)
      ))
      .limit(1);

    if (!existingApplication) {
      throw new NotFoundError('Application', applicationId);
    }

    const [application] = await db
      .update(providerApplications)
      .set({
        status: body.status,
        reviewedBy: ctx.user!.sub,
        reviewedAt: new Date(),
      })
      .where(eq(providerApplications.id, applicationId))
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: body.status === 'approved' ? 'provider.approve' : 'provider.reject',
      resourceType: 'provider_application',
      resourceId: applicationId,
      ...reqMeta,
    });

    return successResponse({ application });
  },
);