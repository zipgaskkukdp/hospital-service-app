import { apiRequest } from "./client";

export interface HospitalRecommendation {
  id: string;
  name: string;
  department: string;
  address: string;
  distanceMeters: number;
  phone?: string;
  provider: string;
}

export async function recommendHospitals(input: {
  lat: number;
  lng: number;
  department?: string;
  consultationId?: string;
}): Promise<HospitalRecommendation[]> {
  const payload = await apiRequest<{ recommendations: HospitalRecommendation[] }>("/api/hospitals/recommend", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return payload.recommendations;
}
