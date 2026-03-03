import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { cantonFlows } from '@/db/schema';
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
      return Response.json(
        { success: false, error: 'Flow not found' },
        { status: 404 }
      );
    }

    return successResponse({
      flow
    });
  } catch (error) {
    console.error('Error fetching Canton flow:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch Canton flow' },
      { status: 500 }
    );
  }
}