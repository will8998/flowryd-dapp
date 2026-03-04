import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userPreferences, users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/lib/api/response';
import { UnauthorizedError, ValidationError, ApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return errorResponse(new UnauthorizedError());
    }

    // Check if user exists
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, session.sub))
      .limit(1);

    if (!user) {
      return errorResponse(new UnauthorizedError('User not found'));
    }

    // Get or create user preferences
    let [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.sub))
      .limit(1);

    // If no preferences exist, create defaults
    if (!preferences) {
      [preferences] = await db
        .insert(userPreferences)
        .values({
          userId: session.sub,
          theme: 'dark',
          displayDensity: 'comfortable',
          defaultView: 'intelligence',
          notificationsEnabled: true,
          emailDigest: 'daily',
        })
        .returning();
    }

    return successResponse({ preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return errorResponse(new ApiError('Failed to fetch preferences', 'INTERNAL_ERROR', 500));
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return errorResponse(new UnauthorizedError());
    }

    // Check if user exists
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, session.sub))
      .limit(1);

    if (!user) {
      return errorResponse(new UnauthorizedError('User not found'));
    }

    const body = await request.json();
    
    // Validate the request body
    const allowedFields = ['theme', 'displayDensity', 'defaultView', 'notificationsEnabled', 'emailDigest'];
    const updates: Record<string, string | boolean> = {};
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = value as string | boolean;
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(new ValidationError('No valid fields to update'));
    }

    // Add updatedAt timestamp
    (updates as Record<string, string | boolean | Date>).updatedAt = new Date();

    // Update or create preferences
    const [preferences] = await db
      .insert(userPreferences)
      .values({
        userId: session.sub,
        ...updates,
      })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: updates,
      })
      .returning();

    return successResponse({ preferences });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return errorResponse(new ApiError('Failed to update preferences', 'INTERNAL_ERROR', 500));
  }
}