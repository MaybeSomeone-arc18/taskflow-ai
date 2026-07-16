import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { getTasksByProject } from '../controllers/taskController';
import { createProjectValidator, updateProjectValidator } from '../validators/projectValidator';
import { validateRequest } from '../middlewares/validate';
import { protect } from '../middlewares/auth';

const router = Router();

// Secure all project endpoints with protect middleware
router.use(protect);

router.post('/', createProjectValidator, validateRequest, createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.patch('/:id', updateProjectValidator, validateRequest, updateProject);
router.delete('/:id', deleteProject);

// Scoped Task endpoints
router.get('/:projectId/tasks', getTasksByProject);

export default router;
