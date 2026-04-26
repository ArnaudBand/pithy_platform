"use server";

import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";
import {
  AssessmentResultResponse,
  DimensionScoreDTO,
  PersonalityTypeDTO,
} from "./assessment.actions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScenarioOptionDTO {
  id: string;
  text: string;
  displayOrder: number;
}

export interface ScenarioQuestionDTO {
  id: string;
  text: string;
  dimensionCode: string;
  displayOrder: number;
  options: ScenarioOptionDTO[];
}

export interface StartScenarioAssessmentResponse {
  assessmentId: string;
  startedAt: string;
  questions: ScenarioQuestionDTO[];
}

export interface ScenarioResultResponse {
  assessmentId: string;
  completedAt: string;
  personalityType: PersonalityTypeDTO;
  dimensionScores: Record<string, DimensionScoreDTO>;
}

export interface CombinedProfileResponse {
  scenarioResult: ScenarioResultResponse | null;
  likertResult: AssessmentResultResponse | null;
}

// ── Admin types ───────────────────────────────────────────────────────────────

export interface ScenarioOptionRequest {
  text: string;
  poleTarget: string; // e.g. "E", "I", "N", "S", "T", "F", "J", "P"
  displayOrder: number;
}

export interface ScenarioQuestionRequest {
  text: string;
  dimensionCode: string;
  displayOrder: number;
  options: ScenarioOptionRequest[];
}

export interface ScenarioQuestionResponse {
  id: string;
  text: string;
  dimensionCode: string;
  displayOrder: number;
  active: boolean;
  options: (ScenarioOptionDTO & { poleTarget?: string })[];
}

// ─── Access / Payment actions ─────────────────────────────────────────────────

export interface ScenarioAccessInfo {
  hasPaid: boolean;
  /** How many of the 3 attempts included in this payment are still unused. */
  remainingAttempts: number;
}

/** GET /api/scenario-assessment/access — check if user has paid and how many attempts remain. */
export async function checkScenarioAccess(): Promise<ScenarioAccessInfo> {
  try {
    const data = await apiGet<{ hasPaid: boolean; remainingAttempts: number }>(
      "/api/scenario-assessment/access"
    );
    return { hasPaid: data.hasPaid, remainingAttempts: data.remainingAttempts };
  } catch {
    return { hasPaid: false, remainingAttempts: 0 };
  }
}

/**
 * POST /api/scenario-assessment/initiate-payment
 * Creates a Flutterwave checkout link for 5,000 UGX.
 * @param redirectUrl  The page Flutterwave will redirect back to after payment
 *                     (e.g. window.location.href of the scenario-assessment page)
 */
export async function initiateScenarioPayment(redirectUrl: string): Promise<
  | { success: true; paymentLink: string; txRef: string }
  | { success: false; message: string }
> {
  try {
    const data = await apiPost<{ paymentLink: string; txRef: string }>(
      "/api/scenario-assessment/initiate-payment",
      { redirectUrl }
    );
    return { success: true, paymentLink: data.paymentLink, txRef: data.txRef };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to initiate payment",
    };
  }
}

/**
 * POST /api/scenario-assessment/verify-payment
 * Called after Flutterwave redirects back — verifies the transaction
 * with Flutterwave and grants the user access.
 */
export async function verifyScenarioPayment(
  transactionId: string,
  txRef: string
): Promise<{ success: true } | { success: false; message: string }> {
  try {
    await apiPost("/api/scenario-assessment/verify-payment", { transactionId, txRef });
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Payment verification failed",
    };
  }
}

// ─── User actions ─────────────────────────────────────────────────────────────

/** POST /api/scenario-assessment/start */
export async function startScenarioAssessment(): Promise<
  | { success: true; data: StartScenarioAssessmentResponse }
  | { success: false; message: string }
> {
  try {
    const data = await apiPost<StartScenarioAssessmentResponse>(
      "/api/scenario-assessment/start",
      {}
    );
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to start scenario assessment",
    };
  }
}

/** POST /api/scenario-assessment/{id}/response — save a single answer */
export async function saveScenarioResponse(
  assessmentId: string,
  questionId: string,
  selectedOptionId: string
): Promise<{ success: true } | { success: false; message: string }> {
  try {
    await apiPost(`/api/scenario-assessment/${assessmentId}/response`, {
      questionId,
      selectedOptionId,
    });
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to save response",
    };
  }
}

/** POST /api/scenario-assessment/submit */
export async function submitScenarioAssessment(
  assessmentId: string,
  responses: { questionId: string; selectedOptionId: string }[]
): Promise<
  | { success: true; result: ScenarioResultResponse }
  | { success: false; message: string }
> {
  try {
    const result = await apiPost<ScenarioResultResponse>(
      "/api/scenario-assessment/submit",
      { assessmentId, responses }
    );
    return { success: true, result };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to submit assessment",
    };
  }
}

/** GET /api/scenario-assessment/latest-result */
export async function getLatestScenarioResult(): Promise<
  | { success: true; result: ScenarioResultResponse }
  | { success: false; message: string }
> {
  try {
    const result = await apiGet<ScenarioResultResponse>(
      "/api/scenario-assessment/latest-result"
    );
    return { success: true, result };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "No scenario result found",
    };
  }
}

/** GET /api/scenario-assessment/combined-profile */
export async function getCombinedProfile(): Promise<
  | { success: true; data: CombinedProfileResponse }
  | { success: false; message: string }
> {
  try {
    const data = await apiGet<CombinedProfileResponse>(
      "/api/scenario-assessment/combined-profile"
    );
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to fetch profile",
    };
  }
}

// ─── Admin actions ────────────────────────────────────────────────────────────

/** GET /api/scenario-questions — admin: list all questions */
export async function adminGetScenarioQuestions(): Promise<
  | { success: true; questions: ScenarioQuestionResponse[] }
  | { success: false; message: string }
> {
  try {
    const questions = await apiGet<ScenarioQuestionResponse[]>("/api/scenario-questions");
    return { success: true, questions };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to fetch questions",
    };
  }
}

/** POST /api/scenario-questions — admin: create a question */
export async function adminCreateScenarioQuestion(
  request: ScenarioQuestionRequest
): Promise<
  | { success: true; question: ScenarioQuestionResponse }
  | { success: false; message: string }
> {
  try {
    const question = await apiPost<ScenarioQuestionResponse>(
      "/api/scenario-questions",
      request
    );
    return { success: true, question };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to create question",
    };
  }
}

/** PUT /api/scenario-questions/{id} — admin: update a question */
export async function adminUpdateScenarioQuestion(
  id: string,
  request: ScenarioQuestionRequest
): Promise<
  | { success: true; question: ScenarioQuestionResponse }
  | { success: false; message: string }
> {
  try {
    const question = await apiPut<ScenarioQuestionResponse>(
      `/api/scenario-questions/${id}`,
      request
    );
    return { success: true, question };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to update question",
    };
  }
}

/** DELETE /api/scenario-questions/{id} — admin: delete a question */
export async function adminDeleteScenarioQuestion(id: string): Promise<
  | { success: true }
  | { success: false; message: string }
> {
  try {
    await apiDelete(`/api/scenario-questions/${id}`);
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Failed to delete question",
    };
  }
}
