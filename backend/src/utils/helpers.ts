import { Request, Response, NextFunction } from 'express';

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const successResponse = (
  res: Response,
  data: any,
  statusCode: number = 200,
  message?: string
) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500
) => {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};

