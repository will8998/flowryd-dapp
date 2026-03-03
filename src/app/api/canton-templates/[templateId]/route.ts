import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { cantonTemplates } from '@/db/schema';
import { successResponse } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { templateId } = await params;

    // Get template with its participants using the relations
    const template = await db.query.cantonTemplates.findFirst({
      where: eq(cantonTemplates.id, templateId),
      with: {
        templateParticipants: true
      }
    });

    if (!template) {
      return Response.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return successResponse({
      template
    });
  } catch (error) {
    console.error('Error fetching Canton template:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch Canton template' },
      { status: 500 }
    );
  }
}