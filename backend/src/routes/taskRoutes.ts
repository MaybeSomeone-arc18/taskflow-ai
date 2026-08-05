import { Router } from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask, importAITasks } from '../controllers/taskController';
import { createTaskValidator, updateTaskValidator } from '../validators/taskValidator';
import { validateRequest } from '../middlewares/validate';
import { protect } from '../middlewares/auth';
import { loadProject } from '../middleware/projectAuth';
import Task from '../models/Task';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';

const loadTask = asyncHandler(async (req: any, res: any, next: any) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError('Task not found', 404));
  req.task = task;
  req.params.projectId = task.projectId.toString();
  next();
});

const router = Router();

// Apply JWT verification middleware to all task endpoints
router.use(protect);

router.post('/', createTaskValidator, validateRequest, loadProject, createTask);
router.post('/import-ai', loadProject, importAITasks);
router.get('/', getTasks);
router.get('/:id', loadTask, loadProject, getTask);
router.patch('/:id', loadTask, loadProject, updateTaskValidator, validateRequest, updateTask);
router.delete('/:id', loadTask, loadProject, deleteTask);

export default router;
