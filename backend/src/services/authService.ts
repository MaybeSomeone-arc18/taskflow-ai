import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import AppError from '../utils/AppError';

export const registerUser = async (
  fullName: string,
  email: string,
  password: string
): Promise<IUser> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email address', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate generic initial avatar
  const seed = encodeURIComponent(fullName);
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=6366f1`;

  const user = await User.create({
    email,
    passwordHash,
    fullName,
    avatarUrl,
    role: 'User', // Defaults to 'User'
  });

  return user;
};

export const authenticateUser = async (email: string, password: string): Promise<IUser> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  return user;
};
