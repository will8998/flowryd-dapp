import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { cantonTemplates, templateParticipants } from '@/db/schema';
import { successResponse } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { templateId } = await params;

    // First verify the template exists
    const template = await db.query.cantonTemplates.findFirst({
      where: eq(cantonTemplates.id, templateId)
    });

    if (!template) {
      return Response.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get all participants that can fill this template role
    const participants = await db
      .select({
        id: templateParticipants.id,
        templateId: templateParticipants.templateId,
        templateName: templateParticipants.templateName,
        participantLegacyId: templateParticipants.participantLegacyId,
        organization: templateParticipants.organization,
        criticality: templateParticipants.criticality,
        isSV: templateParticipants.isSV,
        isValidator: templateParticipants.isValidator,
        cantonRole: templateParticipants.cantonRole,
        foundationCategory: templateParticipants.foundationCategory,
        createdAt: templateParticipants.createdAt
      })
      .from(templateParticipants)
      .where(eq(templateParticipants.templateId, templateId));

    return successResponse({
      template: {
        id: template.id,
        name: template.name,
        description: template.description
      },
      participants
    });
  } catch (error) {
    console.error('Error fetching template participants:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch template participants' },
      { status: 500 }
    );
  }
}