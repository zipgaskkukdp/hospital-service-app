import { loadServiceConfig, readEnv, readNumberEnv } from "@aicloud/shared-config";
import type { MapProvider } from "@aicloud/shared-types";

function normalizeProvider(value: string): MapProvider {
  if (value === "kakao" || value === "naver") {
    return value;
  }
  return "mock";
}

export const serviceConfig = loadServiceConfig("hospital-recommendation-service", 8085);

export const hospitalConfig = {
  jwtSecret: readEnv("JWT_SECRET"),
  mapApiProvider: normalizeProvider(readEnv("MAP_API_PROVIDER", "mock")),
  mapApiKey: readEnv("MAP_API_KEY"),
  mapApiBaseUrl: readEnv("MAP_API_BASE_URL"),
  mapApiTimeoutMs: readNumberEnv("MAP_API_TIMEOUT_MS", 3000)
};
