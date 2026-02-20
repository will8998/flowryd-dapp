import { NextRequest } from 'next/server';
import { desc, asc, ilike, count, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { invoices, organizations, subscriptions, plans } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { paginationParamsSchema, createInvoiceSchema } from '@/lib/validators/admin';

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

    const status = url.searchParams.get('status');

    const conditions = [];
    if (search) {
      conditions.push(ilike(organizations.name, `%${search}%`));
    }
    if (status) {
      conditions.push(eq(invoices.status, status));
    }

    const sortColumn = sortBy === 'amountDue' ? invoices.amountDue : 
                      sortBy === 'dueDate' ? invoices.dueDate :
                      sortBy === 'status' ? invoices.status :
                      invoices.createdAt;
    const sortOrder = sortDir === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const whereClause = conditions.length > 0 ? sql`${conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`, sql`1=1`)}` : undefined;

    const [invoicesData, totalCount] = await Promise.all([
      db
        .select({
          id: invoices.id,
          orgId: invoices.orgId,
          subscriptionId: invoices.subscriptionId,
          amountDue: invoices.amountDue,
          currency: invoices.currency,
          status: invoices.status,
          lineItems: invoices.lineItems,
          paidAt: invoices.paidAt,
          dueDate: invoices.dueDate,
          createdAt: invoices.createdAt,
          updatedAt: invoices.updatedAt,
          orgName: organizations.name,
          planName: plans.name,
          planTier: plans.tier,
        })
        .from(invoices)
        .leftJoin(organizations, eq(invoices.orgId, organizations.id))
        .leftJoin(subscriptions, eq(invoices.subscriptionId, subscriptions.id))
        .leftJoin(plans, eq(subscriptions.planId, plans.id))
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(invoices)
        .leftJoin(organizations, eq(invoices.orgId, organizations.id))
        .where(whereClause)
        .then(result => result[0].count)
    ]);

    const hasMore = offset + limit < totalCount;

    return successResponse({
      data: invoicesData,
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
  validateBody(createInvoiceSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as {
      orgId: string;
      subscriptionId: string;
      amountDue: number;
      currency?: string;
      status?: string;
      lineItems?: Record<string, unknown>[];
      dueDate: string;
    };

    const [newInvoice] = await db
      .insert(invoices)
      .values({
        orgId: body.orgId,
        subscriptionId: body.subscriptionId,
        amountDue: body.amountDue,
        currency: body.currency || '$CC',
        status: body.status || 'draft',
        lineItems: body.lineItems || [],
        dueDate: new Date(body.dueDate),
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'subscription.create',
      resourceType: 'invoice',
      resourceId: newInvoice.id,
      metadata: { orgId: body.orgId, amountDue: body.amountDue },
      ...reqMeta,
    });

    return successResponse({ invoice: newInvoice }, 201);
  },
);