import { z } from 'zod';

export const createFlowSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title is too long')
    .trim(),
  description: z.string().max(5000, 'Description is too long').optional(),
  workflowType: z.string().max(64).optional(),
});

export const updateFlowSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  description: z.string().max(5000).optional(),
  workflowType: z.string().max(64).optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

const nodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.record(z.string(), z.unknown()),
}).passthrough();

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
}).passthrough();

export const saveVersionSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }).optional(),
  snapshotName: z.string().max(255).optional(),
});

export const publishFlowSchema = z.object({
  isTemplate: z.boolean().optional(),
});

export type CreateFlowInput = z.infer<typeof createFlowSchema>;
export type UpdateFlowInput = z.infer<typeof updateFlowSchema>;
export type SaveVersionInput = z.infer<typeof saveVersionSchema>;
export type PublishFlowInput = z.infer<typeof publishFlowSchema>;
