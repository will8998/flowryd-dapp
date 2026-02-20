import { NextRequest } from 'next/server';
import { desc, asc, ilike, eq, count } from 'drizzle-orm';
import { db } from '@/db';
import { paymentMethods, organizations } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { paginationParamsSchema, createPaymentMethodSchema } from '@/lib/validators/admin';

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    const url = new URL(req.url);
    const { limit, offset, search, sortBy, sortDir } = paginationParamsSchema.parse({
      limit: url.searchParams.get('limit'),
      offset: url.searchParams.get('offset'),
      search: url.searchParams.get('search'),
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortDir: url.searchParams.get('sortDir'),
    });

    const conditions = [];
    if (search) {
      conditions.push(ilike(organizations.name, `%${search}%`));
    }

    const sortColumn = sortBy === 'type' ? paymentMethods.type : 
                      sortBy === 'label' ? paymentMethods.label :
                      paymentMethods.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const [paymentMethodsData, totalCount] = await Promise.all([
      db
        .select({
          id: paymentMethods.id,
          orgId: paymentMethods.orgId,
          type: paymentMethods.type,
          label: paymentMethods.label,
          walletAddress: paymentMethods.walletAddress,
          isDefault: paymentMethods.isDefault,
          metadata: paymentMethods.metadata,
          createdAt: paymentMethods.createdAt,
          updatedAt: paymentMethods.updatedAt,
          orgName: organizations.name,
          orgSlug: organizations.slug,
        })
        .from(paymentMethods)
        .leftJoin(organizations, eq(paymentMethods.orgId, organizations.id))
        .where(conditions.length > 0 ? conditions[0] : undefined)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(paymentMethods)
        .leftJoin(organizations, eq(paymentMethods.orgId, organizations.id))
        .where(conditions.length > 0 ? conditions[0] : undefined)
        .then(result => result[0].count)
    ]);

    const hasMore = offset + limit < totalCount;

    return successResponse({
      data: paymentMethodsData,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore,
      },
    });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(createPaymentMethodSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as {
      orgId: string;
      type?: string;
      label?: string;
      walletAddress?: string;
      isDefault?: boolean;
      metadata?: Record<string, unknown>;
    };

    const [newPaymentMethod] = await db
      .insert(paymentMethods)
      .values({
        orgId: body.orgId,
        type: body.type || 'canton_cc',
        label: body.label,
        walletAddress: body.walletAddress,
        isDefault: body.isDefault || false,
        metadata: body.metadata,
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.create',
      resourceType: 'payment_method',
      resourceId: newPaymentMethod.id,
      metadata: { orgId: body.orgId, type: body.type },
      ...reqMeta,
    });

    return successResponse({ paymentMethod: newPaymentMethod }, 201);
  },
);