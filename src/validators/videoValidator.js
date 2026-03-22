import { z } from 'zod';

// Create video validation schema
export const createVideoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  duration: z
    .number()
    .min(1, 'Video duration must be at least 1 second')
    .max(300, 'Video duration cannot exceed 300 seconds (5 minutes)'),
  videoUrl: z
    .string()
    .url('Invalid video URL'),
  thumbnailUrl: z
    .string()
    .url('Invalid thumbnail URL')
    .optional()
    .nullable(),
  category: z
    .enum(['music', 'gaming', 'sports', 'tech', 'entertainment', 'educational'])
    .default('entertainment')
    .optional(),
  tags: z
    .array(z.string())
    .max(10, 'A video can only have up to 10 tags')
    .default([])
    .optional(),
});

// Update video validation schema
export const updateVideoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  category: z
    .enum(['music', 'gaming', 'sports', 'tech', 'entertainment', 'educational'])
    .optional(),
  status: z
    .enum(['public', 'private', 'flagged'])
    .optional(),
  tags: z
    .array(z.string())
    .max(10, 'A video can only have up to 10 tags')
    .optional(),
});
