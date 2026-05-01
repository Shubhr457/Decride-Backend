import mongoose, { Schema } from 'mongoose';
import type { IRiderProfile } from '../interfaces';

const riderProfileSchema = new Schema<IRiderProfile>(
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
    defaultPaymentMethod: {
      type: String,
      trim: true,
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
  },
  { timestamps: true },
);

export const RiderProfileModel = mongoose.model<IRiderProfile>('RiderProfile', riderProfileSchema);
