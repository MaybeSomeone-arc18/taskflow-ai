import { Router } from 'express';
import { register, login, getMe, logout, googleAuth, guestAuth } from '../controllers/authController';
import { registerValidator, loginValidator } from '../validators/authValidator';
import { validateRequest } from '../middlewares/validate';
import { protect } from '../middlewares/auth';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/login', authLimiter, loginValidator, validateRequest, login);
router.post('/google', authLimiter, googleAuth);
router.post('/guest', authLimiter, guestAuth);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
