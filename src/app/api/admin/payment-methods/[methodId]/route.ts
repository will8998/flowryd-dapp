import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { paymentMethods } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export const DELETE = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    const { methodId } = ctx.params!;

    const [existing] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, methodId))
      .limit(1);

    if (!existing) {
      throw new NotFoundError('Payment method', methodId);
    }

    await db.delete(paymentMethods).where(eq(paymentMethods.id, methodId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.cancel',
      resourceType: 'payment_method',
      resourceId: methodId,
      metadata: { deleted: true, type: existing.type, orgId: existing.orgId },
      ...reqMeta,
    });

    return successResponse({ success: true });
  },
);