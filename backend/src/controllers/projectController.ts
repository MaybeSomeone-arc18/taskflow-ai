import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import asyncHandler from '../utils/asyncHandler';

// @desc    Create a new project
// @route   POST /api/v1/projects
// @access  Private
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, color } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const project = await projectService.createProject({
    title,
    description,
    color,
    createdBy: userId.toString(),
  });

  sendSuccess(res, project, 'Project created successfully', 201);
});

// @desc    Get all active/archived projects belonging to user
// @route   GET /api/v1/projects
// @access  Private
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const projects = await projectService.getProjectsByUser(userId.toString());
  sendSuccess(res, projects, 'Projects fetched successfully');
});

// @desc    Get details of a single project (Owner only)
// @route   GET /api/v1/projects/:id
// @access  Private
export const getProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const project = await projectService.getProjectById(id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  // Owner Authorization Check
  if (project.createdBy.toString() !== userId.toString()) {
    return next(new AppError('Permission denied, only the project owner can view this project', 403));
  }

  sendSuccess(res, project, 'Project details fetched successfully');
});

// @desc    Update project parameters (Owner only)
// @route   PATCH /api/v1/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const project = await projectService.getProjectById(id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  // Owner Authorization Check
  if (project.createdBy.toString() !== userId.toString()) {
    return next(new AppError('Permission denied, only the project owner can update this project', 403));
  }

  const updatedProject = await projectService.updateProject(id, req.body);
  sendSuccess(res, updatedProject, 'Project updated successfully');
});

// @desc    Soft delete project by setting status to Archived (Owner only)
// @route   DELETE /api/v1/projects/:id
// @access  Private
export const deleteProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    throw new Error('User context missing');
  }

  const project = await projectService.getProjectById(id);
  if (!project) {
    return next(new AppError('Project not found', 404));
  }

  // Owner Authorization Check
  if (project.createdBy.toString() !== userId.toString()) {
    return next(new AppError('Permission denied, only the project owner can delete/archive this project', 403));
  }

  const archivedProject = await projectService.softDeleteProject(id);
  sendSuccess(res, archivedProject, 'Project archived successfully');
});
