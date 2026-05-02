import { z } from 'zod';
import { Types } from 'mongoose';
import { DriverStatus } from '../../drivers/interfaces';
import { KycStatus } from '../../kyc/interfaces';

export const objectIdParamsSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), 'Invalid id'),
});

export const reviewKycSchema = z.object({
  status: z.enum([KycStatus.APPROVED, KycStatus.REJECTED]),
  rejectionReason: z.string().trim().min(3).max(500).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.status === KycStatus.REJECTED && !value.rejectionReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['rejectionReason'],
      message: 'Rejection reason is required when rejecting KYC',
    });
  }
});

export const updateDriverStatusSchema = z.object({
  status: z.enum(Object.values(DriverStatus) as [DriverStatus, ...DriverStatus[]]),
}).strict();
