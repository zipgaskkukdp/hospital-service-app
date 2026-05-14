import crypto from "node:crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";
import type { BoardPost } from "@aicloud/shared-types";
import {
  asyncHandler,
  createAuthMiddleware,
  errorHandler,
  HttpError,
  notFoundHandler
} from "@aicloud/shared-utils";
import type { AuthenticatedRequest } from "@aicloud/shared-utils";
import { boardConfig, serviceConfig } from "./config.js";
import { dbHealth, ensureSchema, prisma, type BoardImageRow, type BoardPostRow } from "./database.js";

dotenv.config();

const postSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(10000)
});

const patchPostSchema = postSchema.partial();

const imageSchema = z.object({
  fileName: z.string().min(1).optional(),
  s3Key: z.string().min(1).optional(),
  imageUrl: z.string().url().optional()
});

function toPost(row: BoardPostRow): BoardPost {
  return {
    id: row.id,
    userId: row.user_id,
    authorNickname: row.author_nickname ?? null,
    title: row.title,
    content: row.content,
    viewCount: row.view_count,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

function toImage(row: BoardImageRow) {
  return {
    id: row.id,
    postId: row.post_id,
    s3Key: row.s3_key,
    imageUrl: row.image_url,
    createdAt: row.created_at.toISOString()
  };
}

function buildS3Key(postId: string, fileName?: string): string {
  const safeName = fileName?.replace(/[^a-zA-Z0-9._-]/g, "_") ?? `${crypto.randomUUID()}.bin`;
  return `${boardConfig.s3PostImagePrefix}${postId}/${safeName}`;
}

function buildImageUrl(s3Key: string, imageUrl?: string): string | null {
  if (imageUrl) {
    return imageUrl;
  }
  if (boardConfig.cloudfrontDomain) {
    return `https://${boardConfig.cloudfrontDomain.replace(/^https?:\/\//, "")}/${s3Key}`;
  }
  return null;
}

const app = express();
app.use(cors({ origin: serviceConfig.corsAllowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const authMiddleware = createAuthMiddleware(() => boardConfig.jwtSecret);

app.get(serviceConfig.healthCheckPath, (_req, res) => {
  res.json({ status: "ok", service: serviceConfig.serviceName });
});

app.get("/db-health", asyncHandler(async (_req, res) => {
  await dbHealth();
  res.json({ status: "ok" });
}));

app.post("/api/board/posts", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const input = postSchema.parse(req.body);
  const id = crypto.randomUUID();
  const rows = await prisma.$queryRaw<BoardPostRow[]>`
    WITH inserted AS (
      INSERT INTO board_posts (id, user_id, title, content)
      VALUES (${id}::uuid, ${userId}::uuid, ${input.title}, ${input.content})
      RETURNING *
    )
    SELECT inserted.*, users.nickname AS author_nickname
    FROM inserted
    JOIN users ON users.id = inserted.user_id
  `;
  res.status(201).json({ post: toPost(rows[0]) });
}));

app.get("/api/board/posts", asyncHandler(async (_req, res) => {
  const rows = await prisma.$queryRaw<BoardPostRow[]>`
    SELECT board_posts.*, users.nickname AS author_nickname
    FROM board_posts
    JOIN users ON users.id = board_posts.user_id
    WHERE board_posts.deleted_at IS NULL
    ORDER BY board_posts.created_at DESC
  `;
  res.json({ posts: rows.map(toPost) });
}));

app.get("/api/board/posts/:id", asyncHandler(async (req, res) => {
  const rows = await prisma.$queryRaw<BoardPostRow[]>`
    WITH updated AS (
      UPDATE board_posts
      SET view_count = view_count + 1
      WHERE id = ${req.params.id}::uuid AND deleted_at IS NULL
      RETURNING *
    )
    SELECT updated.*, users.nickname AS author_nickname
    FROM updated
    JOIN users ON users.id = updated.user_id
  `;
  const post = rows[0];
  if (!post) {
    throw new HttpError(404, "Board post not found");
  }
  const imageRows = await prisma.$queryRaw<BoardImageRow[]>`
    SELECT * FROM board_images
    WHERE post_id = ${post.id}::uuid
    ORDER BY created_at ASC
  `;
  res.json({ post: toPost(post), images: imageRows.map(toImage) });
}));

app.patch("/api/board/posts/:id", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  const input = patchPostSchema.parse(req.body);
  if (!input.title && !input.content) {
    throw new HttpError(400, "title or content is required");
  }

  const currentRows = await prisma.$queryRaw<BoardPostRow[]>`
    SELECT * FROM board_posts
    WHERE id = ${req.params.id}::uuid AND deleted_at IS NULL
    LIMIT 1
  `;
  const current = currentRows[0];
  if (!current) {
    throw new HttpError(404, "Board post not found");
  }
  if (current.user_id !== userId) {
    throw new HttpError(403, "Only the author can update this post");
  }

  const rows = await prisma.$queryRaw<BoardPostRow[]>`
    WITH updated AS (
      UPDATE board_posts
      SET title = ${input.title ?? current.title},
          content = ${input.content ?? current.content},
          updated_at = NOW()
      WHERE id = ${req.params.id}::uuid
      RETURNING *
    )
    SELECT updated.*, users.nickname AS author_nickname
    FROM updated
    JOIN users ON users.id = updated.user_id
  `;
  res.json({ post: toPost(rows[0]) });
}));

app.delete("/api/board/posts/:id", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  const rows = await prisma.$queryRaw<BoardPostRow[]>`
    UPDATE board_posts
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = ${req.params.id}::uuid AND user_id = ${userId}::uuid AND deleted_at IS NULL
    RETURNING *
  `;
  if (!rows[0]) {
    throw new HttpError(404, "Board post not found or not owned by user");
  }
  res.status(204).send();
}));

app.post("/api/board/posts/:id/images", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  const input = imageSchema.parse(req.body);
  const postRows = await prisma.$queryRaw<BoardPostRow[]>`
    SELECT * FROM board_posts
    WHERE id = ${req.params.id}::uuid AND deleted_at IS NULL
    LIMIT 1
  `;
  const post = postRows[0];
  if (!post) {
    throw new HttpError(404, "Board post not found");
  }
  if (post.user_id !== userId) {
    throw new HttpError(403, "Only the author can add images");
  }

  const id = crypto.randomUUID();
  const s3Key = input.s3Key ?? buildS3Key(post.id, input.fileName);
  const imageUrl = buildImageUrl(s3Key, input.imageUrl);
  const rows = await prisma.$queryRaw<BoardImageRow[]>`
    INSERT INTO board_images (id, post_id, s3_key, image_url)
    VALUES (${id}::uuid, ${post.id}::uuid, ${s3Key}, ${imageUrl})
    RETURNING *
  `;
  res.status(201).json({ image: toImage(rows[0]) });
}));

app.use(notFoundHandler());
app.use(errorHandler(serviceConfig.serviceName));

ensureSchema()
  .catch((error) => {
    console.warn("[board-service] database schema bootstrap skipped:", error);
  })
  .finally(() => {
    app.listen(serviceConfig.port, () => {
      console.log(`[board-service] listening on ${serviceConfig.port}`);
    });
  });

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
