import { NextFunction, Request, Response } from "express";

export class CustomError extends Error {
  public statusCode: number;
  public message: string;
  public error?: Record<string, string>;
  public success? : boolean;
  public data ?: any;
  constructor(message: string, statusCode: number, error?: Record<string, string>) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
    this.success = false;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export const errorHandler = (
  err: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader("Content-Type", "application/json");
  console.log(err,'err')
  const status = err instanceof CustomError ? err.statusCode : 500;
  const message =
    err instanceof CustomError ? err.message : "Internal Server Error";

  return res.status(status).json({
    success: false,
    message,
    errors: err instanceof CustomError ? err.error : undefined,
  });
};

