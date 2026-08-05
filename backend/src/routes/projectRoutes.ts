import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  generateInvite,
  joinProject,
  leaveProject,
  removeMember,
  getMembers,
} from '../controllers/projectController';
import { getTasksByProject } from '../controllers/taskController';
import { createProjectValidator, updateProjectValidator } from '../validators/projectValidator';
import { validateRequest } from '../middlewares/validate';
import { protect } from '../middlewares/auth';
import { loadProject } from '../middleware/projectAuth';
import { inviteLimiter } from '../middlewares/rateLimiter';

const router = Router();

// Secure all project endpoints with protect middleware
router.use(protect);

router.post('/', createProjectValidator, validateRequest, createProject);
router.get('/', getProjects);
router.post('/join/:token', joinProject);

// Apply loadProject middleware to parameterized project routes
router.use('/:id', loadProject);

router.get('/:id', getProject);
router.patch('/:id', updateProjectValidator, validateRequest, updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/leave', leaveProject);

// Generate new invite token
router.post('/:id/invite', inviteLimiter, generateInvite);

// Collaboration endpoints
router.delete('/:id/members/:userId', removeMember);
router.get('/:id/members', getMembers);

// Scoped Task endpoints
router.get('/:projectId/tasks', loadProject, getTasksByProject);

export default router;
