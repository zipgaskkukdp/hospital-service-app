import { apiRequest } from "./client";

export interface AiResult {
  id: string;
  consultationId: string;
  status: string;
  summary: string | null;
  riskLevel: string;
  departmentHint: string | null;
  recommendation: string | null;
  resultJson: Record<string, unknown>;
}

export interface ConsultationAsset {
  id: string;
  consultationId: string;
  assetType: string;
  s3Key: string;
  publicUrl: string | null;
  cloudfrontUrl: string | null;
}

export async function getAiResult(consultationId: string): Promise<{ status: string; result: AiResult | null; assets: ConsultationAsset[] }> {
  return apiRequest(`/api/ai/results/${consultationId}`);
}

export async function mockProcess(consultationId: string): Promise<{ result: AiResult; assets: ConsultationAsset[] }> {
  return apiRequest("/api/ai/mock-process", {
    method: "POST",
    body: JSON.stringify({ consultationId })
  });
}
