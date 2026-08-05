import { Router } from 'express';
import {
  getTaskBreakdown,
  getDailyPlan,
  getProjectHealth,
  getSprintSummary,
} from '../controllers/aiController';
import { protect } from '../middlewares/auth';
import { loadProject } from '../middleware/projectAuth';

const router = Router();

// Apply JWT verification middleware to all AI endpoints
router.use(protect);

router.post('/task-breakdown', getTaskBreakdown);
router.post('/daily-plan', getDailyPlan);
router.post('/project-health', loadProject, getProjectHealth);
router.post('/sprint-summary', loadProject, getSprintSummary);

export default router;
