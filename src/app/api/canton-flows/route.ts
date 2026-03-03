import { NextRequest, NextResponse } from 'next/server';
import { asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { cantonFlows, cantonFlowSteps } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
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
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Canton flows' },
      { status: 500 }
    );
  }
}

interface StepInput {
  templateId: string;
  templateName: string;
  action?: string;
  inputs?: string;
  outputs?: string;
  triggersNext?: string;
  cantonPrivacy?: string;
  notes?: string;
}

// POST — create new flow (admin only)
export const POST = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, _ctx: ApiContext) => {
    try {
      const body = await req.json();
      const { name, category, description, source, status = 'planned', steps = [] } = body;

      if (!name) {
        return NextResponse.json(
          { success: false, error: 'Name is required' },
          { status: 400 }
        );
      }

      // Validate all steps have a valid templateId
      const typedSteps = steps as StepInput[];
      for (const step of typedSteps) {
        if (!step.templateId) {
          return NextResponse.json(
            { success: false, error: 'Each step requires a valid templateId' },
            { status: 400 }
          );
        }
      }

      // Generate flow ID
      const flowId = `FLOW-${Date.now()}`;

      // Insert flow
      await db
        .insert(cantonFlows)
        .values({
          id: flowId,
          name,
          category,
          description,
          source,
          status,
          stepCount: typedSteps.length,
          sortOrder: 0
        });

      // Insert steps if provided
      if (typedSteps.length > 0) {
        const stepInserts = typedSteps.map((step, index) => ({
          flowId,
          step: index + 1,
          templateId: step.templateId,
          templateName: step.templateName || `Step ${index + 1}`,
          action: step.action || '',
          inputs: step.inputs || '',
          outputs: step.outputs || '',
          triggersNext: step.triggersNext || '',
          cantonPrivacy: step.cantonPrivacy || '',
          notes: step.notes || ''
        }));

        await db.insert(cantonFlowSteps).values(stepInserts);
      }

      // Fetch the created flow with steps
      const flowWithSteps = await db.query.cantonFlows.findFirst({
        where: (flows, { eq }) => eq(flows.id, flowId),
        with: {
          steps: {
            orderBy: (steps, { asc }) => [asc(steps.step)]
          }
        }
      });

      return successResponse({
        flow: flowWithSteps
      });
    } catch (error) {
      console.error('Error creating Canton flow:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create Canton flow' },
        { status: 500 }
      );
    }
  }
);
