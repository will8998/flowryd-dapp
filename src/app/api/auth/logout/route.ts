import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { refreshTokens } from '@/db/schema';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { clearAuthCookies, ACCESS_TOKEN_COOKIE } from '@/lib/auth/session';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (token) {
      try {
        const payload = await verifyAccessToken(token);
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokens.userId, payload.sub));

        const reqMeta = extractRequestMeta(req);
        logAudit({
          userId: payload.sub,
          orgId: payload.orgId,
          action: 'user.logout',
          resourceType: 'user',
          resourceId: payload.sub,
          ...reqMeta,
        });
      } catch {
        // Token may be expired — still clear cookies
      }
    }

    await clearAuthCookies();

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Logout error:', error);
    await clearAuthCookies();
    return NextResponse.json({ data: { success: true } });
  }
}
