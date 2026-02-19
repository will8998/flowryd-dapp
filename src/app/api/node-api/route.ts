import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { nodeApiConfigs } from '@/db/schema';
import { withMiddleware, requireAuth, requireRole, validateBody } from '@/lib/api/middleware-chain';
import type { ApiContext } from '@/lib/api/middleware-chain';
import { successResponse } from '@/lib/api/response';
import { z } from 'zod';

const createConfigSchema = z.object({
  endpointUrl: z.string().url().max(512),
  label: z.string().max(255).optional(),
  apiKey: z.string().max(255).optional(),
});

export const GET = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  async (_req: NextRequest, ctx: ApiContext) => {
    const configs = await db
      .select({
        id: nodeApiConfigs.id,
        endpointUrl: nodeApiConfigs.endpointUrl,
        label: nodeApiConfigs.label,
        isActive: nodeApiConfigs.isActive,
        lastHealthAt: nodeApiConfigs.lastHealthAt,
        createdAt: nodeApiConfigs.createdAt,
      })
      .from(nodeApiConfigs)
      .where(eq(nodeApiConfigs.orgId, ctx.user!.orgId));

    return successResponse({ configs });
  },
);

export const POST = withMiddleware(
  requireAuth(),
  requireRole('admin'),
  validateBody(createConfigSchema),
  async (_req: NextRequest, ctx: ApiContext) => {
    const body = ctx.body as z.infer<typeof createConfigSchema>;

    let apiKeyHash: string | undefined;
    if (body.apiKey) {
      const data = new TextEncoder().encode(body.apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      apiKeyHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    const [config] = await db
      .insert(nodeApiConfigs)
      .values({
        orgId: ctx.user!.orgId,
        endpointUrl: body.endpointUrl,
        label: body.label,
        apiKeyHash,
      })
      .returning();

    return successResponse({ config }, 201);
  },
);
