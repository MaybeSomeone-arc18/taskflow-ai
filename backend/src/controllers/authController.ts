import { Request, Response, NextFunction } from 'express';
import { generateToken } from '../utils/jwt';
import * as authService from '../services/authService';
import { sendSuccess } from '../utils/response';
import asyncHandler from '../utils/asyncHandler';

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  const user = await authService.registerUser(fullName, email, password);
  const token = generateToken(user._id.toString());

  sendSuccess(
    res,
    {
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    },
    'User registered successfully',
    201
  );
});

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await authService.authenticateUser(email, password);
  const token = generateToken(user._id.toString());

  sendSuccess(
    res,
    {
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    },
    'User logged in successfully'
  );
});

// @desc    Get current user details
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new Error('User context missing');
  }

  sendSuccess(
    res,
    {
      user: {
        _id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        avatarUrl: req.user.avatarUrl,
        role: req.user.role,
      },
    },
    'User details fetched successfully'
  );
});

// @desc    Logout user (stateless invalidate notice)
// @route   POST /api/v1/auth/logout
// @access  Public
export const logout = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, null, 'User logged out successfully');
});
