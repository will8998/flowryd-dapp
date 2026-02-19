import { NextRequest } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { flows } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { paginatedResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, ctx: ApiContext) => {
    const templates = await db
      .select()
      .from(flows)
      .where(
        and(
          eq(flows.isTemplate, true),
          eq(flows.status, 'published'),
          eq(flows.orgId, ctx.user!.orgId),
        ),
      )
      .orderBy(desc(flows.updatedAt));

    return paginatedResponse(templates, null, false);
  },
);
