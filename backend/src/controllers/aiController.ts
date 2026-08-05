import { Request, Response, NextFunction } from 'express';
import * as geminiService from '../services/geminiService';
import Project from '../models/Project';
import Task from '../models/Task';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import asyncHandler from '../utils/asyncHandler';

// @desc    Break down a task into subtasks
// @route   POST /api/v1/ai/task-breakdown
// @access  Private
export const getTaskBreakdown = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return next(new AppError('Task title is required for a breakdown', 400));
  }

  const breakdown = await geminiService.breakdownTask(title.trim(), description?.trim());
  sendSuccess(res, breakdown, 'Task breakdown generated successfully');
});

// @desc    Generate daily plan from pending tasks
// @route   POST /api/v1/ai/daily-plan
// @access  Private
export const getDailyPlan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new Error('User context missing');
  }

  // Load all pending tasks belonging to projects owned or shared by user
  const userProjects = await Project.find({ 
    $or: [
      { createdBy: userId },
      { 'members.userId': userId }
    ]
  });
  const projectIds = userProjects.map((p) => p._id);

  if (projectIds.length === 0) {
    return sendSuccess(res, { plan: [] }, 'No pending tasks to plan');
  }

  const pendingTasks = await Task.find({
    projectId: { $in: projectIds },
    status: { $ne: 'Completed' },
    $or: [
      { assignedTo: userId },
      { assignedTo: null }
    ]
  }).select('title priority estimatedHours dueDate');

  if (pendingTasks.length === 0) {
    return sendSuccess(res, { plan: [] }, 'No pending tasks to plan');
  }

  const plan = await geminiService.generateDailyPlan(pendingTasks);
  sendSuccess(res, plan, 'Daily productivity plan generated successfully');
});

// @desc    Analyze project health metrics (Owner only)
// @route   POST /api/v1/ai/project-health
// @access  Private
export const getProjectHealth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // loadProject middleware handles finding the project and checking membership
  const project = (req as any).project;

  const tasks = await Task.find({ projectId: project._id }).select('title status priority dueDate');

  // Compute metrics
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 105) : 0;

  const healthReport = await geminiService.analyzeProjectHealth(
    { title: project.title, description: project.description },
    tasks,
    Math.min(100, completionPercentage)
  );

  sendSuccess(res, healthReport, 'Project health diagnostics generated successfully');
});

// @desc    Generate sprint summaries retrospect (Owner only)
// @route   POST /api/v1/ai/sprint-summary
// @access  Private
export const getSprintSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // loadProject middleware handles finding the project and checking membership
  const project = (req as any).project;

  const completedTasks = await Task.find({ projectId: project._id, status: 'Completed' }).select('title');
  const pendingTasks = await Task.find({ projectId: project._id, status: { $ne: 'Completed' } }).select('title status priority');

  const summary = await geminiService.generateSprintSummary(completedTasks, pendingTasks);
  sendSuccess(res, summary, 'Sprint retrospective summary generated successfully');
});
