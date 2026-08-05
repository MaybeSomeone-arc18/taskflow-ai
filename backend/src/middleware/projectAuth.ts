import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';

// Extend Express Request type to include project
declare global {
  namespace Express {
    interface Request {
      project?: any; // Will be properly typed in a real scenario
    }
  }
}

export const loadProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Check common places for project ID
  const projectId = req.params.projectId || req.params.id || req.body.projectId;

  if (!projectId) {
    return next(new AppError('Project ID is required', 400));
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new Error('User context missing');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  // Backward compatibility: If members array is empty or missing, assume createdBy is the sole member
  if (!project.members || project.members.length === 0) {
    project.members = [{ userId: project.createdBy, joinedAt: project.createdAt || new Date() }];
  }

  // Verify membership
  const isMember = project.members.some((member: any) => member.userId.toString() === userId.toString());
  const isCreator = project.createdBy.toString() === userId.toString();

  if (!isMember && !isCreator) {
    return next(new AppError('Permission denied, you are not a member of this project', 403));
  }

  // Attach project to request
  req.project = project;
  next();
});
