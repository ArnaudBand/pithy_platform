"use server";

/**
 * scholarship.actions.ts
 *
 * Server actions for scholarships and scholarship applications.
 * Backed exclusively by the Java Spring Boot API.
 *
 * ─── Scholarships ─────────────────────────────────────────────────────────────
 *  GET    /api/scholarships               → all scholarships (admin list)
 *  GET    /api/scholarships/active        → active scholarships (enrolled users)
 *  GET    /api/scholarships/{id}          → scholarship by ID
 *  GET    /api/scholarships/search        → search by keyword
 *  GET    /api/scholarships/mine          → scholarships posted by current admin
 *  POST   /api/scholarships              → create  (ADMIN only)
 *  PUT    /api/scholarships/{id}          → full update (ADMIN only)
 *  PATCH  /api/scholarships/{id}/status   → status-only update (ADMIN only)
 *  DELETE /api/scholarships/{id}          → delete  (ADMIN only)
 *
 * ─── Applications ─────────────────────────────────────────────────────────────
 *  POST   /api/scholarship-applications                                → apply
 *  GET    /api/scholarship-applications/my-applications                → user's apps
 *  GET    /api/scholarship-applications/my-applications/{id}           → single app
 *  PATCH  /api/scholarship-applications/my-applications/{id}/status    → update status
 *  DELETE /api/scholarship-applications/my-applications/{id}           → withdraw
 *  GET    /api/scholarship-applications/scholarship/{id}               → all applicants (admin)
 *  GET    /api/scholarship-applications/scholarship/{id}/count          → count (admin)
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api/client";

// ─── Enums ────────────────────────────────────────────────────────────────────

/** Mirrors Java: ScholarshipStatus */
export type ScholarshipStatus = "ACTIVE" | "CLOSED" | "EXPIRED";

/** Mirrors Java: ScholarshipApplicationStatus */
export type ScholarshipApplicationStatus = "PENDING" | "SUBMITTED" | "WITHDRAWN";

// ─── Scholarship Types ────────────────────────────────────────────────────────

/**
 * Mirrors Java: ScholarshipResponseDTO
 * Returned by all read endpoints.
 */
export interface ScholarshipDTO {
  id: string;
  title: string;
  description?: string;
  applicationUrl: string;
  provider?: string;
  /** ISO datetime string e.g. "2025-12-31T00:00:00" */
  deadline: string;
  status: ScholarshipStatus;
  createdAt: string;
  /** Email of the admin who created this scholarship */
  createdByEmail: string;
}

/**
 * Mirrors Java: ScholarshipRequestDTO
 * Used for POST (create) and PUT (update).
 */
export interface ScholarshipCreatePayload {
  title: string;
  description?: string;
  /** Must be a valid URL */
  applicationUrl: string;
  provider?: string;
  /** ISO datetime string, must be a future date */
  deadline: string;
}

/** Alias – same shape as create for full updates */
export type ScholarshipUpdatePayload = ScholarshipCreatePayload;

/**
 * Mirrors Java: ScholarshipStatusUpdateDTO
 * Used for PATCH /api/scholarships/{id}/status
 */
export interface ScholarshipStatusUpdatePayload {
  status: ScholarshipStatus;
}

// ─── Application Types ────────────────────────────────────────────────────────

/**
 * Mirrors Java: ScholarshipApplicationResponseDTO
 */
export interface ScholarshipApplicationDTO {
  id: string;
  status: ScholarshipApplicationStatus;
  /** ISO datetime string */
  appliedAt: string;
  notes?: string;
  scholarshipId: string;
  scholarshipTitle: string;
  scholarshipApplicationUrl: string;
  /** ISO datetime string */
  scholarshipDeadline: string;
}

/**
 * Mirrors Java: ScholarshipApplicationRequestDTO
 * Used for POST /api/scholarship-applications
 */
export interface ScholarshipApplyPayload {
  scholarshipId: string;
  notes?: string;
}

/**
 * Mirrors Java: ScholarshipApplicationStatusUpdateDTO
 * Used for PATCH /api/scholarship-applications/my-applications/{id}/status
 */
export interface ScholarshipApplicationStatusUpdatePayload {
  status: ScholarshipApplicationStatus;
}

// ─── Scholarship Actions ──────────────────────────────────────────────────────

/**
 * getActiveScholarships
 * GET /api/scholarships/active
 *
 * Returns scholarships with ACTIVE status and deadline in the future.
 * Requires the user to be enrolled in at least one course.
 */
export async function getActiveScholarships() {
  try {
    const scholarships = await apiGet<ScholarshipDTO[]>("/api/scholarships/active");
    return { success: true as const, scholarships };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load scholarships",
      scholarships: [] as ScholarshipDTO[],
    };
  }
}

/**
 * getAllScholarships
 * GET /api/scholarships
 *
 * Returns all scholarships (admin view — all statuses).
 */
export async function getAllScholarships() {
  try {
    const scholarships = await apiGet<ScholarshipDTO[]>("/api/scholarships");
    return { success: true as const, scholarships };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load scholarships",
      scholarships: [] as ScholarshipDTO[],
    };
  }
}

/**
 * getScholarshipById
 * GET /api/scholarships/{id}
 */
export async function getScholarshipById(id: string) {
  try {
    const scholarship = await apiGet<ScholarshipDTO>(`/api/scholarships/${id}`);
    return { success: true as const, scholarship };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Scholarship not found",
    };
  }
}

/**
 * searchScholarships
 * GET /api/scholarships/search?keyword=
 *
 * Searches active scholarships by title keyword.
 */
export async function searchScholarships(keyword: string) {
  try {
    const scholarships = await apiGet<ScholarshipDTO[]>(
      `/api/scholarships/search?keyword=${encodeURIComponent(keyword)}`
    );
    return { success: true as const, scholarships };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Search failed",
      scholarships: [] as ScholarshipDTO[],
    };
  }
}

// ─── Admin Scholarship Actions ────────────────────────────────────────────────

/**
 * getMyScholarships
 * GET /api/scholarships/mine
 *
 * Returns scholarships created by the current admin user.
 */
export async function getMyScholarships() {
  try {
    const scholarships = await apiGet<ScholarshipDTO[]>("/api/scholarships/mine");
    return { success: true as const, scholarships };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load your scholarships",
      scholarships: [] as ScholarshipDTO[],
    };
  }
}

/**
 * createScholarship
 * POST /api/scholarships  (ADMIN only)
 */
export async function createScholarship(payload: ScholarshipCreatePayload) {
  try {
    const scholarship = await apiPost<ScholarshipDTO>("/api/scholarships", payload);
    return { success: true as const, scholarship };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create scholarship",
    };
  }
}

/**
 * updateScholarship
 * PUT /api/scholarships/{id}  (ADMIN only)
 */
export async function updateScholarship(id: string, payload: ScholarshipUpdatePayload) {
  try {
    const scholarship = await apiPut<ScholarshipDTO>(`/api/scholarships/${id}`, payload);
    return { success: true as const, scholarship };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to update scholarship",
    };
  }
}

/**
 * updateScholarshipStatus
 * PATCH /api/scholarships/{id}/status  (ADMIN only)
 */
export async function updateScholarshipStatus(
  id: string,
  payload: ScholarshipStatusUpdatePayload
) {
  try {
    const scholarship = await apiPatch<ScholarshipDTO>(
      `/api/scholarships/${id}/status`,
      payload
    );
    return { success: true as const, scholarship };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

/**
 * deleteScholarship
 * DELETE /api/scholarships/{id}  (ADMIN only)
 */
export async function deleteScholarship(id: string) {
  try {
    await apiDelete<void>(`/api/scholarships/${id}`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to delete scholarship",
    };
  }
}

// ─── Application Actions ──────────────────────────────────────────────────────

/**
 * applyForScholarship
 * POST /api/scholarship-applications
 *
 * Applies the current user to a scholarship.
 * Requires an active scholarship and a completed user profile.
 */
export async function applyForScholarship(payload: ScholarshipApplyPayload) {
  try {
    const application = await apiPost<ScholarshipApplicationDTO>(
      "/api/scholarship-applications",
      payload
    );
    return { success: true as const, application };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to apply",
    };
  }
}

/**
 * getMyScholarshipApplications
 * GET /api/scholarship-applications/my-applications
 *
 * Returns all scholarship applications by the current user.
 */
export async function getMyScholarshipApplications() {
  try {
    const applications = await apiGet<ScholarshipApplicationDTO[]>(
      "/api/scholarship-applications/my-applications"
    );
    return { success: true as const, applications };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to load your applications",
      applications: [] as ScholarshipApplicationDTO[],
    };
  }
}

/**
 * getMyScholarshipApplication
 * GET /api/scholarship-applications/my-applications/{applicationId}
 */
export async function getMyScholarshipApplication(applicationId: string) {
  try {
    const application = await apiGet<ScholarshipApplicationDTO>(
      `/api/scholarship-applications/my-applications/${applicationId}`
    );
    return { success: true as const, application };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Application not found",
    };
  }
}

/**
 * updateScholarshipApplicationStatus
 * PATCH /api/scholarship-applications/my-applications/{applicationId}/status
 *
 * Allowed transitions: PENDING → SUBMITTED, any → WITHDRAWN
 */
export async function updateScholarshipApplicationStatus(
  applicationId: string,
  payload: ScholarshipApplicationStatusUpdatePayload
) {
  try {
    const application = await apiPatch<ScholarshipApplicationDTO>(
      `/api/scholarship-applications/my-applications/${applicationId}/status`,
      payload
    );
    return { success: true as const, application };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to update status",
    };
  }
}

/**
 * withdrawScholarshipApplication
 * DELETE /api/scholarship-applications/my-applications/{applicationId}
 */
export async function withdrawScholarshipApplication(applicationId: string) {
  try {
    await apiDelete<void>(
      `/api/scholarship-applications/my-applications/${applicationId}`
    );
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to withdraw application",
    };
  }
}

/**
 * getApplicationsForScholarship
 * GET /api/scholarship-applications/scholarship/{scholarshipId}
 *
 * Admin only — returns all applicants for a scholarship they created.
 */
export async function getApplicationsForScholarship(scholarshipId: string) {
  try {
    const applications = await apiGet<ScholarshipApplicationDTO[]>(
      `/api/scholarship-applications/scholarship/${scholarshipId}`
    );
    return { success: true as const, applications };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to load applicants",
      applications: [] as ScholarshipApplicationDTO[],
    };
  }
}

/**
 * getScholarshipApplicationCount
 * GET /api/scholarship-applications/scholarship/{scholarshipId}/count
 *
 * Admin only — returns the number of applications for a scholarship.
 */
export async function getScholarshipApplicationCount(
  scholarshipId: string
): Promise<number> {
  try {
    const count = await apiGet<number>(
      `/api/scholarship-applications/scholarship/${scholarshipId}/count`
    );
    return count;
  } catch {
    return 0;
  }
}
