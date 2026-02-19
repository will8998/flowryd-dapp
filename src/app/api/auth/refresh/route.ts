import { NextRequest, NextResponse } from 'next/server';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { users, refreshTokens } from '@/db/schema';
import { verifyRefreshToken, signAccessToken, signRefreshToken, hashToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/session';
import { REFRESH_TOKEN_COOKIE } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No refresh token' } },
        { status: 401 },
      );
    }

    let payload: { sub: string; tokenFamily: string };
    try {
      payload = await verifyRefreshToken(token);
    } catch {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } },
        { status: 401 },
      );
    }

    const tokenHash = await hashToken(token);

    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          eq(refreshTokens.userId, payload.sub),
          isNull(refreshTokens.revokedAt),
        ),
      )
      .limit(1);

    if (!storedToken) {
      // Token reuse detected — revoke entire family
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.tokenFamily, payload.tokenFamily));

      return NextResponse.json(
        { error: { code: 'TOKEN_REUSE', message: 'Token reuse detected, all sessions revoked' } },
        { status: 401 },
      );
    }

    if (storedToken.expiresAt < new Date()) {
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.id, storedToken.id));

      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Refresh token expired' } },
        { status: 401 },
      );
    }

    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, storedToken.id));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'User not found or deactivated' } },
        { status: 401 },
      );
    }

    const newAccessToken = await signAccessToken({
      sub: user.id,
      partyId: user.partyId,
      role: user.role,
      orgId: user.orgId,
    });
    const newRefreshToken = await signRefreshToken(user.id, payload.tokenFamily);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: await hashToken(newRefreshToken),
      tokenFamily: payload.tokenFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Token refresh failed' } },
      { status: 500 },
    );
  }
}
