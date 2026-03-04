import { NextRequest } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import { deals, dealMilestones, dealVotes, users } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError } from '@/lib/api/errors';

export const GET = withMiddleware(
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

    // Get all votes for this milestone with user details
    const votes = await db
      .select({
        id: dealVotes.id,
        dealId: dealVotes.dealId,
        milestoneId: dealVotes.milestoneId,
        userId: dealVotes.userId,
        vote: dealVotes.vote,
        comment: dealVotes.comment,
        createdAt: dealVotes.createdAt,
        userDisplayName: users.displayName,
        userPartyId: users.partyId,
      })
      .from(dealVotes)
      .leftJoin(users, eq(dealVotes.userId, users.id))
      .where(eq(dealVotes.milestoneId, milestoneId))
      .orderBy(desc(dealVotes.createdAt));

    // Calculate vote summary
    const summary = votes.reduce((acc, vote) => {
      acc[vote.vote] = (acc[vote.vote] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return successResponse({ 
      votes,
      summary: {
        approve: summary.approve || 0,
        reject: summary.reject || 0,
        abstain: summary.abstain || 0,
        total: summary.total || 0,
      }
    });
  },
);