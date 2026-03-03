import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z
    .string()
    .max(10000, 'Message is too long'),
  threadId: z.string().uuid('Invalid thread ID').optional(),
  contentType: z.enum(['text', 'file', 'system']).default('text'),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
}).refine(
  (data) => {
    // For text messages, content must not be empty
    if (data.contentType === 'text') return data.content.trim().length > 0;
    // For file messages, content can be empty (we'll default it)
    return true;
  },
  { message: 'Message cannot be empty', path: ['content'] },
);

export const editMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(10000, 'Message is too long'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type EditMessageInput = z.infer<typeof editMessageSchema>;
