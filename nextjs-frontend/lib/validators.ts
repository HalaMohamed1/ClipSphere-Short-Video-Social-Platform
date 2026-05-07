import { z } from 'zod';

// ============================================================================
// AUTH VALIDATION SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type RegisterData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginData = z.infer<typeof loginSchema>;

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  avatarKey: z
    .string()
    .nullable()
    .optional(),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;

export const updatePreferencesSchema = z.object({
  notificationPreferences: z
    .object({
      inApp: z.object({
        followers: z.boolean().optional(),
        comments: z.boolean().optional(),
        likes: z.boolean().optional(),
        tips: z.boolean().optional(),
      }).optional(),
      email: z.object({
        followers: z.boolean().optional(),
        comments: z.boolean().optional(),
        likes: z.boolean().optional(),
        tips: z.boolean().optional(),
      }).optional(),
    })
    .optional(),
});

export type UpdatePreferencesData = z.infer<typeof updatePreferencesSchema>;

// ============================================================================
// VIDEO VALIDATION SCHEMAS
// ============================================================================

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
  category: z
    .enum(['music', 'gaming', 'sports', 'tech', 'entertainment', 'educational', 'others'])
    .default('others')
    .optional(),
  tags: z
    .array(z.string())
    .max(10, 'A video can only have up to 10 tags')
    .default([])
    .optional(),
});

export type CreateVideoData = z.infer<typeof createVideoSchema>;

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
    .enum(['music', 'gaming', 'sports', 'tech', 'entertainment', 'educational', 'others'])
    .optional(),
  status: z
    .enum(['public', 'private', 'flagged'])
    .optional(),
  tags: z
    .array(z.string())
    .max(10, 'A video can only have up to 10 tags')
    .optional(),
});

export type UpdateVideoData = z.infer<typeof updateVideoSchema>;

// ============================================================================
// REVIEW VALIDATION SCHEMAS
// ============================================================================

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z
    .string()
    .min(3, 'Comment must be at least 3 characters')
    .max(2000, 'Comment cannot exceed 2000 characters'),
});

export type CreateReviewData = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  comment: z
    .string()
    .min(3, 'Comment must be at least 3 characters')
    .max(2000, 'Comment cannot exceed 2000 characters')
    .optional(),
});

export type UpdateReviewData = z.infer<typeof updateReviewSchema>;

// ============================================================================
// PAGINATION VALIDATION
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
}

export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });
  return formatted;
}
