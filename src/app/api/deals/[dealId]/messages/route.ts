import { NextRequest } from 'next/server';
import { eq, and, desc, lt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants, messages, users } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { sendMessageSchema } from '@/lib/validators/messages';
import { successResponse, paginatedResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { getIO } from '@/lib/socket-io';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const { dealId } = ctx.params!;
    const url = new URL(req.url);
    const cursor = url.searchParams.get('cursor');
    const threadId = url.searchParams.get('threadId');
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 100);

    const [deal] = await db
      .select({ id: deals.id })
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    const conditions = [eq(messages.dealId, dealId), isNull(messages.deletedAt)];

    if (threadId) {
      conditions.push(eq(messages.threadId, threadId));
    }
    if (cursor) {
      conditions.push(lt(messages.id, cursor));
    }

    const rows = await db
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
        createdAt: messages.createdAt,
        senderDisplayName: users.displayName,
        senderPartyId: users.partyId,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(and(...conditions))
      .orderBy(desc(messages.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return paginatedResponse(data, nextCursor, hasMore);
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(sendMessageSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.send_message');

    const { dealId } = ctx.params!;
    const body = ctx.body as { content: string; threadId?: string; contentType: string; fileUrl?: string; fileName?: string; fileSize?: number };

    const [deal] = await db
      .select({ id: deals.id })
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

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
      throw new ForbiddenError('You must be a participant to send messages');
    }

    const [insertedMessage] = await db
      .insert(messages)
      .values({
        dealId,
        threadId: body.threadId,
        senderId: ctx.user!.sub,
        content: body.content || (body.contentType === 'file' ? 'File shared' : ''),
        contentType: body.contentType,
        fileUrl: body.fileUrl,
        fileName: body.fileName,
        fileSize: body.fileSize,
      })
      .returning();

    // Fetch with sender info for consistent response shape
    const [message] = await db
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
        createdAt: messages.createdAt,
        senderDisplayName: users.displayName,
        senderPartyId: users.partyId,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.id, insertedMessage.id))
      .limit(1);

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'message.send',
      resourceType: 'message',
      resourceId: message.id,
      metadata: { dealId },
      ...reqMeta,
    });

    // Emit to Socket.io clients
    const io = getIO();
    if (io) {
      io.to(`deal:${dealId}`).emit('message', message);
    }

    return successResponse({ message }, 201);
  },
);
