import { z } from 'zod';

export const userRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Allowed: letters, numbers, underscores, hyphens'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password needs an uppercase letter')
    .regex(/[0-9]/, 'Password needs a number'),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  avatarKey: z
    .string()
    .nullable()
    .optional(),
});

export const userUpdateSchema = userRegistrationSchema.partial().omit({ email: true, username: true }).extend({
  email: z.string().email('Invalid email format').optional(),
  username: z.string().min(3).max(30).optional(),
});
