import { z } from 'zod';

/**
 * Validation Schemas for Phase 3 - Real-Time System & Monetization
 */

// ============= TIP/PAYMENT SCHEMAS =============

/**
 * Schema for creating a tip/checkout session
 * Used when user wants to tip a creator
 */
export const tipPaymentSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .min(1, 'Minimum tip is $1')
    .max(10000, 'Maximum tip is $10,000')
    .multipleOf(0.01, 'Amount must be in cents'),

  videoId: z
    .string()
    .min(1, 'Video ID is required')
    .regex(/^[a-f\d]{24}$/i, 'Invalid video ID format'),

  message: z
    .string()
    .max(500, 'Tip message cannot exceed 500 characters')
    .optional(),

  anonymous: z
    .boolean()
    .default(false),
});

/**
 * Schema for stripe webhook events
 */
export const stripeWebhookSchema = z.object({
  id: z.string(),
  object: z.string(),
  type: z.enum(['checkout.session.completed', 'payment_intent.succeeded']),
  data: z.object({
    object: z.object({
      id: z.string(),
      client_secret: z.string().optional(),
      payment_intent: z.string().optional(),
      metadata: z.record(z.string()).optional(),
      status: z.string(),
    }),
  }),
});

/**
 * Schema for transaction history query
 */
export const transactionQuerySchema = z.object({
  userId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid user ID format')
    .optional(),

  status: z
    .enum(['pending', 'completed', 'failed', 'refunded'])
    .optional(),

  page: z
    .number()
    .int()
    .positive()
    .default(1),

  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10),

  sortBy: z
    .enum(['date', 'amount'])
    .default('date'),

  order: z
    .enum(['asc', 'desc'])
    .default('desc'),
});

// ============= ENGAGEMENT/NOTIFICATION SCHEMAS =============

/**
 * Schema for notification preference updates
 */
export const notificationPreferenceSchema = z.object({
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
});

/**
 * Schema for engagement notification data
 * (Sent via Socket.io)
 */
export const engagementNotificationSchema = z.object({
  type: z.enum(['like', 'comment', 'follow', 'tip']),
  senderId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid sender ID'),
  senderUsername: z.string().min(1),
  videoId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid video ID').optional(),
  videoTitle: z.string().min(1).optional(),
  message: z.string().max(500).optional(),
  amount: z.number().positive().optional(),
  timestamp: z.date().default(() => new Date()),
});

// ============= REVIEW SCHEMAS (Phase 3 Updates) =============

/**
 * Schema for submitting a review/rating
 */
export const reviewSubmissionSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),

  comment: z
    .string()
    .min(0)
    .max(500, 'Comment cannot exceed 500 characters')
    .optional(),
});

// ============= VIDEO INTERACTION SCHEMAS =============

/**
 * Schema for like action validation
 */
export const likeActionSchema = z.object({
  videoId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid video ID format'),
});

/**
 * Schema for comment action validation
 */
export const commentActionSchema = z.object({
  videoId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid video ID format'),

  text: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment cannot exceed 500 characters'),
});

// ============= FOLLOW/SOCIAL SCHEMAS =============

/**
 * Schema for follow action validation
 */
export const followActionSchema = z.object({
  userId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid user ID format'),
});

// ============= UTILITY FUNCTIONS =============

/**
 * Validate data against schema and return result with errors
 */
export const validateSchema = (schema, data) => {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { valid: false, data: null, errors };
    }
    return { valid: false, data: null, errors: [{ message: error.message }] };
  }
};

/**
 * Express middleware for schema validation
 * Usage: app.post('/route', validateRequest(tipPaymentSchema), controller)
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const result = validateSchema(schema, req.body);
    if (!result.valid) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors: result.errors,
      });
    }
    req.body = result.data;
    next();
  };
};
