"use server";

import { apiGet, apiPost } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuestionOptionDTO {
  id: string;
  text: string;
  displayOrder: number;
}

export interface QuestionDTO {
  id: string;
  text: string;
  dimensionCode: string;
  displayOrder: number;
  options: QuestionOptionDTO[];
}

export interface StartAssessmentResponse {
  assessmentId: string;
  startedAt: string;
  questions: QuestionDTO[];
}

export interface DimensionScoreDTO {
  poleA: string;
  poleB: string;
  poleALabel: string;
  poleBLabel: string;
  poleAScore: number;
  poleBScore: number;
  poleAPercent: number;
  poleBPercent: number;
  winner: string;
}

export interface PersonalityTypeDTO {
  code: string;
  name: string;
  description: string;
}

export interface AssessmentResultResponse {
  assessmentId: string;
  completedAt: string;
  personalityType: PersonalityTypeDTO;
  dimensionScores: Record<string, DimensionScoreDTO>;
}

export interface AssessmentHistoryResponse {
  assessmentId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  personalityType: PersonalityTypeDTO | null;
}

export interface AssessmentHistoryPageResponse {
  assessments: AssessmentHistoryResponse[];
  page: number;
  size: number;
  totalElements: number;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** POST /api/assessments — start a new personality assessment */
export async function startAssessment(): Promise<
  | { success: true; data: StartAssessmentResponse }
  | { success: false; message: string }
> {
  try {
    const data = await apiPost<StartAssessmentResponse>("/api/assessments", {});
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to start assessment" };
  }
}

/** POST /api/assessments/{id}/responses — save a single answer progressively */
export async function saveAssessmentResponse(
  assessmentId: string,
  questionId: string,
  selectedOptionId: string
): Promise<{ success: true } | { success: false; message: string }> {
  try {
    await apiPost(`/api/assessments/${assessmentId}/responses`, { questionId, selectedOptionId });
    return { success: true };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to save response" };
  }
}

/** POST /api/assessments/{id}/submit — submit all responses */
export async function submitAssessment(
  assessmentId: string,
  responses: { questionId: string; selectedOptionId: string }[]
): Promise<
  | { success: true; result: AssessmentResultResponse }
  | { success: false; message: string }
> {
  try {
    const result = await apiPost<AssessmentResultResponse>(
      `/api/assessments/${assessmentId}/submit`,
      { assessmentId, responses }
    );
    return { success: true, result };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to submit assessment" };
  }
}

/** GET /api/assessments/{id}/result */
export async function getAssessmentResult(assessmentId: string): Promise<
  | { success: true; result: AssessmentResultResponse }
  | { success: false; message: string }
> {
  try {
    const result = await apiGet<AssessmentResultResponse>(`/api/assessments/${assessmentId}/result`);
    return { success: true, result };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to fetch result" };
  }
}

/** GET /api/assessments/me/latest */
export async function getLatestAssessmentResult(): Promise<
  | { success: true; result: AssessmentResultResponse }
  | { success: false; message: string }
> {
  try {
    const result = await apiGet<AssessmentResultResponse>("/api/assessments/me/latest");
    return { success: true, result };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "No assessment found" };
  }
}

/** GET /api/assessments/me/history */
export async function getAssessmentHistory(page = 0, size = 10): Promise<
  | { success: true; data: AssessmentHistoryPageResponse }
  | { success: false; message: string }
> {
  try {
    const data = await apiGet<AssessmentHistoryPageResponse>(
      `/api/assessments/me/history?page=${page}&size=${size}`
    );
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to fetch history" };
  }
}


/** GET /api/assessments/eligible — true if user completed all lessons in an enrolled course */
export async function checkAssessmentEligibility(): Promise<boolean> {
  try {
    const data = await apiGet<{ eligible: boolean }>("/api/assessments/eligible");
    return data.eligible;
  } catch {
    return false;
  }
}
