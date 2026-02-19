import { NextRequest } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { plans } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, _ctx: ApiContext) => {
    const plansList = await db
      .select()
      .from(plans)
      .where(eq(plans.isActive, true))
      .orderBy(asc(plans.priceAmount));

    return successResponse({ plans: plansList });
  },
);