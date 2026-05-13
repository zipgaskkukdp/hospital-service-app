export interface ServiceConfig {
  appEnv: string;
  serviceName: string;
  port: number;
  logLevel: string;
  timezone: string;
  corsAllowedOrigins: string[];
  healthCheckPath: string;
  databaseUrl: string;
}

export function readEnv(key: string, defaultValue = ""): string {
  const value = process.env[key];
  return value === undefined || value === "" ? defaultValue : value;
}

export function readNumberEnv(key: string, defaultValue: number): number {
  const raw = readEnv(key);
  if (!raw) {
    return defaultValue;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export function readBooleanEnv(key: string, defaultValue: boolean): boolean {
  const raw = readEnv(key);
  if (!raw) {
    return defaultValue;
  }
  return ["1", "true", "yes", "y"].includes(raw.toLowerCase());
}

export function readCsvEnv(key: string, defaultValue = ""): string[] {
  return readEnv(key, defaultValue)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function loadServiceConfig(serviceName: string, defaultPort: number): ServiceConfig {
  return {
    appEnv: readEnv("APP_ENV", "dev"),
    serviceName: readEnv("SERVICE_NAME", serviceName),
    port: readNumberEnv("PORT", defaultPort),
    logLevel: readEnv("LOG_LEVEL", "INFO"),
    timezone: readEnv("TZ", "Asia/Seoul"),
    corsAllowedOrigins: readCsvEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173"),
    healthCheckPath: readEnv("HEALTH_CHECK_PATH", "/health"),
    databaseUrl: readEnv("DATABASE_URL")
  };
}
