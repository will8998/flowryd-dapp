import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, refreshTokens } from '@/db/schema';
import { loginSchema } from '@/lib/validators/auth';
import { validatePartyId } from '@/lib/auth/validate-party-id';
import { signAccessToken, signRefreshToken, hashToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/session';
import { ApiError, UnauthorizedError, ValidationError } from '@/lib/api/errors';
import { errorResponse, successResponse } from '@/lib/api/response';
import { logAudit, extractRequestMeta } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse(new ValidationError({ message: 'Invalid JSON body' }));
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(new ValidationError(parsed.error.issues));
    }

    const { partyId } = parsed.data;

    const validation = validatePartyId(partyId);
    if (!validation.valid) {
      return errorResponse(new ValidationError({ partyId: validation.error }));
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.partyId, partyId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'No account found with this Party-ID',
            redirect: '/register',
          },
        },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return errorResponse(new UnauthorizedError('Account has been deactivated'));
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const tokenFamily = crypto.randomUUID();
    const accessToken = await signAccessToken({
      sub: user.id,
      partyId: user.partyId,
      role: user.role,
      orgId: user.orgId,
    });
    const refreshToken = await signRefreshToken(user.id, tokenFamily);

    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: await hashToken(refreshToken),
      tokenFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await setAuthCookies(accessToken, refreshToken);

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: user.id,
      orgId: user.orgId,
      action: 'user.login',
      resourceType: 'user',
      resourceId: user.id,
      ...reqMeta,
    });

    return successResponse({
      user: {
        id: user.id,
        partyId: user.partyId,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error);
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Login failed' } },
      { status: 500 },
    );
  }
}
