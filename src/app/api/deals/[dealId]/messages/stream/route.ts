import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { deals, activeSessions, users } from '@/db/schema';
import { verifyAccessToken } from '@/lib/auth/jwt';
import chatBus from '@/lib/chat-events';

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

  // Get user display name for presence
  const [userRow] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.id, user.sub))
    .limit(1);

  const displayName = userRow?.displayName || 'Unknown';

  const [session] = await db
    .insert(activeSessions)
    .values({ userId: user.sub, dealId })
    .returning();

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // --- Event bus listeners (instant delivery, no polling) ---

      const onMessage = (msg: unknown) => {
        sendEvent('message', msg);
      };

      const onTyping = (data: unknown) => {
        sendEvent('typing', data);
      };

      const onPresence = (data: unknown) => {
        sendEvent('presence', data);
      };

      chatBus.on(`deal:${dealId}:message`, onMessage);
      chatBus.on(`deal:${dealId}:typing`, onTyping);
      chatBus.on(`deal:${dealId}:presence`, onPresence);

      // Tell client we're connected
      sendEvent('connected', { sessionId: session.id, userId: user.sub });

      // Broadcast that this user came online
      chatBus.emit(`deal:${dealId}:presence`, {
        userId: user.sub,
        displayName,
        status: 'online',
      });

      // Heartbeat keeps the connection alive through proxies/load balancers
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          closed = true;
        }
      }, 15000);

      // Periodically update session last_seen
      const presenceInterval = setInterval(() => {
        if (closed) return;
        db.update(activeSessions)
          .set({ lastSeenAt: new Date() })
          .where(eq(activeSessions.id, session.id))
          .catch(() => {});
      }, 30000);

      // 10 min max — self-hosted, no serverless limit. Clients auto-reconnect.
      const timeout = setTimeout(() => cleanup(), 600000);

      const cleanup = () => {
        if (closed) return;
        closed = true;

        // Remove event listeners
        chatBus.off(`deal:${dealId}:message`, onMessage);
        chatBus.off(`deal:${dealId}:typing`, onTyping);
        chatBus.off(`deal:${dealId}:presence`, onPresence);

        // Broadcast offline
        chatBus.emit(`deal:${dealId}:presence`, {
          userId: user.sub,
          displayName,
          status: 'offline',
        });

        clearInterval(heartbeat);
        clearInterval(presenceInterval);
        clearTimeout(timeout);

        // Clean up session
        db.delete(activeSessions)
          .where(eq(activeSessions.id, session.id))
          .catch(() => {});

        try { controller.close(); } catch {}
      };

      req.signal.addEventListener('abort', cleanup);
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
