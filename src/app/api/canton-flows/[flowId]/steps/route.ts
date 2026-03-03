import { NextRequest, NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
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

    // First verify the flow exists
    const flow = await db.query.cantonFlows.findFirst({
      where: eq(cantonFlows.id, flowId)
    });

    if (!flow) {
      return NextResponse.json(
        { success: false, error: 'Flow not found' },
        { status: 404 }
      );
    }

    // Get ordered steps for the flow with template info and eligible participants
    const steps = await db.query.cantonFlowSteps.findMany({
      where: eq(cantonFlowSteps.flowId, flowId),
      orderBy: [asc(cantonFlowSteps.step)],
      with: {
        template: {
          with: {
            templateParticipants: true
          }
        }
      }
    });

    // Transform the data to include step details and eligible participants
    const stepsWithParticipants = steps.map(step => ({
      id: step.id,
      flowId: step.flowId,
      step: step.step,
      templateId: step.templateId,
      templateName: step.templateName,
      action: step.action,
      inputs: step.inputs,
      outputs: step.outputs,
      triggersNext: step.triggersNext,
      cantonPrivacy: step.cantonPrivacy,
      notes: step.notes,
      createdAt: step.createdAt,
      template: {
        id: step.template.id,
        name: step.template.name,
        description: step.template.description,
        category: step.template.category,
        iconName: step.template.iconName,
        color: step.template.color
      },
      eligibleParticipants: step.template.templateParticipants.map(tp => ({
        id: tp.id,
        participantLegacyId: tp.participantLegacyId,
        organization: tp.organization,
        criticality: tp.criticality,
        isSV: tp.isSV,
        isValidator: tp.isValidator,
        cantonRole: tp.cantonRole,
        foundationCategory: tp.foundationCategory
      }))
    }));

    return successResponse({
      flow: {
        id: flow.id,
        name: flow.name,
        description: flow.description,
        category: flow.category,
        status: flow.status
      },
      steps: stepsWithParticipants
    });
  } catch (error) {
    console.error('Error fetching flow steps:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flow steps' },
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

// POST — replace all steps for a flow (admin only)
export const POST = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const { flowId } = ctx.params!;
      const body = await req.json();
      const { steps = [] } = body;
      const typedSteps = steps as StepInput[];

      // First verify the flow exists
      const flow = await db.query.cantonFlows.findFirst({
        where: eq(cantonFlows.id, flowId)
      });

      if (!flow) {
        return NextResponse.json(
          { success: false, error: 'Flow not found' },
          { status: 404 }
        );
      }

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

      // Update step count in flow
      await db
        .update(cantonFlows)
        .set({
          stepCount: typedSteps.length,
          updatedAt: new Date()
        })
        .where(eq(cantonFlows.id, flowId));

      // Get updated steps with template info
      const updatedSteps = await db.query.cantonFlowSteps.findMany({
        where: eq(cantonFlowSteps.flowId, flowId),
        orderBy: [asc(cantonFlowSteps.step)],
        with: {
          template: {
            with: {
              templateParticipants: true
            }
          }
        }
      });

      const stepsWithParticipants = updatedSteps.map(step => ({
        id: step.id,
        flowId: step.flowId,
        step: step.step,
        templateId: step.templateId,
        templateName: step.templateName,
        action: step.action,
        inputs: step.inputs,
        outputs: step.outputs,
        triggersNext: step.triggersNext,
        cantonPrivacy: step.cantonPrivacy,
        notes: step.notes,
        createdAt: step.createdAt,
        template: step.template ? {
          id: step.template.id,
          name: step.template.name,
          description: step.template.description,
          category: step.template.category,
          iconName: step.template.iconName,
          color: step.template.color
        } : null,
        eligibleParticipants: step.template?.templateParticipants?.map(tp => ({
          id: tp.id,
          participantLegacyId: tp.participantLegacyId,
          organization: tp.organization,
          criticality: tp.criticality,
          isSV: tp.isSV,
          isValidator: tp.isValidator,
          cantonRole: tp.cantonRole,
          foundationCategory: tp.foundationCategory
        })) || []
      }));

      return successResponse({
        flow: {
          id: flow.id,
          name: flow.name,
          description: flow.description,
          category: flow.category,
          status: flow.status
        },
        steps: stepsWithParticipants
      });
    } catch (error) {
      console.error('Error replacing flow steps:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to replace flow steps' },
        { status: 500 }
      );
    }
  }
);
