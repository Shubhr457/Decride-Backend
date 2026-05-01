import { z } from 'zod';
import { UserRole } from '../interfaces';

export const updateCurrentUserSchema = z.object({
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(5).max(30).optional(),
  role: z.enum([UserRole.RIDER, UserRole.DRIVER]).optional(),
}).strict();
