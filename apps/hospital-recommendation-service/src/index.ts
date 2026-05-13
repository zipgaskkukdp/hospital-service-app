import crypto from "node:crypto";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";
import type { HospitalRecommendation } from "@aicloud/shared-types";
import {
  asyncHandler,
  createAuthMiddleware,
  createOptionalAuthMiddleware,
  errorHandler,
  HttpError,
  notFoundHandler
} from "@aicloud/shared-utils";
import type { AuthenticatedRequest } from "@aicloud/shared-utils";
import { hospitalConfig, serviceConfig } from "./config.js";
import { dbHealth, ensureSchema, prisma } from "./database.js";

dotenv.config();

const recommendSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  consultationId: z.string().uuid().optional().nullable(),
  department: z.string().optional()
});

const mockHospitals: HospitalRecommendation[] = [
  {
    id: "mock-hospital-001",
    name: "Aicloud Children Clinic",
    department: "pediatrics",
    address: "Mock district, Seoul",
    distanceMeters: 420,
    phone: "internal-mock",
    provider: "mock"
  },
  {
    id: "mock-hospital-002",
    name: "Aicloud ENT Clinic",
    department: "otolaryngology",
    address: "Mock medical street, Seoul",
    distanceMeters: 880,
    phone: "internal-mock",
    provider: "mock"
  },
  {
    id: "mock-hospital-003",
    name: "Aicloud General Pediatrics Center",
    department: "pediatrics",
    address: "Mock care plaza, Seoul",
    distanceMeters: 1340,
    phone: "internal-mock",
    provider: "mock"
  }
];

function minimizeLocation(lat: number, lng: number) {
  return {
    lat_rounded: Number(lat.toFixed(3)),
    lng_rounded: Number(lng.toFixed(3))
  };
}

function getRecommendations(input: z.infer<typeof recommendSchema>): HospitalRecommendation[] {
  if (hospitalConfig.mapApiProvider !== "mock" && !hospitalConfig.mapApiKey) {
    throw new HttpError(503, "MAP_API_KEY is required for kakao/naver provider");
  }

  const department = input.department?.toLowerCase();
  const source = department
    ? mockHospitals.filter((hospital) => hospital.department.toLowerCase().includes(department))
    : mockHospitals;

  return source.length > 0 ? source : mockHospitals;
}

async function logRecommendation(
  userId: string,
  input: z.infer<typeof recommendSchema>,
  recommendations: HospitalRecommendation[]
): Promise<void> {
  const id = crypto.randomUUID();
  const requestData = {
    ...minimizeLocation(input.lat, input.lng),
    consultation_id: input.consultationId ?? null,
    department: input.department ?? null
  };
  await prisma.$queryRaw`
    INSERT INTO hospital_recommendation_logs (id, user_id, consultation_id, request_data, result_data, provider)
    VALUES (
      ${id}::uuid,
      ${userId}::uuid,
      ${input.consultationId ?? null}::uuid,
      ${JSON.stringify(requestData)}::jsonb,
      ${JSON.stringify({ recommendations })}::jsonb,
      ${hospitalConfig.mapApiProvider}
    )
  `;
}

const app = express();
app.use(cors({ origin: serviceConfig.corsAllowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

const authMiddleware = createAuthMiddleware(() => hospitalConfig.jwtSecret);
const optionalAuthMiddleware = createOptionalAuthMiddleware(() => hospitalConfig.jwtSecret);

app.get(serviceConfig.healthCheckPath, (_req, res) => {
  res.json({ status: "ok", service: serviceConfig.serviceName, provider: hospitalConfig.mapApiProvider });
});

app.get("/db-health", asyncHandler(async (_req, res) => {
  await dbHealth();
  res.json({ status: "ok" });
}));

app.get("/api/hospitals/recommend", optionalAuthMiddleware, asyncHandler(async (req, res) => {
  const input = recommendSchema.parse(req.query);
  const recommendations = getRecommendations(input);
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (userId) {
    await logRecommendation(userId, input, recommendations);
  }
  res.json({ provider: hospitalConfig.mapApiProvider, recommendations });
}));

app.post("/api/hospitals/recommend", authMiddleware, asyncHandler(async (req, res) => {
  const userId = (req as AuthenticatedRequest).user?.sub;
  if (!userId) {
    throw new HttpError(401, "Authentication required");
  }
  const input = recommendSchema.parse(req.body);
  const recommendations = getRecommendations(input);
  await logRecommendation(userId, input, recommendations);
  res.json({ provider: hospitalConfig.mapApiProvider, recommendations });
}));

app.use(notFoundHandler());
app.use(errorHandler(serviceConfig.serviceName));

ensureSchema()
  .catch((error) => {
    console.warn("[hospital-recommendation-service] database schema bootstrap skipped:", error);
  })
  .finally(() => {
    app.listen(serviceConfig.port, () => {
      console.log(`[hospital-recommendation-service] listening on ${serviceConfig.port}`);
    });
  });

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
