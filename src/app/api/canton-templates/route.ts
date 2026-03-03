import { asc, sql } from 'drizzle-orm';
import { db } from '@/db';
import { cantonTemplates, templateParticipants } from '@/db/schema';
import { successResponse } from '@/lib/api/response';

export async function GET() {
  try {
    // Get all templates with participant count
    const templates = await db
      .select({
        id: cantonTemplates.id,
        name: cantonTemplates.name,
        description: cantonTemplates.description,
        category: cantonTemplates.category,
        participantColumn: cantonTemplates.participantColumn,
        iconName: cantonTemplates.iconName,
        color: cantonTemplates.color,
        sortOrder: cantonTemplates.sortOrder,
        createdAt: cantonTemplates.createdAt,
        updatedAt: cantonTemplates.updatedAt,
        participantCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${templateParticipants} 
          WHERE ${templateParticipants.templateId} = ${cantonTemplates.id}
        )`.as('participantCount')
      })
      .from(cantonTemplates)
      .orderBy(asc(cantonTemplates.sortOrder));

    return successResponse({
      templates
    });
  } catch (error) {
    console.error('Error fetching Canton templates:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch Canton templates' },
      { status: 500 }
    );
  }
}