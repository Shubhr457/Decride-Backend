import mongoose, { Schema } from 'mongoose';
import { DriverDocumentStatus, DriverDocumentType } from '../interfaces';
import type { IDriverDocument } from '../interfaces';

const driverDocumentSchema = new Schema<IDriverDocument>(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'DriverProfile',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(DriverDocumentType),
      required: true,
      index: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    ipfsHash: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(DriverDocumentStatus),
      default: DriverDocumentStatus.PENDING,
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

driverDocumentSchema.index({ driverId: 1, type: 1 });

export const DriverDocumentModel = mongoose.model<IDriverDocument>('DriverDocument', driverDocumentSchema);
