import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  nickname: string;
  role: "USER" | "ADMIN";
  onprem_profile_id: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
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
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function dbHealth(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
