import { loadServiceConfig, readBooleanEnv, readEnv, readNumberEnv } from "@aicloud/shared-config";

export const serviceConfig = loadServiceConfig("auth-user-service", 8081);

export const authConfig = {
  jwtSecret: readEnv("JWT_SECRET"),
  accessTokenExpireSeconds: readNumberEnv("JWT_ACCESS_TOKEN_EXPIRE_SECONDS", 3600),
  refreshTokenExpireSeconds: readNumberEnv("JWT_REFRESH_TOKEN_EXPIRE_SECONDS", 1209600),
  onpremApiBaseUrl: readEnv("ONPREM_API_BASE_URL", "http://onprem-sensitive-api:9000"),
  onpremApiTimeoutMs: readNumberEnv("ONPREM_API_TIMEOUT_MS", 3000),
  onpremRequired: readBooleanEnv("ONPREM_REQUIRED", false)
};
