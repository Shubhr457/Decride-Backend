import { z } from 'zod';

export const upsertRiderProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  avatarUrl: z.string().trim().url().optional(),
  defaultPaymentMethod: z.string().trim().max(60).optional(),
}).strict();
