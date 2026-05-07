import { z } from 'zod';

// ============================================================================
// PAGINATION
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
});

// ============================================================================
// VIDEO FEED QUERY PARAMETERS
// ============================================================================

export const videoFeedQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  category: z
    .enum(['music', 'gaming', 'sports', 'tech', 'entertainment', 'educational', 'others'])
    .optional(),
  search: z
    .string()
    .max(200, 'Search query cannot exceed 200 characters')
    .optional(),
  feed: z
    .enum(['all', 'following'])
    .optional(),
  sort: z
    .enum(['newest', 'trending', 'popular'])
    .default('newest'),
});

// ============================================================================
// MONGODB OBJECT ID VALIDATION
// ============================================================================

export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/, 'Invalid ID format')
  .transform((val) => val);

// ============================================================================
// ERROR HANDLING UTILITY
// ============================================================================

export function validateSchemaOrThrow(schema, data, AppError) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new AppError(messages, 400);
    }
    throw error;
  }
}
