import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export interface BoardPostRow {
  id: string;
  user_id: string;
  author_nickname?: string | null;
  title: string;
  content: string;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface BoardImageRow {
  id: string;
  post_id: string;
  s3_key: string;
  image_url: string | null;
  created_at: Date;
}

export async function ensureSchema(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      nickname TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      onprem_profile_id UUID NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ NULL
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS board_posts (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      view_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ NULL
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS board_images (
      id UUID PRIMARY KEY,
      post_id UUID NOT NULL REFERENCES board_posts(id),
      s3_key TEXT NOT NULL,
      image_url TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function dbHealth(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
