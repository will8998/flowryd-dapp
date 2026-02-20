import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, count, sum, sql, gte, lte, and, inArray, notInArray } from 'drizzle-orm';
import { db } from '@/db';
import { 
  users, 
  organizations, 
  flows, 
  deals, 
  subscriptions, 
  plans, 
  auditLog, 
  activeSessions, 
  invoices,
  providers
} from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

type Period = '7d' | '30d' | '90d' | '1y';
type Granularity = 'day' | 'week' | 'month';

interface TimeSeriesPoint {
  date: string;
  count?: number;
  created?: number;
  published?: number;
  committed?: number;
  amount?: number;
}

interface AnalyticsResponse {
  data: {
    summary: {
      totalUsers: number;
      totalOrganizations: number;
      totalFlows: number;
      totalDeals: number;
      activeSubscriptions: number;
      mrr: number;
      activeSessionsLast24h: number;
      auditEventsLast24h: number;
    };
    timeSeries: {
      userGrowth: TimeSeriesPoint[];
      flowActivity: TimeSeriesPoint[];
      dealVolume: TimeSeriesPoint[];
      revenue: TimeSeriesPoint[];
    };
    distributions: {
      dealsByStatus: Record<string, number>;
      flowsByStatus: Record<string, number>;
      subscriptionsByTier: Record<string, number>;
      subscriptionsByStatus: Record<string, number>;
      usersByRole: Record<string, number>;
      providersByCategory: Record<string, number>;
    };
    recentActivity: Array<{
      id: string;
      action: string;
      resourceType: string | null;
      userId: string | null;
      userName: string | null;
      createdAt: string;
    }>;
  };
}

function getDateRange(period: Period): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(endDate.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
}

function getGranularity(period: Period, requestedGranularity?: Granularity): Granularity {
  if (requestedGranularity) return requestedGranularity;
  
  switch (period) {
    case '7d':
      return 'day';
    case '30d':
      return 'day';
    case '90d':
      return 'week';
    case '1y':
      return 'month';
  }
}

function getDateTruncFormat(granularity: Granularity): string {
  switch (granularity) {
    case 'day':
      return 'day';
    case 'week':
      return 'week';
    case 'month':
      return 'month';
  }
}

async function getSummaryMetrics() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [totalUsersResult] = await db
    .select({ total: count() })
    .from(users)
    .where(eq(users.isActive, true));

  const [totalOrgsResult] = await db
    .select({ total: count() })
    .from(organizations);

  const [totalFlowsResult] = await db
    .select({ total: count() })
    .from(flows);

  const [totalDealsResult] = await db
    .select({ total: count() })
    .from(deals);

  const [activeSubsResult] = await db
    .select({ total: count() })
    .from(subscriptions)
    .where(inArray(subscriptions.status, ['active', 'trial']));

  const mrrResult = await db
    .select({ 
      totalMrr: sum(plans.priceAmount).mapWith(Number)
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(subscriptions.status, 'active'));

  const [activeSessionsResult] = await db
    .select({ total: count() })
    .from(activeSessions)
    .where(gte(activeSessions.lastSeenAt, yesterday));

  const [auditEventsResult] = await db
    .select({ total: count() })
    .from(auditLog)
    .where(gte(auditLog.createdAt, yesterday));

  return {
    totalUsers: totalUsersResult?.total || 0,
    totalOrganizations: totalOrgsResult?.total || 0,
    totalFlows: totalFlowsResult?.total || 0,
    totalDeals: totalDealsResult?.total || 0,
    activeSubscriptions: activeSubsResult?.total || 0,
    mrr: mrrResult[0]?.totalMrr || 0,
    activeSessionsLast24h: activeSessionsResult?.total || 0,
    auditEventsLast24h: auditEventsResult?.total || 0,
  };
}

async function getTimeSeriesData(period: Period, granularity: Granularity) {
  const { startDate, endDate } = getDateRange(period);
  const truncFormat = getDateTruncFormat(granularity);

  const userGrowthData = await db
    .select({
      date: sql<string>`date_trunc('${sql.raw(truncFormat)}', "users"."created_at")::date`,
      count: count()
    })
    .from(users)
    .where(
      and(
        gte(users.createdAt, startDate),
        lte(users.createdAt, endDate)
      )
    )
    .groupBy(sql`date_trunc('${sql.raw(truncFormat)}', "users"."created_at")`)
    .orderBy(sql`date_trunc('${sql.raw(truncFormat)}', "users"."created_at")`);

  const flowCreatedData = await db
    .select({
      date: sql<string>`date_trunc('${sql.raw(truncFormat)}', "flows"."created_at")::date`,
      created: count()
    })
    .from(flows)
    .where(
      and(
        gte(flows.createdAt, startDate),
        lte(flows.createdAt, endDate)
      )
    )
    .groupBy(sql`date_trunc('${sql.raw(truncFormat)}', "flows"."created_at")`)
    .orderBy(sql`date_trunc('${sql.raw(truncFormat)}', "flows"."created_at")`);

  const flowPublishedData = await db
    .select({
      date: sql<string>`date_trunc('${sql.raw(truncFormat)}', "audit_log"."created_at")::date`,
      published: count()
    })
    .from(auditLog)
    .where(
      and(
        eq(auditLog.action, 'flow.publish'),
        gte(auditLog.createdAt, startDate),
        lte(auditLog.createdAt, endDate)
      )
    )
    .groupBy(sql`date_trunc('${sql.raw(truncFormat)}', "audit_log"."created_at")`)
    .orderBy(sql`date_trunc('${sql.raw(truncFormat)}', "audit_log"."created_at")`);

  const dealCreatedData = await db
    .select({
      date: sql<string>`date_trunc('${sql.raw(truncFormat)}', "deals"."created_at")::date`,
      created: count()
    })
    .from(deals)
    .where(
      and(
        gte(deals.createdAt, startDate),
        lte(deals.createdAt, endDate)
      )
    )
    .groupBy(sql`date_trunc('${sql.raw(truncFormat)}', "deals"."created_at")`)
    .orderBy(sql`date_trunc('${sql.raw(truncFormat)}', "deals"."created_at")`);

  const dealCommittedData = await db
    .select({
      date: sql<string>`date_trunc('${sql.raw(truncFormat)}', "deals"."updated_at")::date`,
      committed: count()
    })
    .from(deals)
    .where(
      and(
        eq(deals.status, 'committed'),
        gte(deals.updatedAt, startDate),
        lte(deals.updatedAt, endDate)
      )
    )
    .groupBy(sql`date_trunc('${sql.raw(truncFormat)}', "deals"."updated_at")`)
    .orderBy(sql`date_trunc('${sql.raw(truncFormat)}', "deals"."updated_at")`);

  const revenueData = await db
    .select({
      date: sql<string>`date_trunc('${sql.raw(truncFormat)}', "invoices"."paid_at")::date`,
      amount: sum(invoices.amountDue).mapWith(Number)
    })
    .from(invoices)
    .where(
      and(
        sql`${invoices.paidAt} IS NOT NULL`,
        gte(invoices.paidAt, startDate),
        lte(invoices.paidAt, endDate)
      )
    )
    .groupBy(sql`date_trunc('${sql.raw(truncFormat)}', "invoices"."paid_at")`)
    .orderBy(sql`date_trunc('${sql.raw(truncFormat)}', "invoices"."paid_at")`);

  const flowActivityMap = new Map<string, { created: number; published: number }>();
  
  flowCreatedData.forEach(item => {
    flowActivityMap.set(item.date, { created: item.created, published: 0 });
  });
  
  flowPublishedData.forEach(item => {
    const existing = flowActivityMap.get(item.date) || { created: 0, published: 0 };
    flowActivityMap.set(item.date, { ...existing, published: item.published });
  });

  const flowActivity = Array.from(flowActivityMap.entries()).map(([date, data]) => ({
    date,
    created: data.created,
    published: data.published
  })).sort((a, b) => a.date.localeCompare(b.date));

  const dealVolumeMap = new Map<string, { created: number; committed: number }>();
  
  dealCreatedData.forEach(item => {
    dealVolumeMap.set(item.date, { created: item.created, committed: 0 });
  });
  
  dealCommittedData.forEach(item => {
    const existing = dealVolumeMap.get(item.date) || { created: 0, committed: 0 };
    dealVolumeMap.set(item.date, { ...existing, committed: item.committed });
  });

  const dealVolume = Array.from(dealVolumeMap.entries()).map(([date, data]) => ({
    date,
    created: data.created,
    committed: data.committed
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    userGrowth: userGrowthData.map(item => ({ date: item.date, count: item.count })),
    flowActivity,
    dealVolume,
    revenue: revenueData.map(item => ({ date: item.date, amount: item.amount || 0 }))
  };
}

async function getDistributions() {
  const dealsByStatus = await db
    .select({
      status: deals.status,
      count: count()
    })
    .from(deals)
    .groupBy(deals.status);

  const flowsByStatus = await db
    .select({
      status: flows.status,
      count: count()
    })
    .from(flows)
    .groupBy(flows.status);

  const subscriptionsByTier = await db
    .select({
      tier: plans.tier,
      count: count()
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(notInArray(subscriptions.status, ['cancelled', 'expired']))
    .groupBy(plans.tier);

  const subscriptionsByStatus = await db
    .select({
      status: subscriptions.status,
      count: count()
    })
    .from(subscriptions)
    .groupBy(subscriptions.status);

  const usersByRole = await db
    .select({
      role: users.role,
      count: count()
    })
    .from(users)
    .where(eq(users.isActive, true))
    .groupBy(users.role);

  const providersByCategory = await db
    .select({
      category: providers.category,
      count: count()
    })
    .from(providers)
    .where(eq(providers.status, 'active'))
    .groupBy(providers.category);

  return {
    dealsByStatus: Object.fromEntries(
      dealsByStatus.map(item => [item.status || 'unknown', item.count])
    ),
    flowsByStatus: Object.fromEntries(
      flowsByStatus.map(item => [item.status || 'unknown', item.count])
    ),
    subscriptionsByTier: Object.fromEntries(
      subscriptionsByTier.map(item => [item.tier, item.count])
    ),
    subscriptionsByStatus: Object.fromEntries(
      subscriptionsByStatus.map(item => [item.status || 'unknown', item.count])
    ),
    usersByRole: Object.fromEntries(
      usersByRole.map(item => [item.role, item.count])
    ),
    providersByCategory: Object.fromEntries(
      providersByCategory.map(item => [item.category, item.count])
    ),
  };
}

async function getRecentActivity() {
  const recentActivity = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      resourceType: auditLog.resourceType,
      userId: auditLog.userId,
      userName: users.displayName,
      createdAt: auditLog.createdAt
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(20);

  return recentActivity.map(item => ({
    id: item.id,
    action: item.action,
    resourceType: item.resourceType,
    userId: item.userId,
    userName: item.userName,
    createdAt: item.createdAt.toISOString()
  }));
}

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, _ctx: ApiContext) => {
    const { searchParams } = new URL(req.url);
    const period = (searchParams.get('period') as Period) || '30d';
    const requestedGranularity = searchParams.get('granularity') as Granularity;

    if (!['7d', '30d', '90d', '1y'].includes(period)) {
      return NextResponse.json(
        { error: { code: 'INVALID_PERIOD', message: 'Period must be one of: 7d, 30d, 90d, 1y' } },
        { status: 400 }
      );
    }

    if (requestedGranularity && !['day', 'week', 'month'].includes(requestedGranularity)) {
      return NextResponse.json(
        { error: { code: 'INVALID_GRANULARITY', message: 'Granularity must be one of: day, week, month' } },
        { status: 400 }
      );
    }

    const granularity = getGranularity(period, requestedGranularity);

    try {
      const [summary, timeSeries, distributions, recentActivity] = await Promise.all([
        getSummaryMetrics(),
        getTimeSeriesData(period, granularity),
        getDistributions(),
        getRecentActivity()
      ]);

      const response: AnalyticsResponse = {
        data: {
          summary,
          timeSeries,
          distributions,
          recentActivity
        }
      };

      return successResponse(response);
    } catch (error) {
      console.error('Analytics query error:', error);
      return NextResponse.json(
        { error: { code: 'QUERY_ERROR', message: 'Failed to fetch analytics data' } },
        { status: 500 }
      );
    }
  }
);