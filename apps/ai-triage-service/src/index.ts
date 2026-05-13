import crypto from "node:crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";
import {
  asyncHandler,
  createAuthMiddleware,
  errorHandler,
  HttpError,
  notFoundHandler
} from "@aicloud/shared-utils";
import type { AuthenticatedRequest } from "@aicloud/shared-utils";
import { aiConfig, serviceConfig } from "./config.js";
import {
  dbHealth,
  ensureSchema,
  prisma,
  type AiResultRow,
  type ConsultationAssetRow,
  type ConsultationRow
} from "./database.js";

dotenv.config();

const mockProcessSchema = z.object({
  consultationId: z.string().uuid(),
  summary: z.string().optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "UNKNOWN"]).default("LOW"),
  departmentHint: z.string().default("pediatrics"),
  recommendation: z.string().optional()
});

function toAiResult(row: AiResultRow) {
  return {
    id: row.id,
    consultationId: row.consultation_id,
    userId: row.user_id,
    status: row.status,
    summary: row.summary,
    riskLevel: row.risk_level,
    departmentHint: row.department_hint,
    recommendation: row.recommendation,
    resultJson: row.result_json,
    modelProvider: row.model_provider,
    modelId: row.model_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

function toAsset(row: ConsultationAssetRow) {
  return {
    id: row.id,
    consultationId: row.consultation_id,
    assetType: row.asset_type,
    s3Key: row.s3_key,
    publicUrl: row.public_url,
    cloudfrontUrl: row.cloudfront_url,
    createdAt: row.created_at.toISOString()
  };
}

function inferMockSummary(consultation: ConsultationRow): string {
  const keywords = consultation.content_data?.user_input &&
    typeof consultation.content_data.user_input === "object" &&
    "symptom_keywords" in consultation.content_data.user_input
    ? (consultation.content_data.user_input as { symptom_keywords?: string[] }).symptom_keywords ?? []
    : [];

  if (keywords.length > 0) {
    return `Mock triage completed for symptoms: ${keywords.slice(0, 4).join(", ")}`;
  }
  return "Mock triage completed from non-identifying consultation metadata.";
}

function buildCloudfrontUrl(s3Key: string): string | null {
  if (!aiConfig.cloudfrontDomain) {
    return null;
  }
  return `https://${aiConfig.cloudfrontDomain.replace(/^https?:\/\//, "")}/${s3Key}`;
}

async function createJsonReportAsset(consultationId: string, resultId: string): Promise<ConsultationAssetRow> {
  const id = crypto.randomUUID();
  const s3Key = `${aiConfig.s3ReportPrefix}${consultationId}/${resultId}.json`;
  const rows = await prisma.$queryRaw<ConsultationAssetRow[]>`
    INSERT INTO consultation_assets (id, consultation_id, asset_type, s3_key, public_url, cloudfront_url)
    VALUES (${id}::uuid, ${consultationId}::uuid, 'JSON_REPORT', ${s3Key}, NULL, ${buildCloudfrontUrl(s3Key)})
    RETURNING *
  `;
  return rows[0];
}

const app = express();
app.use(cors({ origin: serviceConfig.corsAllowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const authMiddleware = createAuthMiddleware(() => aiConfig.jwtSecret);

app.get(serviceConfig.healthCheckPath, (_req, res) => {
  res.json({ status: "ok", service: serviceConfig.serviceName, provider: aiConfig.aiProvider });
});

app.get("/db-health", asyncHandler(async (_req, res) => {
  await dbHealth();
  res.json({ status: "ok" });
}));

app.get("/api/ai/results/:consultationId", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  const resultRows = await prisma.$queryRaw<AiResultRow[]>`
    SELECT * FROM ai_results
    WHERE consultation_id = ${req.params.consultationId}::uuid AND user_id = ${userId}::uuid
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = resultRows[0];
  if (!result) {
    res.status(202).json({ status: "PENDING", result: null, assets: [] });
    return;
  }
  const assetRows = await prisma.$queryRaw<ConsultationAssetRow[]>`
    SELECT * FROM consultation_assets
    WHERE consultation_id = ${req.params.consultationId}::uuid
    ORDER BY created_at DESC
  `;
  res.json({ status: result.status, result: toAiResult(result), assets: assetRows.map(toAsset) });
}));

app.post("/api/ai/mock-process", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const input = mockProcessSchema.parse(req.body);

  const consultationRows = await prisma.$queryRaw<ConsultationRow[]>`
    SELECT * FROM consultations
    WHERE id = ${input.consultationId}::uuid AND user_id = ${userId}::uuid
    LIMIT 1
  `;
  const consultation = consultationRows[0];
  if (!consultation) {
    throw new HttpError(404, "Consultation not found");
  }

  const resultId = crypto.randomUUID();
  const summary = input.summary ?? inferMockSummary(consultation);
  const recommendation = input.recommendation ?? "Monitor symptoms and visit a pediatric clinic if symptoms persist or worsen.";
  const resultJson = {
    mode: aiConfig.processingMode,
    direct_identifiers_included: false,
    symptom_summary: consultation.symptom_summary,
    generated_at: new Date().toISOString()
  };

  const rows = await prisma.$queryRaw<AiResultRow[]>`
    INSERT INTO ai_results (
      id, consultation_id, user_id, status, summary, risk_level,
      department_hint, recommendation, result_json, model_provider, model_id
    )
    VALUES (
      ${resultId}::uuid,
      ${consultation.id}::uuid,
      ${userId}::uuid,
      'COMPLETED',
      ${summary},
      ${input.riskLevel},
      ${input.departmentHint},
      ${recommendation},
      ${JSON.stringify(resultJson)}::jsonb,
      ${aiConfig.aiProvider},
      ${aiConfig.aiProvider === "bedrock" ? aiConfig.bedrockModelId || null : null}
    )
    RETURNING *
  `;

  await prisma.$queryRaw`
    UPDATE consultations
    SET status = 'RESULT_READY', ai_result_id = ${resultId}::uuid, updated_at = NOW()
    WHERE id = ${consultation.id}::uuid
  `;

  const reportAsset = await createJsonReportAsset(consultation.id, resultId);
  res.status(201).json({ result: toAiResult(rows[0]), assets: [toAsset(reportAsset)] });
}));

app.use(notFoundHandler());
app.use(errorHandler(serviceConfig.serviceName));

ensureSchema()
  .catch((error) => {
    console.warn("[ai-triage-service] database schema bootstrap skipped:", error);
  })
  .finally(() => {
    app.listen(serviceConfig.port, () => {
      console.log(`[ai-triage-service] listening on ${serviceConfig.port}`);
    });
  });

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
