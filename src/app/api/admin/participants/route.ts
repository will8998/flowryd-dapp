import { NextRequest } from 'next/server';
import { eq, and, ilike, or, desc, asc, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import { participants, users, organizations } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, _ctx: ApiContext) => {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 25, 1), 100);
    const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortDir = url.searchParams.get('sortDir') === 'desc' ? 'desc' : 'asc';

    const whereConditions = [];

    if (status && status !== 'all') {
      const validStatuses = ['unclaimed', 'pending', 'approved', 'verified', 'rejected'] as const;
      if (validStatuses.includes(status as typeof validStatuses[number])) {
        whereConditions.push(eq(participants.verificationStatus, status as typeof validStatuses[number]));
      }
    }

    if (search.trim()) {
      whereConditions.push(
        or(
          ilike(participants.name, `%${search}%`),
          ilike(participants.description, `%${search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const sortColumn = sortBy === 'createdAt' ? participants.createdAt
      : sortBy === 'updatedAt' ? participants.updatedAt
      : sortBy === 'verificationStatus' ? participants.verificationStatus
      : participants.name;

    const orderFn = sortDir === 'desc' ? desc : asc;

    const [participantsList, totalResult] = await Promise.all([
      db
        .select({
          id: participants.id,
          name: participants.name,
          description: participants.description,
          logoUrl: participants.logoUrl,
          website: participants.website,
          roles: participants.roles,
          verificationStatus: participants.verificationStatus,
          claimedByUserId: participants.claimedByUserId,
          claimedByOrgId: participants.claimedByOrgId,
          claimedAt: participants.claimedAt,
          reviewedByUserId: participants.reviewedByUserId,
          reviewedAt: participants.reviewedAt,
          rejectionReason: participants.rejectionReason,
          contactEmail: participants.contactEmail,
          contactName: participants.contactName,
          createdAt: participants.createdAt,
          updatedAt: participants.updatedAt,
        })
        .from(participants)
        .where(whereClause)
        .orderBy(orderFn(sortColumn))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(participants)
        .where(whereClause),
    ]);

    const participantIds = participantsList
      .filter(p => p.claimedByUserId)
      .map(p => p.claimedByUserId!);

    const orgIds = participantsList
      .filter(p => p.claimedByOrgId)
      .map(p => p.claimedByOrgId!);

    let usersMap = new Map<string, { displayName: string; email: string | null }>();
    let orgsMap = new Map<string, { name: string }>();

    if (participantIds.length > 0) {
      const claimedUsers = await db
        .select({ id: users.id, displayName: users.displayName, email: users.email })
        .from(users)
        .where(sql`${users.id} = ANY(${participantIds})`);
      usersMap = new Map(claimedUsers.map(u => [u.id, { displayName: u.displayName, email: u.email }]));
    }

    if (orgIds.length > 0) {
      const claimedOrgs = await db
        .select({ id: organizations.id, name: organizations.name })
        .from(organizations)
        .where(sql`${organizations.id} = ANY(${orgIds})`);
      orgsMap = new Map(claimedOrgs.map(o => [o.id, { name: o.name }]));
    }

    const enriched = participantsList.map(p => ({
      ...p,
      roles: (p.roles as string[]) || [],
      claimedByUser: p.claimedByUserId ? usersMap.get(p.claimedByUserId) || null : null,
      claimedByOrg: p.claimedByOrgId ? orgsMap.get(p.claimedByOrgId) || null : null,
    }));

    return successResponse({
      participants: enriched,
      total: totalResult[0]?.total || 0,
    });
  },
);
