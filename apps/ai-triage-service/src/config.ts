import { loadServiceConfig, readEnv, readNumberEnv } from "@aicloud/shared-config";
import type { AiProvider } from "@aicloud/shared-types";

function normalizeAiProvider(value: string): AiProvider {
  return value === "bedrock" ? "bedrock" : "mock";
}

export const serviceConfig = loadServiceConfig("ai-triage-service", 8084);

export const aiConfig = {
  jwtSecret: readEnv("JWT_SECRET"),
  aiProvider: normalizeAiProvider(readEnv("AI_PROVIDER", "mock")),
  processingMode: readEnv("AI_PROCESSING_MODE", "inline_mock"),
  bedrockRegion: readEnv("BEDROCK_REGION", "ap-northeast-2"),
  bedrockModelId: readEnv("BEDROCK_MODEL_ID"),
  bedrockGuardrailId: readEnv("BEDROCK_GUARDRAIL_ID"),
  bedrockGuardrailVersion: readEnv("BEDROCK_GUARDRAIL_VERSION"),
  s3ReportPrefix: readEnv("S3_REPORT_PREFIX", "reports/"),
  s3PresignedUrlExpireSeconds: readNumberEnv("S3_PRESIGNED_URL_EXPIRE_SECONDS", 300),
  cloudfrontDomain: readEnv("CLOUDFRONT_DOMAIN")
};
