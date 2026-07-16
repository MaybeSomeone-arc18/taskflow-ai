import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Extract token from authorization headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, session token is missing', 401));
  }

  try {
    const decoded = verifyToken(token);
    
    // Fetch active user
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(new AppError('The user belonging to this session no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized, session token verification failed', 401));
  }
});

// Role restriction middleware
export const restrictTo = (...roles: ('Admin' | 'User')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User session context is missing', 500));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Permission denied, insufficient access levels', 403));
    }

    next();
  };
};
