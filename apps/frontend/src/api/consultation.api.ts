import { apiRequest } from "./client";

export interface Consultation {
  id: string;
  status: string;
  symptomSummary: string;
  contentData: {
    child_info: {
      age: number;
      gender: string;
    };
    user_input: {
      symptom_keywords: string[];
      symptom_summary: string;
    };
  };
  aiResultId: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function createConsultation(input: {
  name: string;
  age: number;
  gender: string;
  symptoms: string;
}): Promise<Consultation> {
  const payload = await apiRequest<{ consultation: Consultation }>("/api/consultations", {
    method: "POST",
    body: JSON.stringify(input)
  });
  return payload.consultation;
}

export async function listConsultations(): Promise<Consultation[]> {
  const payload = await apiRequest<{ consultations: Consultation[] }>("/api/consultations");
  return payload.consultations;
}

export async function getConsultation(id: string): Promise<Consultation> {
  const payload = await apiRequest<{ consultation: Consultation }>(`/api/consultations/${id}`);
  return payload.consultation;
}

export async function completeConsultation(id: string): Promise<Consultation> {
  const payload = await apiRequest<{ consultation: Consultation }>(`/api/consultations/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ promptVersion: "v1.0" })
  });
  return payload.consultation;
}

export async function getConsultationResult(id: string) {
  return apiRequest(`/api/consultations/${id}/result`);
}
