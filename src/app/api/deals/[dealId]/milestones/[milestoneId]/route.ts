import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealMilestones, dealParticipants } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { z } from 'zod';

const updateMilestoneSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).optional(),
  order: z.number().int().min(0).optional(),
});

export const PATCH = withMiddleware(
  requireAuth(),
  validateBody(updateMilestoneSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { dealId, milestoneId } = ctx.params!;
    const body = ctx.body as z.infer<typeof updateMilestoneSchema>;

    // Verify user has access to this deal
    const [deal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    // Verify milestone exists and belongs to this deal
    const [milestone] = await db
      .select()
      .from(dealMilestones)
      .where(and(
        eq(dealMilestones.id, milestoneId),
        eq(dealMilestones.dealId, dealId)
      ))
      .limit(1);

    if (!milestone) {
      throw new NotFoundError('Milestone', milestoneId);
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
      throw new ForbiddenError('You must be a deal participant to update milestones');
    }

    // Prepare update data
    const updateData: Record<string, string | number | Date | null> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.order !== undefined) updateData.order = body.order;
    
    if (body.status !== undefined) {
      updateData.status = body.status;
      
      // If marking as completed, set completion details
      if (body.status === 'completed' && milestone.status !== 'completed') {
        updateData.completedAt = new Date();
        updateData.completedBy = ctx.user!.sub;
      }
      
      // If unmarking as completed, clear completion details
      if (body.status !== 'completed' && milestone.status === 'completed') {
        updateData.completedAt = null;
        updateData.completedBy = null;
      }
    }

    const [updated] = await db
      .update(dealMilestones)
      .set(updateData)
      .where(eq(dealMilestones.id, milestoneId))
      .returning();

    return successResponse({ milestone: updated });
  },
);

export const DELETE = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { dealId, milestoneId } = ctx.params!;

    // Verify user has access to this deal
    const [deal] = await db
      .select()
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.user!.orgId)))
      .limit(1);

    if (!deal) {
      throw new NotFoundError('Deal', dealId);
    }

    // Verify milestone exists and belongs to this deal
    const [milestone] = await db
      .select()
      .from(dealMilestones)
      .where(and(
        eq(dealMilestones.id, milestoneId),
        eq(dealMilestones.dealId, dealId)
      ))
      .limit(1);

    if (!milestone) {
      throw new NotFoundError('Milestone', milestoneId);
    }

    // Check if user is a participant in this deal (only participants can delete)
    const [participant] = await db
      .select()
      .from(dealParticipants)
      .where(and(
        eq(dealParticipants.dealId, dealId),
        eq(dealParticipants.userId, ctx.user!.sub)
      ))
      .limit(1);

    if (!participant) {
      throw new ForbiddenError('You must be a deal participant to delete milestones');
    }

    await db
      .delete(dealMilestones)
      .where(eq(dealMilestones.id, milestoneId));

    return successResponse({ success: true });
  },
);