import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import Project from '../models/Project';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import asyncHandler from '../utils/asyncHandler';

// Utility helper to authorize project ownership
const checkProjectOwnership = async (projectId: string, userId: string): Promise<boolean> => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.createdBy.toString() === userId;
};

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Private
export const createTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, status, priority, dueDate, estimatedHours, actualHours, tags, projectId, assignedTo } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  // Verify project ownership
  const isOwner = await checkProjectOwnership(projectId, userId.toString());
  if (!isOwner) {
    return next(new AppError('Permission denied, you do not own the parent project', 403));
  }

  const task = await taskService.createTask({
    title,
    description,
    status: status || 'Todo',
    priority,
    dueDate,
    estimatedHours: estimatedHours || 0,
    actualHours: actualHours || 0,
    tags: tags || [],
    projectId,
    createdBy: userId,
    assignedTo: assignedTo || null,
  });

  sendSuccess(res, task, 'Task created successfully', 201);
});

// @desc    Get all tasks belonging to user owned projects
// @route   GET /api/v1/tasks
// @access  Private
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new Error('User context missing');
  }

  const { projectId, status, priority, search, page, limit, sortBy, sortOrder } = req.query;
  const parsedLimit = Math.min(100, parseInt(limit as string) || 10);
  const parsedPage = Math.max(1, parseInt(page as string) || 1);

  // Filter tasks to only user owned projects
  let targetProjectIds: string[] = [];

  if (projectId) {
    const isOwner = await checkProjectOwnership(projectId as string, userId.toString());
    if (!isOwner) {
      return sendSuccess(res, { tasks: [], total: 0, pages: 0 }, 'No tasks found');
    }
    targetProjectIds = [projectId as string];
  } else {
    const userProjects = await Project.find({ createdBy: userId });
    targetProjectIds = userProjects.map((p) => p._id.toString());
  }

  if (targetProjectIds.length === 0) {
    return sendSuccess(res, { tasks: [], total: 0, pages: 0 }, 'No tasks found');
  }

  const result = await taskService.getTasks(
    {
      projectId: targetProjectIds.length === 1 ? targetProjectIds[0] : undefined,
      status: status as string,
      priority: priority as string,
      search: search as string,
    },
    {
      page: parsedPage,
      limit: parsedLimit,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    }
  );

  // If no single project but querying multiple user projects, filter manually in DB query:
  if (!projectId) {
    // Re-query using projectIds check in filters
    const finalQueryFilters: any = {
      projectId: { $in: targetProjectIds },
      status: status as string,
      priority: priority as string,
      search: search as string,
    };
    const finalResult = await taskService.getTasks(finalQueryFilters, {
      page: parsedPage,
      limit: parsedLimit,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    });
    return sendSuccess(res, finalResult, 'Tasks fetched successfully');
  }

  sendSuccess(res, result, 'Tasks fetched successfully');
});

// @desc    Get details of a single task (Project owner only)
// @route   GET /api/v1/tasks/:id
// @access  Private
export const getTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const task = await taskService.getTaskById(id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  // Authorization check
  const isOwner = await checkProjectOwnership(task.projectId.toString(), userId.toString());
  if (!isOwner) {
    return next(new AppError('Permission denied, you do not own the parent project', 403));
  }

  sendSuccess(res, task, 'Task details fetched successfully');
});

// @desc    Update task details (Project owner only)
// @route   PATCH /api/v1/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const task = await taskService.getTaskById(id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  // Authorization check
  const isOwner = await checkProjectOwnership(task.projectId.toString(), userId.toString());
  if (!isOwner) {
    return next(new AppError('Permission denied, you do not own the parent project', 403));
  }

  const updated = await taskService.updateTask(id, req.body);
  sendSuccess(res, updated, 'Task updated successfully');
});

// @desc    Delete task (Project owner only)
// @route   DELETE /api/v1/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const task = await taskService.getTaskById(id);
  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  // Authorization check
  const isOwner = await checkProjectOwnership(task.projectId.toString(), userId.toString());
  if (!isOwner) {
    return next(new AppError('Permission denied, you do not own the parent project', 403));
  }

  await taskService.deleteTask(id);
  sendSuccess(res, null, 'Task deleted successfully');
});

// @desc    Get all tasks belonging to a single project (Owner only check)
// @route   GET /api/v1/projects/:projectId/tasks
// @access  Private
export const getTasksByProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const isOwner = await checkProjectOwnership(projectId, userId.toString());
  if (!isOwner) {
    return next(new AppError('Permission denied, you do not own this project', 403));
  }

  const { status, priority, search, page, limit, sortBy, sortOrder } = req.query;
  const parsedLimit = Math.min(100, parseInt(limit as string) || 10);
  const parsedPage = Math.max(1, parseInt(page as string) || 1);

  const result = await taskService.getTasks(
    {
      projectId,
      status: status as string,
      priority: priority as string,
      search: search as string,
    },
    {
      page: parsedPage,
      limit: parsedLimit,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    }
  );

  sendSuccess(res, result, 'Project tasks fetched successfully');
});
