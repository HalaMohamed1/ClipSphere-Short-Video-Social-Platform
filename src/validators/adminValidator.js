import { z } from 'zod';

export const updateAdminUserStatusSchema = z
  .object({
    status: z.enum(['active', 'suspended', 'flagged']).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => data.status !== undefined || data.active !== undefined, {
    message: 'Provide at least one of status or active',
  });
