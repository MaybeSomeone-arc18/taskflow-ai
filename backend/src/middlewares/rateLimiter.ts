import rateLimit from 'express-rate-limit';

// General auth endpoint rate limiter (Login / Register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs for auth routes
  message: {
    status: 'error',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Invite link generation rate limiter
export const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 invite link generations per hour
  message: {
    status: 'error',
    message: 'Too many invite links generated from this IP, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
