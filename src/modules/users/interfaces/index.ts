import type { Document, Types } from 'mongoose';

export enum UserRole {
  RIDER = 'rider',
  DRIVER = 'driver',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  walletAddress: string;
  role: UserRole;
  status: UserStatus;
  nonce: string;
  email?: string;
  phone?: string;
  profileCompleted: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
