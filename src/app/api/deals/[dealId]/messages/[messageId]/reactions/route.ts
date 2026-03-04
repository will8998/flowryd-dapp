import { NextRequest } from 'next/server';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants, messages, messageReactions, users } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { getIO } from '@/lib/socket-io';
import { z } from 'zod';

const reactionSchema = z.object({
  emoji: z.enum(['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏']),
});

export const POST = withMiddleware(
  requireAuth(),
  validateBody(reactionSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.send_message');

    const { dealId, messageId } = ctx.params!;
    const body = ctx.body as { emoji: string };

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
      throw new ForbiddenError('You must be a participant to react to messages');
    }

    // Verify message exists and is not deleted
    const [message] = await db
      .select({
        id: messages.id,
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

    // Check if reaction already exists
    const [existingReaction] = await db
      .select({ id: messageReactions.id })
      .from(messageReactions)
      .where(
        and(
          eq(messageReactions.messageId, messageId),
          eq(messageReactions.userId, ctx.user!.sub),
          eq(messageReactions.emoji, body.emoji),
        ),
      )
      .limit(1);

    let action: 'add' | 'remove';

    if (existingReaction) {
      // Remove reaction (un-react)
      await db
        .delete(messageReactions)
        .where(eq(messageReactions.id, existingReaction.id));
      action = 'remove';
    } else {
      // Add reaction
      await db
        .insert(messageReactions)
        .values({
          messageId,
          userId: ctx.user!.sub,
          emoji: body.emoji,
        });
      action = 'add';
    }

    // Fetch all reactions for this message grouped by emoji
    const reactionRows = await db
      .select({
        emoji: messageReactions.emoji,
        userId: messageReactions.userId,
        displayName: users.displayName,
      })
      .from(messageReactions)
      .leftJoin(users, eq(messageReactions.userId, users.id))
      .where(eq(messageReactions.messageId, messageId));

    // Group reactions by emoji
    const groupedReactions = reactionRows.reduce((acc, row) => {
      const existing = acc.find(r => r.emoji === row.emoji);
      if (existing) {
        existing.count++;
        existing.users.push(row.userId);
      } else {
        acc.push({
          emoji: row.emoji,
          count: 1,
          users: [row.userId],
        });
      }
      return acc;
    }, [] as { emoji: string; count: number; users: string[] }[]);

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'message.send',
      resourceType: 'message',
      resourceId: messageId,
      metadata: { dealId, emoji: body.emoji },
      ...reqMeta,
    });

    // Emit to Socket.io clients
    const io = getIO();
    if (io) {
      io.to(`deal:${dealId}`).emit('message:react', {
        messageId,
        reactions: groupedReactions,
        userId: ctx.user!.sub,
        emoji: body.emoji,
        action,
      });
    }

    return successResponse({ reactions: groupedReactions });
  },
);