import { NextRequest } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealMilestones, dealParticipants, users } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { z } from 'zod';

const createMilestoneSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  order: z.number().int().min(0).default(0),
});

export const GET = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { dealId } = ctx.params!;

    // Verify user has access to this deal
    const [deal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    // Get milestones ordered by order field
    const milestones = await db
      .select({
        id: dealMilestones.id,
        dealId: dealMilestones.dealId,
        title: dealMilestones.title,
        description: dealMilestones.description,
        dueDate: dealMilestones.dueDate,
        status: dealMilestones.status,
        order: dealMilestones.order,
        completedAt: dealMilestones.completedAt,
        completedBy: dealMilestones.completedBy,
        completedByName: users.displayName,
        createdAt: dealMilestones.createdAt,
        updatedAt: dealMilestones.updatedAt,
      })
      .from(dealMilestones)
      .leftJoin(users, eq(dealMilestones.completedBy, users.id))
      .where(eq(dealMilestones.dealId, dealId))
      .orderBy(asc(dealMilestones.order), asc(dealMilestones.createdAt));

    return successResponse({ milestones });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(createMilestoneSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { dealId } = ctx.params!;
    const body = ctx.body as z.infer<typeof createMilestoneSchema>;

    // Verify user has access to this deal and is a participant
    const [deal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    // Check if user is a participant in this deal
    const [participant] = await db
      .select()
      .from(dealParticipants)
      .where(and(
        eq(dealParticipants.dealId, dealId),
        eq(dealParticipants.userId, ctx.user!.sub)
      ))
      .limit(1);

    if (!participant) {
      throw new ForbiddenError('You must be a deal participant to create milestones');
    }

    const [milestone] = await db
      .insert(dealMilestones)
      .values({
        dealId,
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        order: body.order,
        status: 'pending',
      })
      .returning();

    return successResponse({ milestone });
  },
);