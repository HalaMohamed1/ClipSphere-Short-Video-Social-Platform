import { z } from 'zod';

export const followUserSchema = z.object({
  followingId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB User ID'),
  notificationsEnabled: z
    .boolean()
    .default(true),
});

export const updateFollowPreferencesSchema = z.object({
  notificationsEnabled: z.boolean(),
});
