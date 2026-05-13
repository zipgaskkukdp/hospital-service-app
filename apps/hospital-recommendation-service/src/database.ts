import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

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
    CREATE TABLE IF NOT EXISTS consultations (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      child_ref_id UUID NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      content_data JSONB NOT NULL,
      symptom_summary TEXT NULL,
      ai_result_id UUID NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS hospital_recommendation_logs (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      consultation_id UUID NULL REFERENCES consultations(id),
      request_data JSONB NOT NULL,
      result_data JSONB NOT NULL,
      provider TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function dbHealth(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
