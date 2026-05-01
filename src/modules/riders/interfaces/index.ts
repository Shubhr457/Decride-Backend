import type { Document, Types } from 'mongoose';

export interface IRiderProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fullName: string;
  avatarUrl?: string;
  defaultPaymentMethod?: string;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}
