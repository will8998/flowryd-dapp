import { NextRequest } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { flows, deals } from '@/db/schema';
import { withMiddleware, requireAuth } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export const GET = withMiddleware(
  requireAuth(),
  async (req: NextRequest, ctx: ApiContext) => {
    const url = new URL(req.url);
    const section = url.searchParams.get('section');

    const orgId = ctx.user!.orgId;
    const baseConditions = [eq(flows.orgId, orgId)];

    if (section) {
      let sectionFlows;
      
      switch (section) {
        case 'inflight': {
          const inflightFlows = await db
            .select()
            .from(flows)
            .leftJoin(deals, eq(flows.id, deals.flowId))
            .where(
              and(
                ...baseConditions,
                eq(flows.status, 'published'),
                eq(flows.isPublic, true),
                sql`NOT EXISTS (
                  SELECT 1 FROM ${deals} 
                  WHERE ${deals.flowId} = ${flows.id} 
                  AND ${deals.status} IN ('locked', 'committed')
                )`
              )
            )
            .groupBy(flows.id)
            .orderBy(desc(flows.updatedAt))
            .limit(50);

          sectionFlows = inflightFlows.map(row => row.flows);
          break;
        }
        case 'production': {
          const productionFlows = await db
            .select()
            .from(flows)
            .where(
              and(
                ...baseConditions,
                eq(flows.status, 'published'),
                sql`EXISTS (
                  SELECT 1 FROM ${deals} 
                  WHERE ${deals.flowId} = ${flows.id} 
                  AND ${deals.status} IN ('locked', 'committed')
                )`
              )
            )
            .orderBy(desc(flows.updatedAt))
            .limit(50);

          sectionFlows = productionFlows;
          break;
        }
        case 'inTheNews': {
          sectionFlows = await db
            .select()
            .from(flows)
            .where(
              and(
                ...baseConditions,
                eq(flows.isFeatured, true)
              )
            )
            .orderBy(desc(flows.updatedAt))
            .limit(50);
          break;
        }
        case 'templates': {
          sectionFlows = await db
            .select()
            .from(flows)
            .where(
              and(
                ...baseConditions,
                eq(flows.isTemplate, true)
              )
            )
            .orderBy(desc(flows.updatedAt))
            .limit(50);
          break;
        }
        default:
          return successResponse({ [section]: [] });
      }

      return successResponse({ [section]: sectionFlows });
    }

    const [inflightFlows, productionFlows, inTheNewsFlows, templatesFlows] = await Promise.all([
      db
        .select()
        .from(flows)
        .where(
          and(
            ...baseConditions,
            eq(flows.status, 'published'),
            eq(flows.isPublic, true),
            sql`NOT EXISTS (
              SELECT 1 FROM ${deals} 
              WHERE ${deals.flowId} = ${flows.id} 
              AND ${deals.status} IN ('locked', 'committed')
            )`
          )
        )
        .orderBy(desc(flows.updatedAt))
        .limit(50),

      db
        .select()
        .from(flows)
        .where(
          and(
            ...baseConditions,
            eq(flows.status, 'published'),
            sql`EXISTS (
              SELECT 1 FROM ${deals} 
              WHERE ${deals.flowId} = ${flows.id} 
              AND ${deals.status} IN ('locked', 'committed')
            )`
          )
        )
        .orderBy(desc(flows.updatedAt))
        .limit(50),

      db
        .select()
        .from(flows)
        .where(
          and(
            ...baseConditions,
            eq(flows.isFeatured, true)
          )
        )
        .orderBy(desc(flows.updatedAt))
        .limit(50),

      db
        .select()
        .from(flows)
        .where(
          and(
            ...baseConditions,
            eq(flows.isTemplate, true)
          )
        )
        .orderBy(desc(flows.updatedAt))
        .limit(50),
    ]);

    return successResponse({
      inflight: inflightFlows,
      production: productionFlows,
      inTheNews: inTheNewsFlows,
      templates: templatesFlows,
    });
  },
);