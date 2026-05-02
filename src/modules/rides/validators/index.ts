import { z } from "zod";
import { Types } from "mongoose";
import { VehicleType } from "../../drivers/interfaces";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().trim().min(1).max(250).optional(),
});

export const fareEstimateSchema = z
  .object({
    pickup: locationSchema,
    dropoff: locationSchema,
    vehicleType: z
      .enum(Object.values(VehicleType) as [VehicleType, ...VehicleType[]])
      .optional(),
  })
  .strict();

export const requestRideSchema = fareEstimateSchema
  .extend({
    paymentToken: z.string().trim().min(1).max(20).default("RIDE"),
    metadataHash: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

export const rideIdParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .refine((value) => Types.ObjectId.isValid(value), "Invalid ride id"),
});
