import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { participants } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ConflictError } from '@/lib/api/errors';
import { claimParticipantSchema, type ClaimParticipantBody } from '@/lib/validators/participants';

export const POST = withMiddleware(
  requireAuth(),
  validateBody(claimParticipantSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const participantId = ctx.params?.participantId;
    const body = ctx.body as ClaimParticipantBody;
    const user = ctx.user!;

    if (!participantId) {
      throw new NotFoundError('Participant');
    }

    const [existingParticipant] = await db
      .select({
        id: participants.id,
        name: participants.name,
        verificationStatus: participants.verificationStatus,
        claimedByUserId: participants.claimedByUserId,
      })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!existingParticipant) {
      throw new NotFoundError('Participant', participantId);
    }

    if (existingParticipant.verificationStatus !== 'unclaimed') {
      throw new ConflictError('Participant is already claimed or in review process');
    }

    const updateData: Record<string, unknown> = {
      verificationStatus: 'pending',
      claimedByUserId: user.sub,
      claimedByOrgId: user.orgId,
      claimedAt: new Date(),
      contactEmail: body.contactEmail,
      contactName: body.contactName,
      updatedAt: new Date(),
    };

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.website !== undefined) {
      updateData.website = body.website;
    }

    const [claimedParticipant] = await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, participantId))
      .returning({
        id: participants.id,
        name: participants.name,
        description: participants.description,
        website: participants.website,
        verificationStatus: participants.verificationStatus,
        contactEmail: participants.contactEmail,
        contactName: participants.contactName,
        claimedAt: participants.claimedAt,
        updatedAt: participants.updatedAt,
      });

    return successResponse({ participant: claimedParticipant });
  },
);