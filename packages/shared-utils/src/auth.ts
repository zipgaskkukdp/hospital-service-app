import crypto from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtClaims } from "@aicloud/shared-types";
import { HttpError } from "./http.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtClaims;
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getBearerToken(req: Request): string | null {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export function signAccessToken(claims: JwtClaims, secret: string, expiresInSeconds: number): string {
  return jwt.sign(claims, secret, {
    expiresIn: expiresInSeconds,
    subject: claims.sub
  });
}

export function signRefreshToken(userId: string, secret: string, expiresInSeconds: number): string {
  return jwt.sign({ tokenType: "refresh" }, secret, {
    expiresIn: expiresInSeconds,
    subject: userId
  });
}

export function createAuthMiddleware(secretProvider: () => string): RequestHandler {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const secret = secretProvider();
    if (!secret) {
      return next(new HttpError(500, "JWT_SECRET is not configured"));
    }
    const token = getBearerToken(req);
    if (!token) {
      return next(new HttpError(401, "Authorization bearer token is required"));
    }
    try {
      const decoded = jwt.verify(token, secret) as JwtClaims;
      req.user = decoded;
      next();
    } catch {
      next(new HttpError(401, "Invalid or expired token"));
    }
  };
}

export function createOptionalAuthMiddleware(secretProvider: () => string): RequestHandler {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const secret = secretProvider();
    const token = getBearerToken(req);
    if (!secret || !token) {
      return next();
    }
    try {
      req.user = jwt.verify(token, secret) as JwtClaims;
    } catch {
      req.user = undefined;
    }
    next();
  };
}
