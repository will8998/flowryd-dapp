import { NextRequest } from 'next/server';
import { eq, and, isNull, inArray, ne, count } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants, messages, readReceipts } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { getIO } from '@/lib/socket-io';
import { z } from 'zod';

const bulkReadSchema = z.object({
  messageIds: z.array(z.string().uuid('Invalid message ID')).min(1, 'At least one message ID is required'),
});

export const POST = withMiddleware(
  requireAuth(),
  validateBody(bulkReadSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.send_message');

    const { dealId } = ctx.params!;
    const body = ctx.body as { messageIds: string[] };

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

    // Verify all messages exist, are not deleted, and belong to this deal
    const existingMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
      })
      .from(messages)
      .where(
        and(
          eq(messages.dealId, dealId),
          isNull(messages.deletedAt),
          inArray(messages.id, body.messageIds)
        )
      );

    // Filter out messages sent by the user themselves
    const messagesToMarkRead = existingMessages.filter(msg => msg.senderId !== ctx.user!.sub);

    if (messagesToMarkRead.length === 0) {
      return successResponse({ ok: true, count: 0 });
    }

    const readAt = new Date();

    // Bulk upsert read receipts
    const readReceiptValues = messagesToMarkRead.map(msg => ({
      messageId: msg.id,
      userId: ctx.user!.sub,
      readAt,
    }));

    await db
      .insert(readReceipts)
      .values(readReceiptValues)
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
      resourceId: dealId,
      metadata: { dealId, messageCount: messagesToMarkRead.length },
      ...reqMeta,
    });

    // Emit to Socket.io clients for each message
    const io = getIO();
    if (io) {
      messagesToMarkRead.forEach(msg => {
        io.to(`deal:${dealId}`).emit('message:read', {
          messageId: msg.id,
          userId: ctx.user!.sub,
          readAt: readAt.toISOString(),
        });
      });
    }

    return successResponse({ ok: true, count: messagesToMarkRead.length });
  },
);

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.send_message');

    const { dealId } = ctx.params!;

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
      throw new ForbiddenError('You must be a participant to view unread count');
    }

    // Count unread messages in this deal
    // - Messages that are not deleted
    // - Messages not sent by the user themselves
    // - Messages that don't have a read receipt for this user
    const [result] = await db
      .select({ count: count() })
      .from(messages)
      .leftJoin(
        readReceipts,
        and(
          eq(readReceipts.messageId, messages.id),
          eq(readReceipts.userId, ctx.user!.sub)
        )
      )
      .where(
        and(
          eq(messages.dealId, dealId),
          isNull(messages.deletedAt),
          ne(messages.senderId, ctx.user!.sub),
          isNull(readReceipts.id) // No read receipt exists
        )
      );

    return successResponse({ unreadCount: result.count });
  },
);