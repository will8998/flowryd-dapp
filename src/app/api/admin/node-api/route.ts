import { NextRequest } from 'next/server';
import { eq, count } from 'drizzle-orm';
import { db } from '@/db';
import { nodeApiConfigs } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (_req: NextRequest, ctx: ApiContext) => {
    const [configs, totalCount] = await Promise.all([
      db
        .select({
          id: nodeApiConfigs.id,
          endpointUrl: nodeApiConfigs.endpointUrl,
          label: nodeApiConfigs.label,
          isActive: nodeApiConfigs.isActive,
          lastHealthAt: nodeApiConfigs.lastHealthAt,
          createdAt: nodeApiConfigs.createdAt,
        })
        .from(nodeApiConfigs)
        .where(eq(nodeApiConfigs.orgId, ctx.user!.orgId)),

      db
        .select({ count: count() })
        .from(nodeApiConfigs)
        .where(eq(nodeApiConfigs.orgId, ctx.user!.orgId))
        .then(result => result[0].count)
    ]);

    return successResponse({ configs, total: totalCount });
  },
);
