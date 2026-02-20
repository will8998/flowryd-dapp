import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { participants } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { NotFoundError, ForbiddenError } from '@/lib/api/errors';
import { updateParticipantSchema, type UpdateParticipantBody } from '@/lib/validators/participants';

export const GET = withMiddleware(
  async (_req: NextRequest, ctx: ApiContext) => {
    const participantId = ctx.params?.participantId;
    if (!participantId) {
      throw new NotFoundError('Participant');
    }

    const [participant] = await db
      .select({
        id: participants.id,
        legacyId: participants.legacyId,
        name: participants.name,
        description: participants.description,
        logoUrl: participants.logoUrl,
        website: participants.website,
        cantonPartyId: participants.cantonPartyId,
        roles: participants.roles,
        capabilities: participants.capabilities,
        criticality: participants.criticality,
        holdings: participants.holdings,
        validatorNodes: participants.validatorNodes,
        superValidator: participants.superValidator,
        verificationStatus: participants.verificationStatus,
        claimedByUserId: participants.claimedByUserId,
        claimedByOrgId: participants.claimedByOrgId,
        claimedAt: participants.claimedAt,
        reviewedByUserId: participants.reviewedByUserId,
        reviewedAt: participants.reviewedAt,
        rejectionReason: participants.rejectionReason,
        contactEmail: participants.contactEmail,
        contactName: participants.contactName,
        metadata: participants.metadata,
        createdAt: participants.createdAt,
        updatedAt: participants.updatedAt,
      })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!participant) {
      throw new NotFoundError('Participant', participantId);
    }

    return successResponse({ participant });
  },
);

export const PUT = withMiddleware(
  requireAuth(),
  validateBody(updateParticipantSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const participantId = ctx.params?.participantId;
    const body = ctx.body as UpdateParticipantBody;
    const user = ctx.user!;

    if (!participantId) {
      throw new NotFoundError('Participant');
    }

    const [existingParticipant] = await db
      .select({
        id: participants.id,
        claimedByUserId: participants.claimedByUserId,
        claimedByOrgId: participants.claimedByOrgId,
        verificationStatus: participants.verificationStatus,
      })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (!existingParticipant) {
      throw new NotFoundError('Participant', participantId);
    }

    const canEdit = 
      user.role === 'admin' ||
      (existingParticipant.claimedByUserId === user.sub && existingParticipant.claimedByOrgId === user.orgId);

    if (!canEdit) {
      throw new ForbiddenError('You can only edit participants claimed by your organization');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.roles !== undefined) updateData.roles = body.roles;
    if (body.contactEmail !== undefined) updateData.contactEmail = body.contactEmail;
    if (body.contactName !== undefined) updateData.contactName = body.contactName;
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl;
    if (body.capabilities !== undefined) updateData.capabilities = body.capabilities;
    if (body.criticality !== undefined) updateData.criticality = body.criticality;
    if (body.holdings !== undefined) updateData.holdings = body.holdings;
    if (body.validatorNodes !== undefined) updateData.validatorNodes = body.validatorNodes;
    if (body.superValidator !== undefined) updateData.superValidator = body.superValidator;

    const [updatedParticipant] = await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, participantId))
      .returning({
        id: participants.id,
        name: participants.name,
        description: participants.description,
        logoUrl: participants.logoUrl,
        website: participants.website,
        roles: participants.roles,
        capabilities: participants.capabilities,
        criticality: participants.criticality,
        holdings: participants.holdings,
        validatorNodes: participants.validatorNodes,
        superValidator: participants.superValidator,
        verificationStatus: participants.verificationStatus,
        contactEmail: participants.contactEmail,
        contactName: participants.contactName,
        updatedAt: participants.updatedAt,
      });

    return successResponse({ participant: updatedParticipant });
  },
);