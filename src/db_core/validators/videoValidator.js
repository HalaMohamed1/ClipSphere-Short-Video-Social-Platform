import { z } from 'zod';

export const createVideoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  videoUrl: z
     .string()
     .url('Invalid video URL format')
     .min(1, 'Video URL is required'),
  thumbnailUrl: z
     .string()
     .url('Invalid thumbnail URL format')
     .nullable()
     .optional(),
  category: z
     .enum(['music', 'gaming', 'sports', 'tech', 'entertainment', 'educational', 'others'])
     .default('others'),
  duration: z
     .number()
     .min(1, 'Duration must be at least 1s')
     .max(600, 'Duration cannot exceed 10 minutes'),
  isPublic: z
     .boolean()
     .default(true),
  tags: z
     .array(z.string().max(30))
     .max(10, 'Cannot exceed 10 tags')
     .optional(),
});

export const updateVideoSchema = createVideoSchema.partial();
