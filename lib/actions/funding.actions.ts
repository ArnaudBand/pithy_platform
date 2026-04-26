"use server";

/**
 * funding.actions.ts
 *
 * Server actions for fundings and funding applications.
 * Backed exclusively by the Java Spring Boot API.
 *
 * ─── Fundings ─────────────────────────────────────────────────────────────────
 *  POST   /api/fundings                        → create (ADMIN only)
 *  GET    /api/fundings                        → all fundings
 *  GET    /api/fundings/{id}                   → by ID
 *  GET    /api/fundings/my-fundings            → admin's own fundings
 *  GET    /api/fundings/recent                 → recent (last N days)
 *  GET    /api/fundings/search?searchTerm=     → search by company name
 *  GET    /api/fundings/type/{fundingType}     → filter by type
 *  GET    /api/fundings/status/{status}        → filter by status
 *  PUT    /api/fundings/{id}                   → update (ADMIN only)
 *  DELETE /api/fundings/{id}                   → delete (ADMIN only)
 *  PATCH  /api/fundings/{id}/complete          → mark complete (ADMIN only)
 *  PATCH  /api/fundings/{id}/cancel            → mark cancelled (ADMIN only)
 *  PATCH  /api/fundings/{id}/verify            → verify (ADMIN only)
 *
 * ─── Applications ─────────────────────────────────────────────────────────────
 *  POST   /api/funding-applications                         → submit application
 *  GET    /api/funding-applications/my-applications         → user's applications
 *  GET    /api/funding-applications/funding/{fundingId}     → all apps (ADMIN)
 *  PATCH  /api/funding-applications/{id}/withdraw           → withdraw
 *  PATCH  /api/funding-applications/{id}/approve            → approve (ADMIN)
 *  PATCH  /api/funding-applications/{id}/reject             → reject (ADMIN)
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api/client";

// ─── Enums ────────────────────────────────────────────────────────────────────

export type FundingStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "PARTIALLY_FUNDED";

export type FundingApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN"
  | "ON_HOLD";

// ─── Funding Types ────────────────────────────────────────────────────────────

/**
 * Mirrors Java: FundingDTO
 * Returned by all funding read endpoints.
 */
export interface FundingDTO {
  fundingId: string;
  companyName: string;
  fundingType: string;
  fundingRound?: string;
  /** BigDecimal → number */
  fundingAmount: number;
  currency: string;
  fundingDate: string;           // "yyyy-MM-dd"
  expectedClosingDate?: string;  // "yyyy-MM-dd"
  leadInvestor?: string;
  coInvestors?: string;
  numberOfInvestors?: number;
  industrySector?: string;
  industrySubcategory?: string;
  companyLocation?: string;
  countryCode?: string;
  status: FundingStatus;
  fundingPurpose?: string;
  notes?: string;
  pressReleaseUrl?: string;
  dealStructure?: string;
  isFollowOn?: boolean;
  includesDebt?: boolean;
  isVerified?: boolean;
  isConfidential?: boolean;
  createdByUserEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Mirrors Java: FundingDTO (used as request body for create/update)
 * Required fields: companyName, fundingType, fundingAmount, currency, fundingDate, status
 */
export interface FundingCreatePayload {
  companyName: string;
  fundingType: string;
  fundingAmount: number;
  currency: string;
  fundingDate: string;           // "yyyy-MM-dd"
  status: FundingStatus;
  fundingRound?: string;
  expectedClosingDate?: string;  // "yyyy-MM-dd"
  leadInvestor?: string;
  industrySector?: string;
  companyLocation?: string;
  fundingPurpose?: string;
  pressReleaseUrl?: string;
}

export type FundingUpdatePayload = FundingCreatePayload;

// ─── Application Types ────────────────────────────────────────────────────────

/**
 * Mirrors Java: FundingApplicationDTO
 * Used for POST (create) and returned by read endpoints.
 */
export interface FundingApplicationDTO {
  id?: string;
  fundingId: string;
  status: FundingApplicationStatus;
  applicationNumber?: string;
  // Company
  companyName: string;
  companyDescription: string;
  companyWebsite?: string;
  companyRegistrationNumber?: string;
  industrySector?: string;
  // Financial request
  amountRequested: number;
  currency: string;
  useOfFunds: string;
  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  // Documents
  businessPlanUrl?: string;
  pitchDeckUrl?: string;
  // Read-only (returned by backend)
  fundingCompanyName?: string;
  fundingType?: string;
  fundingAmount?: number;
  userEmail?: string;
  userName?: string;
  appliedAt?: string;
  reviewStatus?: string;
  feedback?: string;
  rejectionReason?: string;
  termsOffered?: string;
}

// ─── Funding Actions ──────────────────────────────────────────────────────────

/**
 * getAllFundings
 * GET /api/fundings
 */
export async function getAllFundings() {
  try {
    // Backend returns either FundingDTO[] or { message, data: [] } when empty
    const raw = await apiGet<FundingDTO[] | { message: string; data: FundingDTO[] }>(
      "/api/fundings"
    );
    const fundings = Array.isArray(raw) ? raw : (raw as { data: FundingDTO[] }).data ?? [];
    return { success: true as const, fundings };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load fundings",
      fundings: [] as FundingDTO[],
    };
  }
}

/**
 * getFundingById
 * GET /api/fundings/{id}
 */
export async function getFundingById(id: string) {
  try {
    const funding = await apiGet<FundingDTO>(`/api/fundings/${id}`);
    return { success: true as const, funding };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Funding not found",
    };
  }
}

/**
 * getMyFundings
 * GET /api/fundings/my-fundings  (ADMIN — own records)
 */
export async function getMyFundings() {
  try {
    const fundings = await apiGet<FundingDTO[]>("/api/fundings/my-fundings");
    return { success: true as const, fundings };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load your fundings",
      fundings: [] as FundingDTO[],
    };
  }
}

/**
 * getRecentFundings
 * GET /api/fundings/recent?days=
 */
export async function getRecentFundings(days = 30) {
  try {
    const fundings = await apiGet<FundingDTO[]>(`/api/fundings/recent?days=${days}`);
    return { success: true as const, fundings };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load recent fundings",
      fundings: [] as FundingDTO[],
    };
  }
}

/**
 * searchFundings
 * GET /api/fundings/search?searchTerm=
 */
export async function searchFundings(searchTerm: string) {
  try {
    const fundings = await apiGet<FundingDTO[]>(
      `/api/fundings/search?searchTerm=${encodeURIComponent(searchTerm)}`
    );
    return { success: true as const, fundings };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Search failed",
      fundings: [] as FundingDTO[],
    };
  }
}

/**
 * getFundingsByType
 * GET /api/fundings/type/{fundingType}
 */
export async function getFundingsByType(fundingType: string) {
  try {
    const fundings = await apiGet<FundingDTO[]>(`/api/fundings/type/${encodeURIComponent(fundingType)}`);
    return { success: true as const, fundings };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to filter by type",
      fundings: [] as FundingDTO[],
    };
  }
}

// ─── Admin Funding Actions ────────────────────────────────────────────────────

/**
 * createFunding
 * POST /api/fundings  (ADMIN only)
 */
export async function createFunding(payload: FundingCreatePayload) {
  try {
    const funding = await apiPost<FundingDTO>("/api/fundings", payload);
    return { success: true as const, funding };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create funding",
    };
  }
}

/**
 * updateFunding
 * PUT /api/fundings/{id}  (ADMIN only)
 */
export async function updateFunding(id: string, payload: FundingUpdatePayload) {
  try {
    const funding = await apiPut<FundingDTO>(`/api/fundings/${id}`, payload);
    return { success: true as const, funding };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to update funding",
    };
  }
}

/**
 * deleteFunding
 * DELETE /api/fundings/{id}  (ADMIN only)
 */
export async function deleteFunding(id: string) {
  try {
    await apiDelete<void>(`/api/fundings/${id}`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to delete funding",
    };
  }
}

/**
 * completeFunding
 * PATCH /api/fundings/{id}/complete  (ADMIN only)
 */
export async function completeFunding(id: string) {
  try {
    const funding = await apiPatch<FundingDTO>(`/api/fundings/${id}/complete`, {});
    return { success: true as const, funding };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to mark as complete",
    };
  }
}

/**
 * cancelFunding
 * PATCH /api/fundings/{id}/cancel  (ADMIN only)
 */
export async function cancelFunding(id: string) {
  try {
    const funding = await apiPatch<FundingDTO>(`/api/fundings/${id}/cancel`, {});
    return { success: true as const, funding };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to cancel funding",
    };
  }
}

/**
 * verifyFunding
 * PATCH /api/fundings/{id}/verify  (ADMIN only)
 */
export async function verifyFunding(id: string) {
  try {
    const funding = await apiPatch<FundingDTO>(`/api/fundings/${id}/verify`, {});
    return { success: true as const, funding };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to verify funding",
    };
  }
}

// ─── Application Actions ──────────────────────────────────────────────────────

/**
 * submitFundingApplication
 * POST /api/funding-applications
 *
 * Required: fundingId, companyName, companyDescription,
 *           amountRequested, currency, useOfFunds,
 *           contactName, contactEmail, status
 */
export async function submitFundingApplication(payload: FundingApplicationDTO) {
  try {
    const application = await apiPost<FundingApplicationDTO>(
      "/api/funding-applications",
      { ...payload, status: "SUBMITTED" }
    );
    return { success: true as const, application };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to submit application",
    };
  }
}

/**
 * getMyFundingApplications
 * GET /api/funding-applications/my-applications
 */
export async function getMyFundingApplications() {
  try {
    const applications = await apiGet<FundingApplicationDTO[]>(
      "/api/funding-applications/my-applications"
    );
    return { success: true as const, applications };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load your applications",
      applications: [] as FundingApplicationDTO[],
    };
  }
}

/**
 * getApplicationsForFunding
 * GET /api/funding-applications/funding/{fundingId}  (ADMIN only)
 */
export async function getApplicationsForFunding(fundingId: string) {
  try {
    const applications = await apiGet<FundingApplicationDTO[]>(
      `/api/funding-applications/funding/${fundingId}`
    );
    return { success: true as const, applications };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load applicants",
      applications: [] as FundingApplicationDTO[],
    };
  }
}

/**
 * withdrawFundingApplication
 * PATCH /api/funding-applications/{id}/withdraw
 */
export async function withdrawFundingApplication(applicationId: string) {
  try {
    const application = await apiPatch<FundingApplicationDTO>(
      `/api/funding-applications/${applicationId}/withdraw`,
      {}
    );
    return { success: true as const, application };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to withdraw application",
    };
  }
}
