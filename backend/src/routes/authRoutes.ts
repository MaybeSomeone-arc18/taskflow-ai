import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { registerValidator, loginValidator } from '../validators/authValidator';
import { validateRequest } from '../middlewares/validate';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
