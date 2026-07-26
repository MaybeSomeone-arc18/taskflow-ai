import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import AppError from '../utils/AppError';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

export const googleLogin = async (credential: string): Promise<IUser> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new AppError('Invalid Google token payload', 400);
    }
    
    const { sub: googleId, email, name, picture } = payload;
    
    // Check if user exists by googleId
    let user = await User.findOne({ googleId });
    if (user) {
      return user;
    }
    
    // Check if user exists by email to link account
    user = await User.findOne({ email });
    if (user) {
      user.googleId = googleId;
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
      }
      await user.save();
      return user;
    }
    
    // Create new user if neither exists
    user = await User.create({
      email,
      googleId,
      fullName: name || 'Google User',
      avatarUrl: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'G')}&backgroundColor=6366f1`,
      provider: 'google',
      role: 'User',
    });
    
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to authenticate with Google', 401);
  }
};

export const guestLogin = async (): Promise<IUser> => {
  const randomId = crypto.randomBytes(8).toString('hex');
  const email = `guest_${randomId}@taskflow.local`;
  
  const user = await User.create({
    email,
    fullName: 'Guest User',
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${randomId}&backgroundColor=94a3b8`,
    provider: 'guest',
    isGuest: true,
    role: 'User',
  });
  
  return user;
};
