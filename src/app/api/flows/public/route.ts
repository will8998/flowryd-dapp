import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { flows, users } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import { paginatedResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  async () => {
    const publicFlows = await db
      .select({
        id: flows.id,
        title: flows.title,
        description: flows.description,
        workflowType: flows.workflowType,
        orgId: flows.orgId,
        createdAt: flows.createdAt,
        creatorDisplayName: users.displayName,
      })
      .from(flows)
      .leftJoin(users, eq(flows.createdBy, users.id))
      .where(and(eq(flows.isPublic, true), eq(flows.status, 'published')))
      .orderBy(desc(flows.createdAt))
      .limit(50);

    return paginatedResponse(publicFlows, null, false);
  },
);
