import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealMilestones, dealParticipants, dealVotes, users } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { z } from 'zod';

const voteSchema = z.object({
  vote: z.enum(['approve', 'reject', 'abstain']),
  comment: z.string().optional(),
});

export const POST = withMiddleware(
  requireAuth(),
  validateBody(voteSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const { dealId, milestoneId } = ctx.params!;
    const body = ctx.body as z.infer<typeof voteSchema>;

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
      throw new ForbiddenError('You must be a deal participant to vote on milestones');
    }

    // Check if user has already voted on this milestone
    const [existingVote] = await db
      .select()
      .from(dealVotes)
      .where(and(
        eq(dealVotes.milestoneId, milestoneId),
        eq(dealVotes.userId, ctx.user!.sub)
      ))
      .limit(1);

    let vote;
    if (existingVote) {
      // Update existing vote
      [vote] = await db
        .update(dealVotes)
        .set({
          vote: body.vote,
          comment: body.comment,
          createdAt: new Date(), // Update timestamp for new vote
        })
        .where(eq(dealVotes.id, existingVote.id))
        .returning();
    } else {
      // Create new vote
      [vote] = await db
        .insert(dealVotes)
        .values({
          dealId,
          milestoneId,
          userId: ctx.user!.sub,
          vote: body.vote,
          comment: body.comment,
        })
        .returning();
    }

    return successResponse({ vote });
  },
);