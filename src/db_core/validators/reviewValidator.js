import { z } from 'zod';

export const createReviewSchema = z.object({
  video: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB Video ID'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .min(3, 'Comment must be at least 3 characters')
    .max(2000, 'Comment cannot exceed 2000 characters'),
});

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  comment: z
    .string()
    .min(3, 'Comment must be at least 3 characters')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .optional(),
});
