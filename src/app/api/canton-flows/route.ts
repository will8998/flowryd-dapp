import { asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { cantonFlows, cantonFlowSteps } from '@/db/schema';
import { successResponse } from '@/lib/api/response';

export async function GET() {
  try {
    // Get all flows with step count
    const flows = await db
      .select({
        id: cantonFlows.id,
        name: cantonFlows.name,
        category: cantonFlows.category,
        description: cantonFlows.description,
        source: cantonFlows.source,
        status: cantonFlows.status,
        stepCount: cantonFlows.stepCount,
        sortOrder: cantonFlows.sortOrder,
        createdAt: cantonFlows.createdAt,
        updatedAt: cantonFlows.updatedAt,
        actualStepCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${cantonFlowSteps} 
          WHERE ${cantonFlowSteps.flowId} = ${cantonFlows.id}
        )`.as('actualStepCount')
      })
      .from(cantonFlows)
      .orderBy(asc(cantonFlows.sortOrder));

    return successResponse({
      flows
    });
  } catch (error) {
    console.error('Error fetching Canton flows:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch Canton flows' },
      { status: 500 }
    );
  }
}