import { NextRequest } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/db';
import { providers } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { createProviderSchema } from '@/lib/validators/providers';
import { successResponse } from '@/lib/api/response';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, _ctx: ApiContext) => {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');

    const conditions = [];
    if (category) {
      conditions.push(eq(providers.category, category as 'strategy' | 'development' | 'creative'));
    }

    const rows = await db
      .select()
      .from(providers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(providers.name));

    return successResponse({ providers: rows });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(createProviderSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'admin.manage_users');

    const body = ctx.body as {
      name: string;
      category: 'strategy' | 'development' | 'creative';
      description?: string;
      website?: string;
      contactEmail?: string;
    };

    const [provider] = await db
      .insert(providers)
      .values({
        name: body.name,
        category: body.category,
        description: body.description,
        website: body.website,
        contactEmail: body.contactEmail,
        status: 'active',
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'provider.approve',
      resourceType: 'provider',
      resourceId: provider.id,
      ...reqMeta,
    });

    return successResponse({ provider }, 201);
  },
);