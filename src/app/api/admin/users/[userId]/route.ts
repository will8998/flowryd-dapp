import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  isActive: z.boolean().optional(),
});

export const PATCH = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(updateUserSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const { userId } = ctx.params!;
    const body = ctx.body as { role?: 'admin' | 'editor' | 'viewer'; isActive?: boolean };

    if (userId === ctx.user!.sub) {
      throw new ForbiddenError('Cannot modify your own account');
    }

    const [target] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!target) {
      throw new NotFoundError('User', userId);
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.role !== undefined) updates.role = body.role;
    if (body.isActive !== undefined) updates.isActive = body.isActive;

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        partyId: users.partyId,
        displayName: users.displayName,
        role: users.role,
        isActive: users.isActive,
      });

    const reqMeta = extractRequestMeta(req);
    if (body.role !== undefined) {
      logAudit({
        userId: ctx.user!.sub,
        orgId: ctx.user!.orgId,
        action: 'user.role_change',
        resourceType: 'user',
        resourceId: userId,
        metadata: { from: target.role, to: body.role },
        ...reqMeta,
      });
    }

    return successResponse({ user: updated });
  },
);
