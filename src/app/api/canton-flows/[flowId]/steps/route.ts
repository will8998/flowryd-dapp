import { NextRequest } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/db';
import { cantonFlows, cantonFlowSteps } from '@/db/schema';
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
      return Response.json(
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
    return Response.json(
      { success: false, error: 'Failed to fetch flow steps' },
      { status: 500 }
    );
  }
}