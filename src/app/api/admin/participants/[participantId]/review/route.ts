import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { participants } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/api/errors';
import { reviewParticipantSchema, type ReviewParticipantBody } from '@/lib/validators/participants';

export const POST = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(reviewParticipantSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const participantId = ctx.params?.participantId;
    const body = ctx.body as ReviewParticipantBody;
    const user = ctx.user!;

    if (!participantId) {
      throw new NotFoundError('Participant');
    }

    if (body.action === 'reject' && !body.rejectionReason) {
      throw new ValidationError({ message: 'Rejection reason is required when rejecting a participant' });
    }

    const [existingParticipant] = await db
      .select({
        id: participants.id,
        name: participants.name,
        verificationStatus: participants.verificationStatus,
      })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!existingParticipant) {
      throw new NotFoundError('Participant', participantId);
    }

    if (existingParticipant.verificationStatus !== 'pending') {
      throw new ConflictError('Only pending participants can be reviewed');
    }

    const updateData: Record<string, unknown> = {
      reviewedByUserId: user.sub,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    if (body.action === 'approve') {
      updateData.verificationStatus = 'approved';
    } else if (body.action === 'reject') {
      updateData.verificationStatus = 'rejected';
      updateData.rejectionReason = body.rejectionReason;
      updateData.claimedByUserId = null;
      updateData.claimedByOrgId = null;
      updateData.claimedAt = null;
    }

    const [reviewedParticipant] = await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, participantId))
      .returning({
        id: participants.id,
        name: participants.name,
        verificationStatus: participants.verificationStatus,
        reviewedByUserId: participants.reviewedByUserId,
        reviewedAt: participants.reviewedAt,
        rejectionReason: participants.rejectionReason,
        claimedByUserId: participants.claimedByUserId,
        claimedByOrgId: participants.claimedByOrgId,
        claimedAt: participants.claimedAt,
        updatedAt: participants.updatedAt,
      });

    return successResponse({ 
      participant: reviewedParticipant,
      action: body.action,
    });
  },
);