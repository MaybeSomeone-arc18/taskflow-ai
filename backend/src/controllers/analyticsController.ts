import { Request, Response } from 'express';
import * as analyticsService from '../services/analyticsService';
import { sendSuccess } from '../utils/response';
import asyncHandler from '../utils/asyncHandler';

// @desc    Get dashboard metrics stats
// @route   GET /api/v1/analytics/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new Error('User context missing');
  }

  const stats = await analyticsService.getDashboardStats(userId.toString());
  sendSuccess(res, stats, 'Dashboard metrics fetched successfully');
});

// @desc    Get analytics chart datasets
// @route   GET /api/v1/analytics/charts
// @access  Private
export const getChartData = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new Error('User context missing');
  }

  const chartData = await analyticsService.getChartData(userId.toString());
  sendSuccess(res, chartData, 'Analytics charts data fetched successfully');
});
