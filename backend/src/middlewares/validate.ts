import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AppError from '../utils/AppError';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.type === 'field' ? err.path : err.type,
      message: err.msg,
    }));
    return next(new AppError('Validation failed', 400, errorDetails));
  }
  next();
};

export default validateRequest;
