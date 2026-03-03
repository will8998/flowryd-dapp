import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { cantonFlows, cantonFlowSteps } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { flowId } = await params;

    // Get flow with all its steps (ordered by step number) and template info
    const flow = await db.query.cantonFlows.findFirst({
      where: eq(cantonFlows.id, flowId),
      with: {
        steps: {
          orderBy: (steps, { asc }) => [asc(steps.step)],
          with: {
            template: true
          }
        }
      }
    });

    if (!flow) {
      return NextResponse.json(
        { success: false, error: 'Flow not found' },
        { status: 404 }
      );
    }

    return successResponse({
      flow
    });
  } catch (error) {
    console.error('Error fetching Canton flow:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Canton flow' },
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

// PUT — update flow (admin only)
export const PUT = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const { flowId } = ctx.params!;
      const body = await req.json();
      const { name, category, description, source, status, steps } = body;

      // Check if flow exists
      const existingFlow = await db.query.cantonFlows.findFirst({
        where: eq(cantonFlows.id, flowId)
      });

      if (!existingFlow) {
        return NextResponse.json(
          { success: false, error: 'Flow not found' },
          { status: 404 }
        );
      }

      // Update flow fields
      await db
        .update(cantonFlows)
        .set({
          name: name || existingFlow.name,
          category: category !== undefined ? category : existingFlow.category,
          description: description !== undefined ? description : existingFlow.description,
          source: source !== undefined ? source : existingFlow.source,
          status: status || existingFlow.status,
          stepCount: steps !== undefined ? (steps as StepInput[]).length : existingFlow.stepCount,
          updatedAt: new Date()
        })
        .where(eq(cantonFlows.id, flowId));

      // If steps array is provided, replace all existing steps
      if (steps !== undefined) {
        const typedSteps = steps as StepInput[];

        // Validate all steps have valid templateId
        for (const step of typedSteps) {
          if (!step.templateId) {
            return NextResponse.json(
              { success: false, error: 'Each step requires a valid templateId' },
              { status: 400 }
            );
          }
        }

        // Delete existing steps
        await db.delete(cantonFlowSteps).where(eq(cantonFlowSteps.flowId, flowId));

        // Insert new steps
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
      }

      // Fetch the updated flow with steps
      const flowWithSteps = await db.query.cantonFlows.findFirst({
        where: eq(cantonFlows.id, flowId),
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
      console.error('Error updating Canton flow:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update Canton flow' },
        { status: 500 }
      );
    }
  }
);

// DELETE — delete flow and its steps (admin only)
export const DELETE = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (_req: NextRequest, ctx: ApiContext) => {
    try {
      const { flowId } = ctx.params!;

      // Check if flow exists
      const existingFlow = await db.query.cantonFlows.findFirst({
        where: eq(cantonFlows.id, flowId)
      });

      if (!existingFlow) {
        return NextResponse.json(
          { success: false, error: 'Flow not found' },
          { status: 404 }
        );
      }

      // Delete steps first (cascade)
      await db.delete(cantonFlowSteps).where(eq(cantonFlowSteps.flowId, flowId));

      // Delete flow
      await db.delete(cantonFlows).where(eq(cantonFlows.id, flowId));

      return successResponse({
        message: 'Flow deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting Canton flow:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete Canton flow' },
        { status: 500 }
      );
    }
  }
);
