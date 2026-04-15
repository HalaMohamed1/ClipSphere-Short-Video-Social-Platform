import { z } from 'zod';

export const presignSchema = z.object({
  contentType: z.string().min(1, 'contentType is required'),
  filename: z.string().optional(),
  kind: z.enum(['video', 'thumbnail']).default('video'),
});
