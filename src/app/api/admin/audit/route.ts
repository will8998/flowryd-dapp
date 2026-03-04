import { NextRequest, NextResponse } from 'next/server';
import { desc, eq, and, gte, lte, count } from 'drizzle-orm';
import { db } from '@/db';
import { auditLog, users } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('userId');
    const resourceType = url.searchParams.get('resourceType');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const cursor = url.searchParams.get('cursor');
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);
    const format = url.searchParams.get('format');

    const conditions = [eq(auditLog.orgId, ctx.user!.orgId)];

    if (action) {
      conditions.push(eq(auditLog.action, action as typeof auditLog.action.enumValues[number]));
    }
    if (userId) {
      conditions.push(eq(auditLog.userId, userId));
    }
    if (resourceType) {
      conditions.push(eq(auditLog.resourceType, resourceType));
    }
    if (from) {
      conditions.push(gte(auditLog.createdAt, new Date(from)));
    }
    if (to) {
      conditions.push(lte(auditLog.createdAt, new Date(to)));
    }
    const offset = Number(url.searchParams.get('offset') ?? 0);

    const [rows, totalCount] = await Promise.all([
      db
        .select({
          id: auditLog.id,
          userId: auditLog.userId,
          action: auditLog.action,
          resourceType: auditLog.resourceType,
          resourceId: auditLog.resourceId,
          metadata: auditLog.metadata,
          ipAddress: auditLog.ipAddress,
          createdAt: auditLog.createdAt,
          userDisplayName: users.displayName,
          userPartyId: users.partyId,
        })
        .from(auditLog)
        .leftJoin(users, eq(auditLog.userId, users.id))
        .where(and(...conditions))
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(auditLog)
        .where(and(...conditions))
        .then(result => result[0].count)
    ]);

    // Handle JSON export format
    if (format === 'json') {
      return NextResponse.json(rows, {
        headers: {
          'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    return successResponse({
      audit: rows,
      total: totalCount,
    });
  },
);
