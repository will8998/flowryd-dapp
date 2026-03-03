import { NextRequest } from 'next/server';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/db';
import { deals, messages, users, activeSessions } from '@/db/schema';
import { verifyAccessToken } from '@/lib/auth/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
) {
  const { dealId } = await params;

  const token = req.cookies.get('flowryd-access-token')?.value;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let user: { sub: string; orgId: string };
  try {
    user = await verifyAccessToken(token);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  const [deal] = await db
    .select({ id: deals.id })
    .from(deals)
    .where(and(eq(deals.id, dealId), eq(deals.orgId, user.orgId)))
    .limit(1);

  if (!deal) {
    return new Response(JSON.stringify({ error: 'Deal not found' }), { status: 404 });
  }

  const [session] = await db
    .insert(activeSessions)
    .values({ userId: user.sub, dealId })
    .returning();

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      sendEvent('connected', { sessionId: session.id });

      // Track last seen timestamp instead of UUID for reliable ordering
      let lastPollTime = new Date();

      const poll = async () => {
        if (closed) return;

        try {
          const newMessages = await db
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
              createdAt: messages.createdAt,
              senderDisplayName: users.displayName,
              senderPartyId: users.partyId,
            })
            .from(messages)
            .leftJoin(users, eq(messages.senderId, users.id))
            .where(and(
              eq(messages.dealId, dealId),
              gt(messages.createdAt, lastPollTime)
            ))
            .limit(50);

          if (newMessages.length > 0) {
            for (const msg of newMessages) {
              sendEvent('message', msg);
            }
            // Update lastPollTime to the latest message's createdAt
            const latestTime = newMessages.reduce((max, msg) => {
              const t = new Date(msg.createdAt);
              return t > max ? t : max;
            }, lastPollTime);
            lastPollTime = latestTime;
          }

          await db
            .update(activeSessions)
            .set({ lastSeenAt: new Date() })
            .where(eq(activeSessions.id, session.id));
        } catch {
          // DB error during poll — continue
        }
      };

      await poll();

      const interval = setInterval(poll, 2000);

      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          closed = true;
        }
      }, 15000);

      // 5 min max — self-hosted, no serverless limit. Clients auto-reconnect.
      const timeout = setTimeout(() => {
        closed = true;
        clearInterval(interval);
        clearInterval(heartbeat);
        db.delete(activeSessions)
          .where(eq(activeSessions.id, session.id))
          .catch(() => {});
        try { controller.close(); } catch {}
      }, 300000);

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(interval);
        clearInterval(heartbeat);
        clearTimeout(timeout);
        db.delete(activeSessions)
          .where(eq(activeSessions.id, session.id))
          .catch(() => {});
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
