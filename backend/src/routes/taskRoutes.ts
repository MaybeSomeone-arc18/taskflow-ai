import { Router } from 'express';
import { createTask, getTasks, getTask, updateTask, deleteTask, importAITasks } from '../controllers/taskController';
import { createTaskValidator, updateTaskValidator } from '../validators/taskValidator';
import { validateRequest } from '../middlewares/validate';
import { protect } from '../middlewares/auth';

const router = Router();

// Apply JWT verification middleware to all task endpoints
router.use(protect);

router.post('/', createTaskValidator, validateRequest, createTask);
router.post('/import-ai', importAITasks);
router.get('/', getTasks);
router.get('/:id', getTask);
router.patch('/:id', updateTaskValidator, validateRequest, updateTask);
router.delete('/:id', deleteTask);

export default router;
