import { NextRequest } from 'next/server';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants, messages, readReceipts } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { getIO } from '@/lib/socket-io';

export const POST = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.send_message');

    const { dealId, messageId } = ctx.params!;

    // Verify deal exists and user has access
    const [deal] = await db
      .select({ id: deals.id })
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    // Verify user is a participant
    const [participant] = await db
      .select({ id: dealParticipants.id })
      .from(dealParticipants)
      .where(
        and(
          eq(dealParticipants.dealId, dealId),
          eq(dealParticipants.userId, ctx.user!.sub),
        ),
      )
      .limit(1);

    if (!participant) {
      throw new ForbiddenError('You must be a participant to mark messages as read');
    }

    // Verify message exists and is not deleted
    const [message] = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        deletedAt: messages.deletedAt,
      })
      .from(messages)
      .where(and(eq(messages.id, messageId), eq(messages.dealId, dealId)))
      .limit(1);

    if (!message) {
      throw new NotFoundError('Message', messageId);
    }

    if (message.deletedAt) {
      throw new NotFoundError('Message', messageId);
    }

    // Don't mark own messages as read
    if (message.senderId === ctx.user!.sub) {
      return successResponse({ ok: true });
    }

    const readAt = new Date();

    // Upsert read receipt
    await db
      .insert(readReceipts)
      .values({
        messageId,
        userId: ctx.user!.sub,
        readAt,
      })
      .onConflictDoUpdate({
        target: [readReceipts.messageId, readReceipts.userId],
        set: {
          readAt,
        },
      });

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'message.send',
      resourceType: 'message',
      resourceId: messageId,
      metadata: { dealId },
      ...reqMeta,
    });

    // Emit to Socket.io clients
    const io = getIO();
    if (io) {
      io.to(`deal:${dealId}`).emit('message:read', {
        messageId,
        userId: ctx.user!.sub,
        readAt: readAt.toISOString(),
      });
    }

    return successResponse({ ok: true });
  },
);