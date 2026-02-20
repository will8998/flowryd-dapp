import { NextRequest } from 'next/server';
import { eq, desc, count } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (_req: NextRequest, ctx: ApiContext) => {
    const [orgUsers, totalCount] = await Promise.all([
      db
        .select({
          id: users.id,
          partyId: users.partyId,
          displayName: users.displayName,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.orgId, ctx.user!.orgId))
        .orderBy(desc(users.createdAt)),

      db
        .select({ count: count() })
        .from(users)
        .where(eq(users.orgId, ctx.user!.orgId))
        .then(result => result[0].count)
    ]);

    return successResponse({ users: orgUsers, total: totalCount });
  },
);
