import { NextRequest } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { dealTemplates } from '@/db/schema';
import { withMiddleware, requireAuth, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { requirePermission } from '@/lib/auth/rbac';
import { logAudit, extractRequestMeta } from '@/lib/audit';
import { z } from 'zod';

const createDealTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').trim(),
  description: z.string().max(5000, 'Description is too long').optional(),
  defaultTitle: z.string().max(255, 'Default title is too long').optional(),
  defaultFlowId: z.string().optional(),
  milestonePresets: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number(),
  })).optional(),
});

export const GET = withMiddleware(
  requireAuth(),
  async (_req: NextRequest, ctx: ApiContext) => {
    const templates = await db
      .select()
      .from(dealTemplates)
      .orderBy(desc(dealTemplates.createdAt));

    return successResponse({ templates });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  validateBody(createDealTemplateSchema),
  async (req: NextRequest, ctx: ApiContext) => {
    requirePermission(ctx.user!.role, 'deal.create'); // Admin only for templates

    const body = ctx.body as {
      name: string;
      description?: string;
      defaultTitle?: string;
      defaultFlowId?: string;
      milestonePresets?: Array<{
        title: string;
        description?: string;
        order: number;
      }>;
    };

    const [template] = await db
      .insert(dealTemplates)
      .values({
        name: body.name,
        description: body.description,
        defaultTitle: body.defaultTitle,
        defaultFlowId: body.defaultFlowId,
        milestonePresets: body.milestonePresets ?? null,
        createdBy: ctx.user!.sub,
      })
      .returning();

    const reqMeta = extractRequestMeta(req);
    logAudit({
      userId: ctx.user!.sub,
      orgId: ctx.user!.orgId,
      action: 'deal.create',
      resourceType: 'deal_template',
      resourceId: template.id,
      ...reqMeta,
    });

    return successResponse({ template }, 201);
  },
);