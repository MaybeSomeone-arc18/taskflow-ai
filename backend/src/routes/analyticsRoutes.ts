import { Router } from 'express';
import { getDashboardStats, getChartData } from '../controllers/analyticsController';
import { protect } from '../middlewares/auth';

const router = Router();

// Apply JWT verification middleware to all analytics endpoints
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/charts', getChartData);

export default router;
