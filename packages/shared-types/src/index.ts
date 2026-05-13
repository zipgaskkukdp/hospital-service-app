export type UserRole = "USER" | "ADMIN";
export type ConsultationStatus = "DRAFT" | "SUBMITTED" | "RESULT_READY" | "CANCELLED";
export type AiResultStatus = "PENDING" | "COMPLETED" | "FAILED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
export type AiProvider = "mock" | "bedrock";
export type AssetType = "IMAGE" | "PDF" | "JSON_REPORT";
export type MapProvider = "mock" | "kakao" | "naver";

export interface JwtClaims {
  sub: string;
  email: string;
  nickname: string;
  role: UserRole;
}

export interface PublicUser {
  id: string;
  email: string;
  nickname: string;
  role: UserRole;
  onpremProfileId: string | null;
  createdAt?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface ConsultationContentData {
  child_info: {
    age: number;
    gender: string;
  };
  user_input: {
    symptom_keywords: string[];
    symptom_summary: string;
  };
  ai_process?: {
    prompt_version: string;
    requested_at: string;
  };
}

export interface Consultation {
  id: string;
  userId: string;
  childRefId: string | null;
  status: ConsultationStatus;
  contentData: ConsultationContentData;
  symptomSummary: string;
  aiResultId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiResult {
  id: string;
  consultationId: string;
  userId: string;
  status: AiResultStatus;
  summary: string | null;
  riskLevel: RiskLevel;
  departmentHint: string | null;
  recommendation: string | null;
  resultJson: Record<string, unknown>;
  modelProvider: AiProvider;
  modelId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BoardPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalRecommendation {
  id: string;
  name: string;
  department: string;
  address: string;
  distanceMeters: number;
  phone?: string;
  provider: MapProvider;
}
