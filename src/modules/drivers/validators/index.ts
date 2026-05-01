import { z } from 'zod';
import { VehicleType } from '../interfaces';

export const upsertDriverProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  avatarUrl: z.string().trim().url().optional(),
}).strict();

export const driverAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
}).strict();

export const driverLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
}).strict();

export const createVehicleSchema = z.object({
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.number().int().min(1990).max(2100),
  color: z.string().trim().min(1).max(40),
  plateNumber: z.string().trim().min(2).max(20),
  vehicleType: z.enum(Object.values(VehicleType) as [VehicleType, ...VehicleType[]]).default(VehicleType.STANDARD),
}).strict();
