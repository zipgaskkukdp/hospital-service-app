import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function requireBodyString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `${key} is required`);
  }
  return value.trim();
}

export function notFoundHandler(): RequestHandler {
  return (_req, _res, next) => {
    next(new HttpError(404, "Not found"));
  };
}

export function errorHandler(serviceName: string): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    const statusCode = err instanceof HttpError ? err.statusCode : err instanceof ZodError ? 400 : 500;
    const message = err instanceof ZodError
      ? "Invalid request"
      : err instanceof Error
        ? err.message
        : "Unexpected error";
    if (statusCode >= 500) {
      console.error(`[${serviceName}]`, err);
    }
    res.status(statusCode).json({
      error: {
        message,
        details: err instanceof ZodError ? err.flatten() : err instanceof HttpError ? err.details : undefined
      }
    });
  };
}
