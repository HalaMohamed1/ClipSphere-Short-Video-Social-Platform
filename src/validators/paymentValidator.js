import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdString = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), { message: 'Invalid id' });

export const createCheckoutSessionSchema = z.object({
  creatorId: objectIdString,
  /** Amount in cents (smallest currency unit). Stripe USD minimum is 50. */
  amount: z.number().int().min(50, 'Minimum tip is 50 cents').max(99999999),
  currency: z.string().length(3).toLowerCase().default('usd'),
  /** Used to build cancel_url back to the video page */
  videoId: objectIdString.optional(),
});

export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['all', 'recipient', 'sender']).default('all'),
});

/** Body for POST …/payments/sync-checkout-session after Stripe redirects back. */
export const syncCheckoutSessionSchema = z.object({
  sessionId: z.string().min(10, 'Invalid session id'),
});
