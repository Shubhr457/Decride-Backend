import { z } from 'zod';

export const walletAddressSchema = z.string().trim().min(1, 'Wallet address is required');

export const nonceRequestSchema = z.object({
  walletAddress: walletAddressSchema,
});

export const verifyWalletRequestSchema = z.object({
  walletAddress: walletAddressSchema,
  signature: z.string().trim().min(1, 'Signature is required'),
});
