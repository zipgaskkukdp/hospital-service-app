import { loadServiceConfig, readBooleanEnv, readEnv, readNumberEnv } from "@aicloud/shared-config";

export const serviceConfig = loadServiceConfig("questionnaire-service", 8082);

export const questionnaireConfig = {
  jwtSecret: readEnv("JWT_SECRET"),
  onpremApiBaseUrl: readEnv("ONPREM_API_BASE_URL", "http://onprem-sensitive-api:9000"),
  onpremApiTimeoutMs: readNumberEnv("ONPREM_API_TIMEOUT_MS", 3000),
  onpremRequired: readBooleanEnv("ONPREM_REQUIRED", false),
  awsRegion: readEnv("AWS_REGION", "ap-northeast-2"),
  sqsTriageQueueUrl: readEnv("SQS_TRIAGE_QUEUE_URL")
};
