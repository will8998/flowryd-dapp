import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return errorResponse(new UnauthorizedError());
    }

    const [user] = await db
      .select({
        id: users.id,
        partyId: users.partyId,
        displayName: users.displayName,
        email: users.email,
        role: users.role,
        orgId: users.orgId,
      })
      .from(users)
      .where(eq(users.id, session.sub))
      .limit(1);

    if (!user) {
      return errorResponse(new UnauthorizedError('User not found'));
    }

    return successResponse({ user });
  } catch {
    return errorResponse(new UnauthorizedError());
  }
}
