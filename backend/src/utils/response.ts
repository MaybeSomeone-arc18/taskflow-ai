import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any,
  message = 'Success',
  statusCode = 200
): void => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};
