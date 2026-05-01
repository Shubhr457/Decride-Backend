import type { IUser } from '../interfaces';

interface UpdateCurrentUserInput {
  email?: string;
  phone?: string;
  role?: IUser['role'];
}

export const updateCurrentUser = async (user: IUser, input: UpdateCurrentUserInput): Promise<IUser> => {
  if (input.email !== undefined) user.email = input.email;
  if (input.phone !== undefined) user.phone = input.phone;
  if (input.role !== undefined) user.role = input.role;

  await user.save();
  return user;
};
