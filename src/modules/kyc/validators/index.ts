import { z } from 'zod';
import { UserRole } from '../../users/interfaces';
import { DriverDocumentType, KycProvider } from '../interfaces';

export const startKycSchema = z.object({
  role: z.enum([UserRole.RIDER, UserRole.DRIVER]),
  provider: z.enum(Object.values(KycProvider) as [KycProvider, ...KycProvider[]]).default(KycProvider.MOCK),
}).strict();

export const driverDocumentSchema = z.object({
  type: z.enum(Object.values(DriverDocumentType) as [DriverDocumentType, ...DriverDocumentType[]]),
  fileUrl: z.string().trim().url(),
  ipfsHash: z.string().trim().min(1).optional(),
}).strict();
