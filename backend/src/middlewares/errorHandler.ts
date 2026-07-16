import { Request, Response, NextFunction } from 'express';

interface AppErrorLike extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: AppErrorLike,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode === 500) {
    console.error('[SERVER EXCEPTION]', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
