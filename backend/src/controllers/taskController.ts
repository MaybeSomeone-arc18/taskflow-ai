import { Request, Response, NextFunction } from 'express';
import * as taskService from '../services/taskService';
import Project from '../models/Project';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import asyncHandler from '../utils/asyncHandler';
import { logActivity } from '../services/activityService';

// Project ownership check has been moved to loadProject middleware in projectAuth.ts

// @desc    Create a new task
// @route   POST /api/v1/tasks
// @access  Private
export const createTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, status, priority, dueDate, estimatedHours, actualHours, tags, projectId, assignedTo } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  // Middleware loadProject has already verified membership and attached req.project
  const project = (req as any).project;

  if (assignedTo) {
    const isValidMember = project.members.some((m: any) => m.userId.toString() === assignedTo.toString());
    if (!isValidMember) {
      return next(new AppError('Invalid assignment: User is not a member of this project', 400));
    }
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

  await logActivity(projectId.toString(), userId.toString(), 'Task Created', `Created task "${title}"`, task._id.toString());
  if (assignedTo) {
    await logActivity(projectId.toString(), userId.toString(), 'Task Assigned', `Assigned task to ${assignedTo}`, task._id.toString());
  }

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

  // Filter tasks to projects the user is a member of or created
  let targetProjectIds: string[] = [];

  if (projectId) {
    // Single project filter (middleware typically not used here since it's a GET / query param, 
    // so we verify membership inline for safety)
    const project = await Project.findById(projectId as string);
    if (!project) return sendSuccess(res, { tasks: [], total: 0, pages: 0 }, 'No tasks found');
    
    // Auto-migrate backward compatibility
    if (!project.members || project.members.length === 0) {
      project.members = [{ userId: project.createdBy, joinedAt: project.createdAt || new Date() }];
    }
    const isMember = project.members.some((m: any) => m.userId.toString() === userId.toString()) || project.createdBy.toString() === userId.toString();
    
    if (!isMember) {
      return sendSuccess(res, { tasks: [], total: 0, pages: 0 }, 'No tasks found');
    }
    targetProjectIds = [projectId as string];
  } else {
    // All shared + owned projects
    const userProjects = await Project.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId }
      ]
    });
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
  const task = (req as any).task; // populated by loadTask middleware
  // Membership check is done by loadProject middleware

  sendSuccess(res, task, 'Task details fetched successfully');
});

// @desc    Update task details (Project owner only)
// @route   PATCH /api/v1/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const task = (req as any).task; // populated by loadTask middleware
  const project = (req as any).project; // populated by loadProject middleware

  if (req.body.assignedTo !== undefined) {
    const isValidMember = req.body.assignedTo === null || project.members.some((m: any) => m.userId.toString() === req.body.assignedTo.toString());
    if (!isValidMember) {
      return next(new AppError('Invalid assignment: User is not a member of this project', 400));
    }
  }

  const updated = await taskService.updateTask(task._id.toString(), req.body);

  const userId = req.user?._id;
  if (userId) {
    if (req.body.status && req.body.status !== task.status) {
      if (req.body.status === 'Completed') {
        await logActivity(task.projectId.toString(), userId.toString(), 'Task Completed', `Completed task "${task.title}"`, task._id.toString());
      } else {
        await logActivity(task.projectId.toString(), userId.toString(), 'Task Status Changed', `Changed task status to ${req.body.status}`, task._id.toString());
      }
    }
    
    if (req.body.assignedTo !== undefined && req.body.assignedTo !== task.assignedTo?.toString()) {
      if (req.body.assignedTo === null) {
        await logActivity(task.projectId.toString(), userId.toString(), 'Task Unassigned', `Removed assignment from task`, task._id.toString());
      } else {
        await logActivity(task.projectId.toString(), userId.toString(), 'Task Assigned', `Assigned task to ${req.body.assignedTo}`, task._id.toString());
      }
    }
  }

  sendSuccess(res, updated, 'Task updated successfully');
});

// @desc    Delete task (Project owner only)
// @route   DELETE /api/v1/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const task = (req as any).task; // populated by loadTask middleware
  await taskService.deleteTask(task._id.toString());
  
  const userId = req.user?._id;
  if (userId) {
    await logActivity(task.projectId.toString(), userId.toString(), 'Task Deleted', `Deleted task "${task.title}"`, task._id.toString());
  }

  sendSuccess(res, null, 'Task deleted successfully');
});

// @desc    Get all tasks belonging to a single project (Owner only check)
// @route   GET /api/v1/projects/:projectId/tasks
// @access  Private
export const getTasksByProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // loadProject middleware handles finding the project and checking membership
  const project = (req as any).project;

  const { status, priority, search, page, limit, sortBy, sortOrder } = req.query;
  const parsedLimit = Math.min(100, parseInt(limit as string) || 10);
  const parsedPage = Math.max(1, parseInt(page as string) || 1);

  const result = await taskService.getTasks(
    {
      projectId: project._id.toString(),
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

// @desc    Bulk create AI generated tasks (Project owner only)
// @route   POST /api/v1/tasks/import-ai
// @access  Private
export const importAITasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { projectId, tasks } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  if (!projectId || !tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return next(new AppError('Invalid payload: projectId and non-empty tasks array are required', 400));
  }

  // loadProject middleware has already authorized access

  // Format tasks for insertion
  const tasksData = tasks.map((task: any) => ({
    title: task.title,
    description: task.description || '',
    status: task.status || 'Todo',
    priority: task.priority || 'Medium',
    dueDate: task.dueDate || undefined,
    estimatedHours: task.estimatedHours || 0,
    actualHours: 0,
    tags: task.tags || [],
    projectId,
    createdBy: userId,
  }));

  const createdTasks = await taskService.createTasksBulk(tasksData);
  sendSuccess(res, createdTasks, `${createdTasks.length} AI tasks imported successfully`, 201);
});
