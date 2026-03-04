import { NextRequest } from 'next/server';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants, messages, users } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { editMessageSchema } from '@/lib/validators/messages';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { getIO } from '@/lib/socket-io';

export const PATCH = withMiddleware(
  requireAuth(),
  validateBody(editMessageSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.send_message');

    const { dealId, messageId } = ctx.params!;
    const body = ctx.body as { content: string };

    // Verify deal exists and user has access
    const [deal] = await db
      .select({ id: deals.id })
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    // Verify message exists and is not deleted
    const [message] = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        content: messages.content,
        contentType: messages.contentType,
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

    // Verify user owns the message
    if (message.senderId !== ctx.user!.sub) {
      throw new ForbiddenError('You can only edit your own messages');
    }

    // Only allow editing text messages
    if (message.contentType !== 'text') {
      throw new ForbiddenError('Only text messages can be edited');
    }

    // Update the message
    const [updatedMessage] = await db
      .update(messages)
      .set({
        content: body.content,
        isEdited: true,
        editedAt: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    // Fetch with sender info for consistent response shape
    const [messageWithSender] = await db
      .select({
        id: messages.id,
        dealId: messages.dealId,
        threadId: messages.threadId,
        senderId: messages.senderId,
        content: messages.content,
        contentType: messages.contentType,
        fileUrl: messages.fileUrl,
        fileName: messages.fileName,
        fileSize: messages.fileSize,
        isEdited: messages.isEdited,
        editedAt: messages.editedAt,
        createdAt: messages.createdAt,
        senderDisplayName: users.displayName,
        senderPartyId: users.partyId,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.id, messageId))
      .limit(1);

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'message.send',
      resourceType: 'message',
      resourceId: messageId,
      metadata: { dealId, newContent: body.content },
      ...reqMeta,
    });

    // Emit to Socket.io clients
    const io = getIO();
    if (io) {
      io.to(`deal:${dealId}`).emit('message:edit', {
        messageId,
        content: body.content,
        isEdited: true,
        editedAt: updatedMessage.editedAt,
      });
    }

    return successResponse({ message: messageWithSender });
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
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

    // Verify message exists and is not already deleted
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

    // Verify user owns the message OR user has admin role
    const isAdmin = ctx.user!.role === 'admin';
    if (message.senderId !== ctx.user!.sub && !isAdmin) {
      throw new ForbiddenError('You can only delete your own messages');
    }

    // Soft delete the message
    await db
      .update(messages)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'message.send',
      resourceType: 'message',
      resourceId: messageId,
      metadata: { dealId, isAdminDelete: isAdmin },
      ...reqMeta,
    });

    // Emit to Socket.io clients
    const io = getIO();
    if (io) {
      io.to(`deal:${dealId}`).emit('message:delete', {
        messageId,
      });
    }

    return successResponse({ ok: true });
  },
);