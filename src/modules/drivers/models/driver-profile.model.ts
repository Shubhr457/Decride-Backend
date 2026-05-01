import mongoose, { Schema } from 'mongoose';
import { DriverKycStatus, DriverStakingStatus, DriverStatus } from '../interfaces';
import type { IDriverProfile } from '../interfaces';

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

const driverProfileSchema = new Schema<IDriverProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.PENDING,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
      index: true,
    },
    currentLocation: {
      type: geoPointSchema,
      index: '2dsphere',
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    stakingStatus: {
      type: String,
      enum: Object.values(DriverStakingStatus),
      default: DriverStakingStatus.NOT_STAKED,
      index: true,
    },
    kycStatus: {
      type: String,
      enum: Object.values(DriverKycStatus),
      default: DriverKycStatus.NOT_STARTED,
      index: true,
    },
  },
  { timestamps: true },
);

export const DriverProfileModel = mongoose.model<IDriverProfile>('DriverProfile', driverProfileSchema);
