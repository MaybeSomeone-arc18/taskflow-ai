import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';
import AppError from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import asyncHandler from '../utils/asyncHandler';
import crypto from 'crypto';
import Project from '../models/Project';
import { logActivity } from '../services/activityService';

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

  await logActivity(project._id.toString(), userId.toString(), 'Project Created', 'Created the project');

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
  const project = req.project; // populated by loadProject middleware
  sendSuccess(res, project, 'Project details fetched successfully');
});

// @desc    Update project parameters (Owner only)
// @route   PATCH /api/v1/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const project = req.project;
  const updatedProject = await projectService.updateProject(project._id.toString(), req.body);
  sendSuccess(res, updatedProject, 'Project updated successfully');
});

// @desc    Soft delete project by setting status to Archived (Owner only)
// @route   DELETE /api/v1/projects/:id
// @access  Private
export const deleteProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const project = req.project;
  const userId = req.user?._id;

  // Only the creator can delete the project
  if (project.createdBy.toString() !== userId?.toString()) {
    return next(new AppError('Permission denied, only the project creator can delete this project', 403));
  }

  const archivedProject = await projectService.softDeleteProject(project._id.toString());
  sendSuccess(res, archivedProject, 'Project archived successfully');
});

// @desc    Generate a new invite link
// @route   POST /api/v1/projects/:id/invite
// @access  Private
export const generateInvite = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const project = req.project;

  // Only the creator can generate/regenerate invite links
  if (project.createdBy.toString() !== req.user?._id?.toString()) {
    return next(new AppError('Permission denied, only the project creator can generate invite links', 403));
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  project.invite = {
    token,
    createdAt: new Date(),
    expiresAt,
  };

  await project.save();

  await logActivity(project._id.toString(), req.user?._id.toString() || '', 'Project Shared', 'Generated a new invite link');

  sendSuccess(res, { token }, 'Invite token generated successfully');
});

// @desc    Join a project via invite token
// @route   POST /api/v1/projects/join/:token
// @access  Private
export const joinProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const userId = req.user?._id;

  if (!userId) throw new Error('User context missing');

  const project = await Project.findOne({ 'invite.token': token });
  if (!project) {
    return next(new AppError('Invalid or expired invite link', 404));
  }

  // Check expiry
  if (project.invite && project.invite.expiresAt && new Date() > project.invite.expiresAt) {
    return next(new AppError('This invite link has expired', 400));
  }

  // Idempotent join: check if already a member
  const isMember = project.members.some((m: any) => m.userId.toString() === userId.toString()) || project.createdBy.toString() === userId.toString();
  if (isMember) {
    return sendSuccess(res, { projectId: project._id }, 'You are already a member of this project');
  }

  project.members.push({ userId, joinedAt: new Date() } as any);
  await project.save();

  await logActivity(project._id.toString(), userId.toString(), 'Project Joined', 'Joined the project via invite link');

  sendSuccess(res, { projectId: project._id }, 'Successfully joined the project');
});

// @desc    Leave a project
// @route   POST /api/v1/projects/:id/leave
// @access  Private
export const leaveProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const project = req.project;
  const userId = req.user?._id;

  if (project.createdBy.toString() === userId?.toString()) {
    return next(new AppError('The project creator cannot leave. You must delete the project instead.', 403));
  }

  project.members = project.members.filter((m: any) => m.userId.toString() !== userId?.toString());
  await project.save();

  await logActivity(project._id.toString(), userId?.toString() || '', 'Project Left', 'Left the project');

  sendSuccess(res, null, 'Successfully left the project');
});

// @desc    Remove a member from the project (Creator only)
// @route   DELETE /api/v1/projects/:id/members/:userId
// @access  Private
export const removeMember = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const project = req.project;
  const currentUserId = req.user?._id;
  const memberToRemove = req.params.userId;

  if (project.createdBy.toString() !== currentUserId?.toString()) {
    return next(new AppError('Permission denied, only the project creator can remove members', 403));
  }

  if (project.createdBy.toString() === memberToRemove.toString()) {
    return next(new AppError('The project creator cannot be removed', 400));
  }

  project.members = project.members.filter((m: any) => m.userId.toString() !== memberToRemove.toString());
  await project.save();

  await logActivity(project._id.toString(), currentUserId?.toString() || '', 'Member Removed', `Removed member ${memberToRemove}`);

  sendSuccess(res, null, 'Member removed successfully');
});

// @desc    Get project members
// @route   GET /api/v1/projects/:id/members
// @access  Private
export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const project = req.project;
  await project.populate('members.userId', 'fullName email avatarUrl');
  sendSuccess(res, project.members, 'Project members fetched successfully');
});
