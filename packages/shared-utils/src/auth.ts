import crypto from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
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
    expiresIn: expiresInSeconds
  });
}

export function signRefreshToken(userId: string, secret: string, expiresInSeconds: number): string {
  return jwt.sign({ sub: userId, tokenType: "refresh" }, secret, {
    expiresIn: expiresInSeconds
  });
}

function isAccessTokenPayload(decoded: string | JwtPayload): decoded is JwtClaims & JwtPayload {
  if (!decoded || typeof decoded !== "object") {
    return false;
  }

  const payload = decoded as Record<string, unknown>;
  return (
    typeof payload.sub === "string" &&
    typeof payload.email === "string" &&
    typeof payload.nickname === "string" &&
    (payload.role === "USER" || payload.role === "ADMIN") &&
    payload.tokenType === undefined
  );
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
      const decoded = jwt.verify(token, secret);
      if (!isAccessTokenPayload(decoded)) {
        throw new HttpError(401, "Invalid or expired token");
      }
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof HttpError) {
        return next(error);
      }
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
      const decoded = jwt.verify(token, secret);
      req.user = isAccessTokenPayload(decoded) ? decoded : undefined;
    } catch {
      req.user = undefined;
    }
    next();
  };
}
