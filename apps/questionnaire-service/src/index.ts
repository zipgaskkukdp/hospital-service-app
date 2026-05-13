import crypto from "node:crypto";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";
import type { Consultation, ConsultationContentData } from "@aicloud/shared-types";
import {
  asyncHandler,
  createAuthMiddleware,
  errorHandler,
  extractSymptomKeywords,
  HttpError,
  notFoundHandler,
  summarizeSymptomText
} from "@aicloud/shared-utils";
import type { AuthenticatedRequest } from "@aicloud/shared-utils";
import { questionnaireConfig, serviceConfig } from "./config.js";
import { dbHealth, ensureSchema, prisma, type AiResultRow, type ConsultationRow } from "./database.js";

dotenv.config();

const createConsultationSchema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().min(0).max(20),
  gender: z.string().min(1),
  symptoms: z.string().min(1),
  childRefId: z.string().uuid().optional().nullable()
});

const completeSchema = z.object({
  promptVersion: z.string().default("v1.0")
});

function toConsultation(row: ConsultationRow): Consultation {
  return {
    id: row.id,
    userId: row.user_id,
    childRefId: row.child_ref_id,
    status: row.status,
    contentData: row.content_data as unknown as ConsultationContentData,
    symptomSummary: row.symptom_summary ?? "",
    aiResultId: row.ai_result_id,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString()
  };
}

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

async function callOnprem(path: string, payload: Record<string, unknown>): Promise<void> {
  if (!questionnaireConfig.onpremApiBaseUrl) {
    return;
  }
  try {
    const response = await fetch(`${questionnaireConfig.onpremApiBaseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(questionnaireConfig.onpremApiTimeoutMs)
    });
    if (!response.ok) {
      throw new Error(`onprem-sensitive-api returned ${response.status}`);
    }
  } catch (error) {
    if (questionnaireConfig.onpremRequired) {
      throw new HttpError(502, "Failed to store sensitive consultation payload", String(error));
    }
    console.warn("[questionnaire-service] sensitive payload storage skipped:", error);
  }
}

async function publishTriageEvent(consultation: ConsultationRow): Promise<{ published: boolean; mode: string }> {
  const messageBody = {
    questionnaire_id: consultation.id,
    consultation_id: consultation.id,
    user_id: consultation.user_id,
    created_at: consultation.created_at.toISOString()
  };

  if (!questionnaireConfig.sqsTriageQueueUrl) {
    console.info("[questionnaire-service] SQS_TRIAGE_QUEUE_URL is empty; event kept in mock mode", messageBody);
    return { published: false, mode: "mock" };
  }

  const sqs = new SQSClient({ region: questionnaireConfig.awsRegion });
  await sqs.send(new SendMessageCommand({
    QueueUrl: questionnaireConfig.sqsTriageQueueUrl,
    MessageBody: JSON.stringify(messageBody)
  }));
  return { published: true, mode: "sqs" };
}

const app = express();
app.use(cors({ origin: serviceConfig.corsAllowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

const authMiddleware = createAuthMiddleware(() => questionnaireConfig.jwtSecret);

app.get(serviceConfig.healthCheckPath, (_req, res) => {
  res.json({ status: "ok", service: serviceConfig.serviceName });
});

app.get("/db-health", asyncHandler(async (_req, res) => {
  await dbHealth();
  res.json({ status: "ok" });
}));

app.post("/api/consultations", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const input = createConsultationSchema.parse(req.body);
  const id = crypto.randomUUID();
  const symptomSummary = summarizeSymptomText(input.symptoms);
  const contentData: ConsultationContentData = {
    child_info: {
      age: input.age,
      gender: input.gender
    },
    user_input: {
      symptom_keywords: extractSymptomKeywords(input.symptoms),
      symptom_summary: symptomSummary
    }
  };

  const rows = await prisma.$queryRaw<ConsultationRow[]>`
    INSERT INTO consultations (id, user_id, child_ref_id, status, content_data, symptom_summary)
    VALUES (${id}::uuid, ${userId}::uuid, ${input.childRefId ?? null}::uuid, 'DRAFT', ${JSON.stringify(contentData)}::jsonb, ${symptomSummary})
    RETURNING *
  `;

  await callOnprem("/internal/sensitive/consultation", {
    consultation_id: id,
    cloud_user_id: userId,
    raw_payload: {
      name: input.name,
      symptoms: input.symptoms
    }
  });

  res.status(201).json({ consultation: toConsultation(rows[0]) });
}));

app.get("/api/consultations", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const rows = await prisma.$queryRaw<ConsultationRow[]>`
    SELECT * FROM consultations
    WHERE user_id = ${userId}::uuid
    ORDER BY created_at DESC
  `;
  res.json({ consultations: rows.map(toConsultation) });
}));

app.get("/api/consultations/:id", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  const rows = await prisma.$queryRaw<ConsultationRow[]>`
    SELECT * FROM consultations
    WHERE id = ${req.params.id}::uuid AND user_id = ${userId}::uuid
    LIMIT 1
  `;
  const consultation = rows[0];
  if (!consultation) {
    throw new HttpError(404, "Consultation not found");
  }
  res.json({ consultation: toConsultation(consultation) });
}));

app.post("/api/consultations/:id/complete", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const input = completeSchema.parse(req.body ?? {});
  const existingRows = await prisma.$queryRaw<ConsultationRow[]>`
    SELECT * FROM consultations
    WHERE id = ${req.params.id}::uuid AND user_id = ${userId}::uuid
    LIMIT 1
  `;
  const existing = existingRows[0];
  if (!existing) {
    throw new HttpError(404, "Consultation not found");
  }

  const nextContentData = {
    ...existing.content_data,
    ai_process: {
      prompt_version: input.promptVersion,
      requested_at: new Date().toISOString()
    }
  };

  const rows = await prisma.$queryRaw<ConsultationRow[]>`
    UPDATE consultations
    SET status = 'SUBMITTED', content_data = ${JSON.stringify(nextContentData)}::jsonb, updated_at = NOW()
    WHERE id = ${req.params.id}::uuid AND user_id = ${userId}::uuid
    RETURNING *
  `;
  const event = await publishTriageEvent(rows[0]);
  res.json({ consultation: toConsultation(rows[0]), event });
}));

app.get("/api/consultations/:id/result", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  const rows = await prisma.$queryRaw<AiResultRow[]>`
    SELECT * FROM ai_results
    WHERE consultation_id = ${req.params.id}::uuid AND user_id = ${userId}::uuid
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = rows[0];
  if (!result) {
    res.status(202).json({ status: "PENDING", result: null });
    return;
  }
  res.json({ status: result.status, result: toAiResult(result) });
}));

app.use(notFoundHandler());
app.use(errorHandler(serviceConfig.serviceName));

ensureSchema()
  .catch((error) => {
    console.warn("[questionnaire-service] database schema bootstrap skipped:", error);
  })
  .finally(() => {
    app.listen(serviceConfig.port, () => {
      console.log(`[questionnaire-service] listening on ${serviceConfig.port}`);
    });
  });

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
