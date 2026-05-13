import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export interface ConsultationRow {
  id: string;
  user_id: string;
  status: string;
  content_data: Record<string, unknown>;
  symptom_summary: string | null;
  ai_result_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AiResultRow {
  id: string;
  consultation_id: string;
  user_id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  summary: string | null;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  department_hint: string | null;
  recommendation: string | null;
  result_json: Record<string, unknown>;
  model_provider: "mock" | "bedrock";
  model_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ConsultationAssetRow {
  id: string;
  consultation_id: string;
  asset_type: "IMAGE" | "PDF" | "JSON_REPORT";
  s3_key: string;
  public_url: string | null;
  cloudfront_url: string | null;
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
    CREATE TABLE IF NOT EXISTS ai_results (
      id UUID PRIMARY KEY,
      consultation_id UUID NOT NULL REFERENCES consultations(id),
      user_id UUID NOT NULL REFERENCES users(id),
      status TEXT NOT NULL,
      summary TEXT NULL,
      risk_level TEXT NOT NULL DEFAULT 'UNKNOWN',
      department_hint TEXT NULL,
      recommendation TEXT NULL,
      result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      model_provider TEXT NOT NULL DEFAULT 'mock',
      model_id TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS consultation_assets (
      id UUID PRIMARY KEY,
      consultation_id UUID NOT NULL REFERENCES consultations(id),
      asset_type TEXT NOT NULL,
      s3_key TEXT NOT NULL,
      public_url TEXT NULL,
      cloudfront_url TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function dbHealth(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
