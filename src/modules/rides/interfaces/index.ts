import type { Document, Types } from 'mongoose';
import type { GeoPoint, VehicleType } from '../../drivers/interfaces';

export enum RideStatus {
  REQUESTED = 'requested',
  SEARCHING = 'searching',
  MATCHED = 'matched',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
  EXPIRED = 'expired',
}

export enum RideCancellationReason {
  RIDER_CANCELLED = 'rider_cancelled',
  DRIVER_CANCELLED = 'driver_cancelled',
  NO_DRIVER_AVAILABLE = 'no_driver_available',
  SYSTEM_EXPIRED = 'system_expired',
}

export interface FareBreakdown {
  currency: string;
  baseFare: number;
  distanceFare: number;
  durationFare: number;
  platformFee: number;
  totalFare: number;
}

export interface IRide extends Document {
  _id: Types.ObjectId;
  riderId: Types.ObjectId;
  driverId?: Types.ObjectId;
  status: RideStatus;
  pickupLocation: GeoPoint;
  dropoffLocation: GeoPoint;
  pickupAddress?: string;
  dropoffAddress?: string;
  vehicleType?: VehicleType;
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  estimatedFare: number;
  finalFare?: number;
  fareBreakdown: FareBreakdown;
  paymentToken: string;
  onChainRideId?: string;
  metadataHash?: string;
  cancellationReason?: RideCancellationReason;
  requestedAt: Date;
  matchedAt?: Date;
  acceptedAt?: Date;
  arrivedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  expiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
