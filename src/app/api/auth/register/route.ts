import { NextRequest, NextResponse } from 'next/server';
import { eq, count } from 'drizzle-orm';
import { db } from '@/db';
import { organizations, users } from '@/db/schema';
import { registerSchema } from '@/lib/validators/auth';
import { validatePartyId } from '@/lib/auth/validate-party-id';
import { signAccessToken, signRefreshToken, hashToken } from '@/lib/auth/jwt';
import { setAuthCookies } from '@/lib/auth/session';
import { refreshTokens } from '@/db/schema';
import { ApiError, ConflictError, ValidationError } from '@/lib/api/errors';
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

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(new ValidationError(parsed.error.issues));
    }

    const { partyId, displayName, orgName, email } = parsed.data;

    const validation = validatePartyId(partyId);
    if (!validation.valid) {
      return errorResponse(new ValidationError({ partyId: validation.error }));
    }

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.partyId, partyId))
      .limit(1);

    if (existingUser.length > 0) {
      return errorResponse(new ConflictError('A user with this Party-ID already exists'));
    }

    const orgSlug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const org = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, orgSlug))
      .limit(1);

    let orgId: string;

    if (org.length > 0) {
      orgId = org[0].id;
    } else {
      const [newOrg] = await db
        .insert(organizations)
        .values({ name: orgName, slug: orgSlug })
        .returning({ id: organizations.id });
      orgId = newOrg.id;
    }

    const [userCount] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.orgId, orgId));

    const role = userCount.value === 0 ? 'admin' : 'viewer';

    const [newUser] = await db
      .insert(users)
      .values({
        partyId,
        orgId,
        displayName,
        email: email || null,
        role,
        lastLoginAt: new Date(),
      })
      .returning();

    const tokenFamily = crypto.randomUUID();
    const accessToken = await signAccessToken({
      sub: newUser.id,
      partyId: newUser.partyId,
      role: newUser.role,
      orgId: newUser.orgId,
    });
    const refreshToken = await signRefreshToken(newUser.id, tokenFamily);

    await db.insert(refreshTokens).values({
      userId: newUser.id,
      tokenHash: await hashToken(refreshToken),
      tokenFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await setAuthCookies(accessToken, refreshToken);

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: newUser.id,
      orgId: newUser.orgId,
      action: 'user.register',
      resourceType: 'user',
      resourceId: newUser.id,
      ...reqMeta,
    });

    return successResponse(
      {
        user: {
          id: newUser.id,
          partyId: newUser.partyId,
          displayName: newUser.displayName,
          email: newUser.email,
          role: newUser.role,
          orgId: newUser.orgId,
        },
      },
      201,
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return errorResponse(error);
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } },
      { status: 500 },
    );
  }
}
