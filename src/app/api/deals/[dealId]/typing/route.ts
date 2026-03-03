import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealParticipants, users } from '@/db/schema';
import { verifyAccessToken } from '@/lib/auth/jwt';
import chatBus from '@/lib/chat-events';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> },
) {
  const { dealId } = await params;

  const token = req.cookies.get('flowryd-access-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let user: { sub: string; orgId: string };
  try {
    user = await verifyAccessToken(token);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Verify deal exists and user is participant
  const [deal] = await db
    .select({ id: deals.id })
    .from(deals)
    .where(and(eq(deals.id, dealId), eq(deals.orgId, user.orgId)))
    .limit(1);

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
  }

  const [participant] = await db
    .select({ id: dealParticipants.id })
    .from(dealParticipants)
    .where(and(
      eq(dealParticipants.dealId, dealId),
      eq(dealParticipants.userId, user.sub),
    ))
    .limit(1);

  if (!participant) {
    return NextResponse.json({ error: 'Not a participant' }, { status: 403 });
  }

  // Get display name
  const [userRow] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(eq(users.id, user.sub))
    .limit(1);

  const body = await req.json().catch(() => ({}));

  chatBus.emit(`deal:${dealId}:typing`, {
    userId: user.sub,
    displayName: userRow?.displayName || 'Unknown',
    isTyping: body.isTyping !== false,
  });

  return NextResponse.json({ ok: true });
}
