import { NextRequest } from 'next/server';
import { eq, and, or, ilike, desc, asc, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { participants } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { participantListQuerySchema, createParticipantSchema, type CreateParticipantBody } from '@/lib/validators/participants';

export const GET = withMiddleware(
  async (req: NextRequest, _ctx: ApiContext) => {
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const safeParams = {
      ...queryParams,
      limit: Math.min(Number(queryParams.limit) || 50, 100),
      offset: Number(queryParams.offset) || 0,
    };
    
    const query = participantListQuerySchema.parse(safeParams);

    const whereConditions = [];

    if (query.status) {
      whereConditions.push(eq(participants.verificationStatus, query.status));
    }

    if (query.role) {
      whereConditions.push(sql`${participants.roles} @> ${JSON.stringify([query.role])}`);
    }

    if (query.search) {
      whereConditions.push(
        or(
          ilike(participants.name, `%${query.search}%`),
          ilike(participants.description, `%${query.search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [participantsList, totalCountResult] = await Promise.all([
      db
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
          contactEmail: participants.contactEmail,
          contactName: participants.contactName,
          createdAt: participants.createdAt,
          updatedAt: participants.updatedAt,
        })
        .from(participants)
        .where(whereClause)
        .orderBy(
          desc(sql`CASE 
            WHEN ${participants.criticality} = 'critical' THEN 3
            WHEN ${participants.criticality} = 'required' THEN 2
            ELSE 1
          END`),
          asc(participants.name)
        )
        .limit(query.limit)
        .offset(query.offset),
      
      db
        .select({ count: count() })
        .from(participants)
        .where(whereClause)
    ]);

    const totalCount = totalCountResult[0]?.count || 0;

    return successResponse({
      participants: participantsList,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: totalCount,
        hasMore: query.offset + query.limit < totalCount,
      },
    });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(createParticipantSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as CreateParticipantBody;
    const user = ctx.user!;

    let cantonPartyId: string | undefined;
    if (user.partyId) {
      cantonPartyId = user.partyId;
    }

    const [participant] = await db
      .insert(participants)
      .values({
        name: body.name,
        description: body.description,
        website: body.website,
        roles: body.roles,
        contactEmail: body.contactEmail,
        contactName: body.contactName,
        cantonPartyId,
        verificationStatus: 'pending',
        claimedByUserId: user.sub,
        claimedByOrgId: user.orgId,
        claimedAt: new Date(),
      })
      .returning({
        id: participants.id,
        name: participants.name,
        description: participants.description,
        website: participants.website,
        roles: participants.roles,
        contactEmail: participants.contactEmail,
        contactName: participants.contactName,
        verificationStatus: participants.verificationStatus,
        createdAt: participants.createdAt,
      });

    return successResponse({ participant }, 201);
  },
);