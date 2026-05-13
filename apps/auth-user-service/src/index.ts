import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";
import type { AuthResponse, PublicUser } from "@aicloud/shared-types";
import {
  asyncHandler,
  createAuthMiddleware,
  errorHandler,
  hashToken,
  HttpError,
  notFoundHandler,
  signAccessToken,
  signRefreshToken
} from "@aicloud/shared-utils";
import type { AuthenticatedRequest } from "@aicloud/shared-utils";
import { authConfig, serviceConfig } from "./config.js";
import { dbHealth, ensureSchema, prisma, type UserRow } from "./database.js";

dotenv.config();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  nickname: z.string().min(1),
  phone: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const updateMeSchema = z.object({
  nickname: z.string().min(1).optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    role: row.role,
    onpremProfileId: row.onprem_profile_id,
    createdAt: row.created_at.toISOString()
  };
}

async function createSensitiveProfile(input: z.infer<typeof signupSchema>, cloudUserId: string): Promise<string | null> {
  if (!authConfig.onpremApiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${authConfig.onpremApiBaseUrl}/internal/sensitive/user-profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cloud_user_id: cloudUserId,
        name: input.name,
        phone: input.phone
      }),
      signal: AbortSignal.timeout(authConfig.onpremApiTimeoutMs)
    });

    if (!response.ok) {
      throw new Error(`onprem-sensitive-api returned ${response.status}`);
    }

    const payload = (await response.json()) as { id?: string };
    return payload.id ?? null;
  } catch (error) {
    if (authConfig.onpremRequired) {
      throw new HttpError(502, "Failed to store sensitive profile", String(error));
    }
    console.warn("[auth-user-service] sensitive profile storage skipped:", error);
    return null;
  }
}

async function issueTokens(user: UserRow): Promise<AuthResponse["tokens"]> {
  if (!authConfig.jwtSecret) {
    throw new HttpError(500, "JWT_SECRET is not configured");
  }

  const claims = {
    sub: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role
  };
  const accessToken = signAccessToken(claims, authConfig.jwtSecret, authConfig.accessTokenExpireSeconds);
  const refreshToken = signRefreshToken(user.id, authConfig.jwtSecret, authConfig.refreshTokenExpireSeconds);
  const refreshTokenId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + authConfig.refreshTokenExpireSeconds * 1000);

  await prisma.$queryRaw`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
    VALUES (${refreshTokenId}::uuid, ${user.id}::uuid, ${hashToken(refreshToken)}, ${expiresAt})
  `;

  return {
    accessToken,
    refreshToken,
    expiresIn: authConfig.accessTokenExpireSeconds
  };
}

async function findActiveUserById(userId: string): Promise<UserRow> {
  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT * FROM users
    WHERE id = ${userId}::uuid AND deleted_at IS NULL
    LIMIT 1
  `;
  const user = rows[0];
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return user;
}

const app = express();
app.use(cors({ origin: serviceConfig.corsAllowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

const authMiddleware = createAuthMiddleware(() => authConfig.jwtSecret);

app.get(serviceConfig.healthCheckPath, (_req, res) => {
  res.json({ status: "ok", service: serviceConfig.serviceName });
});

app.get("/db-health", asyncHandler(async (_req, res) => {
  await dbHealth();
  res.json({ status: "ok" });
}));

app.post("/api/auth/signup", asyncHandler(async (req, res) => {
  const input = signupSchema.parse(req.body);
  const id = crypto.randomUUID();
  const onpremProfileId = await createSensitiveProfile(input, id);
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const rows = await prisma.$queryRaw<UserRow[]>`
      INSERT INTO users (id, email, password_hash, nickname, role, onprem_profile_id)
      VALUES (${id}::uuid, ${input.email.toLowerCase()}, ${passwordHash}, ${input.nickname}, 'USER', ${onpremProfileId}::uuid)
      RETURNING *
    `;
    const user = rows[0];
    const tokens = await issueTokens(user);
    res.status(201).json({ user: toPublicUser(user), tokens });
  } catch (error) {
    if (String(error).includes("23505") || String(error).includes("Unique constraint")) {
      throw new HttpError(409, "Email already exists");
    }
    throw error;
  }
}));

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT * FROM users
    WHERE email = ${input.email.toLowerCase()} AND deleted_at IS NULL
    LIMIT 1
  `;
  const user = rows[0];
  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw new HttpError(401, "Invalid email or password");
  }

  const tokens = await issueTokens(user);
  res.json({ user: toPublicUser(user), tokens });
}));

app.get("/api/users/me", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const user = await findActiveUserById(userId);
  res.json({ user: toPublicUser(user) });
}));

app.patch("/api/users/me", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const input = updateMeSchema.parse(req.body);
  if (!input.nickname) {
    const user = await findActiveUserById(userId);
    res.json({ user: toPublicUser(user) });
    return;
  }

  const rows = await prisma.$queryRaw<UserRow[]>`
    UPDATE users
    SET nickname = ${input.nickname}, updated_at = NOW()
    WHERE id = ${userId}::uuid AND deleted_at IS NULL
    RETURNING *
  `;
  const user = rows[0];
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  res.json({ user: toPublicUser(user) });
}));

app.patch("/api/users/me/password", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const input = updatePasswordSchema.parse(req.body);
  const user = await findActiveUserById(userId);
  const passwordMatches = await bcrypt.compare(input.currentPassword, user.password_hash);
  if (!passwordMatches) {
    throw new HttpError(401, "Current password is invalid");
  }

  const nextHash = await bcrypt.hash(input.newPassword, 12);
  await prisma.$queryRaw`
    UPDATE users
    SET password_hash = ${nextHash}, updated_at = NOW()
    WHERE id = ${userId}::uuid
  `;
  res.json({ status: "ok" });
}));

app.use(notFoundHandler());
app.use(errorHandler(serviceConfig.serviceName));

ensureSchema()
  .catch((error) => {
    console.warn("[auth-user-service] database schema bootstrap skipped:", error);
  })
  .finally(() => {
    app.listen(serviceConfig.port, () => {
      console.log(`[auth-user-service] listening on ${serviceConfig.port}`);
    });
  });

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
