import mongoose, { Schema } from 'mongoose';
import { RideCancellationReason, RideStatus } from '../interfaces';
import type { IRide } from '../interfaces';
import { VehicleType } from '../../drivers/interfaces';

const geoPointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value: number[]) => value.length === 2,
        message: 'Coordinates must include longitude and latitude',
      },
    },
  },
  { _id: false },
);

const fareBreakdownSchema = new Schema(
  {
    currency: { type: String, required: true, default: 'USD' },
    baseFare: { type: Number, required: true, min: 0 },
    distanceFare: { type: Number, required: true, min: 0 },
    durationFare: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    totalFare: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const rideSchema = new Schema<IRide>(
  {
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'DriverProfile',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
      index: true,
    },
    pickupLocation: {
      type: geoPointSchema,
      required: true,
      index: '2dsphere',
    },
    dropoffLocation: {
      type: geoPointSchema,
      required: true,
    },
    pickupAddress: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    dropoffAddress: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
    },
    estimatedDistanceKm: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDurationMin: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedFare: {
      type: Number,
      required: true,
      min: 0,
    },
    finalFare: {
      type: Number,
      min: 0,
    },
    fareBreakdown: {
      type: fareBreakdownSchema,
      required: true,
    },
    paymentToken: {
      type: String,
      required: true,
      default: 'RIDE',
      trim: true,
      uppercase: true,
    },
    onChainRideId: {
      type: String,
      trim: true,
    },
    metadataHash: {
      type: String,
      trim: true,
    },
    cancellationReason: {
      type: String,
      enum: Object.values(RideCancellationReason),
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    matchedAt: Date,
    acceptedAt: Date,
    arrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    expiredAt: Date,
  },
  { timestamps: true },
);

rideSchema.index({ status: 1, driverId: 1 });
rideSchema.index({ riderId: 1, createdAt: -1 });

export const RideModel = mongoose.model<IRide>('Ride', rideSchema);
