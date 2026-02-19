import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { providers, providerApplications } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { providerApplicationSchema } from '@/lib/validators/providers';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ConflictError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const POST = withMiddleware(
  requireAuth(),
  validateBody(providerApplicationSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const providerId = ctx.params!.providerId as string;

    const body = ctx.body as {
      message?: string;
    };

    const [provider] = await db
      .select()
      .from(providers)
      .where(and(eq(providers.id, providerId), eq(providers.status, 'active')))
      .limit(1);

    if (!provider) {
      throw new NotFoundError('Provider', providerId);
    }

    const [existingApplication] = await db
      .select()
      .from(providerApplications)
      .where(and(
        eq(providerApplications.providerId, providerId),
        eq(providerApplications.userId, ctx.user!.sub)
      ))
      .limit(1);

    if (existingApplication) {
      throw new ConflictError('You have already applied to this provider');
    }
    const [application] = await db
      .insert(providerApplications)
      .values({
        providerId,
        orgId: ctx.user!.orgId,
        userId: ctx.user!.sub,
        message: body.message,
        status: 'pending',
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'provider.apply',
      resourceType: 'provider_application',
      resourceId: application.id,
      ...reqMeta,
    });

    return successResponse({ application }, 201);
  },
);