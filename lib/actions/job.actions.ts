"use server";

/**
 * job.actions.ts
 *
 * Server actions for jobs and job applications — backed by the Java Spring Boot API.
 *
 * ─── Jobs ────────────────────────────────────────────────────────────────────
 *  GET    /api/jobs                          → paginated list (enrolled users only)
 *  GET    /api/jobs/{id}                     → full job detail (enrolled users only)
 *  GET    /api/jobs/search                   → search by keyword / location / jobType
 *  GET    /api/jobs/top                      → top jobs by application count
 *  GET    /api/jobs/my-jobs                  → jobs posted by the current admin user
 *  POST   /api/jobs                          → create job  (ADMIN only)
 *  PUT    /api/jobs/{id}                     → update job  (ADMIN only)
 *  DELETE /api/jobs/{id}                     → delete job  (ADMIN only)
 *
 * ─── Applications ────────────────────────────────────────────────────────────
 *  POST   /api/applications/jobs/{jobId}               → apply for a job
 *  DELETE /api/applications/{applicationId}            → withdraw application
 *  GET    /api/applications/jobs/{jobId}               → all applicants for a job (admin)
 *  GET    /api/applications/my-applications            → my applications
 *  GET    /api/applications/jobs/{jobId}/check         → check if I already applied
 *  GET    /api/applications/jobs/{jobId}/count         → application count for a job
 *  GET    /api/applications/my-applications/count      → number of jobs I applied to
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Spring Page<T> wrapper — every paginated endpoint returns this shape.
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  /** Current page number (0-based) */
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

/**
 * Mirrors Java: JobSummaryResponse
 * Returned by list / search / top endpoints.
 */
export interface JobSummaryDTO {
  id: string;
  company: string;
  title: string;
  location?: string;
  jobType?: string;
  /** e.g. "ACTIVE" | "EXPIRED" | "CLOSED" */
  status: string;
  applicationCount: number;
  viewCount: number;
  createdAt: string;
  active: boolean;
}

/**
 * Mirrors Java: JobResponse
 * Returned by GET /api/jobs/{id}, POST, and PUT.
 */
export interface JobDTO {
  id: string;
  userId: string;
  company: string;
  title: string;
  description: string;
  /** External application URL */
  link: string;
  sourceSite?: string;
  externalId?: string;
  status: string;
  location?: string;
  salaryRange?: string;
  jobType?: string;
  applicationCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  active: boolean;
}

/**
 * Mirrors Java: JobCreateRequest
 * Used for POST /api/jobs (ADMIN only).
 */
export interface JobCreatePayload {
  company: string;
  title: string;
  description: string;
  link: string;
  sourceSite?: string;
  externalId?: string;
  location?: string;
  salaryRange?: string;
  jobType?: string;
  /** ISO datetime string e.g. "2025-12-31T00:00:00" */
  expiresAt?: string;
}

/**
 * Mirrors Java: JobUpdateRequest
 * All fields are optional — only provided fields are updated.
 */
export interface JobUpdatePayload {
  company?: string;
  title?: string;
  description?: string;
  link?: string;
  location?: string;
  salaryRange?: string;
  jobType?: string;
  status?: string;
  expiresAt?: string;
}

/**
 * Mirrors Java: JobApplicationResponse
 */
export interface JobApplicationDTO {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantId: string;
  applicantEmail: string;
  appliedAt: string;
}

// ─── Job Actions ──────────────────────────────────────────────────────────────

/**
 * getAllJobs
 * GET /api/jobs?page=&size=
 *
 * Returns a paginated list of all jobs, newest first.
 * Requires the user to be enrolled in at least one course.
 */
export async function getAllJobs(page = 0, size = 20) {
  try {
    const data = await apiGet<PageResponse<JobSummaryDTO>>(
      `/api/jobs?page=${page}&size=${size}`
    );
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load jobs",
      data: null,
    };
  }
}

/**
 * getJobById
 * GET /api/jobs/{id}
 *
 * Returns full job detail. Also increments the view count.
 * Requires the user to be enrolled in at least one course.
 */
export async function getJobById(id: string) {
  try {
    const job = await apiGet<JobDTO>(`/api/jobs/${id}`);
    return { success: true as const, job };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Job not found",
    };
  }
}

/**
 * searchJobs
 * GET /api/jobs/search?keyword=&location=&jobType=&page=&size=
 *
 * Searches jobs by keyword (title / description), location, or jobType.
 * Requires enrollment.
 */
export async function searchJobs(params: {
  keyword?: string;
  location?: string;
  jobType?: string;
  page?: number;
  size?: number;
}) {
  try {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.location) query.set("location", params.location);
    if (params.jobType) query.set("jobType", params.jobType);
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 20));

    const data = await apiGet<PageResponse<JobSummaryDTO>>(
      `/api/jobs/search?${query.toString()}`
    );
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Search failed",
      data: null,
    };
  }
}

/**
 * getTopJobs
 * GET /api/jobs/top?page=&size=
 *
 * Returns jobs ordered by application count (most applied first).
 */
export async function getTopJobs(page = 0, size = 10) {
  try {
    const data = await apiGet<PageResponse<JobSummaryDTO>>(
      `/api/jobs/top?page=${page}&size=${size}`
    );
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load top jobs",
      data: null,
    };
  }
}

// ─── Admin Job Actions ────────────────────────────────────────────────────────

/**
 * createJob
 * POST /api/jobs  (ADMIN only)
 */
export async function createJob(payload: JobCreatePayload) {
  try {
    const job = await apiPost<JobDTO>("/api/jobs", payload);
    return { success: true as const, job };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create job",
    };
  }
}

/**
 * updateJob
 * PUT /api/jobs/{id}  (ADMIN only)
 */
export async function updateJob(id: string, payload: JobUpdatePayload) {
  try {
    const job = await apiPut<JobDTO>(`/api/jobs/${id}`, payload);
    return { success: true as const, job };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to update job",
    };
  }
}

/**
 * deleteJob
 * DELETE /api/jobs/{id}  (ADMIN only)
 */
export async function deleteJob(id: string) {
  try {
    await apiDelete<void>(`/api/jobs/${id}`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to delete job",
    };
  }
}

/**
 * getMyJobs
 * GET /api/jobs/my-jobs  (jobs posted by the current admin user)
 */
export async function getMyJobs(page = 0, size = 20) {
  try {
    const data = await apiGet<PageResponse<JobSummaryDTO>>(
      `/api/jobs/my-jobs?page=${page}&size=${size}`
    );
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load your jobs",
      data: null,
    };
  }
}

// ─── Application Actions ──────────────────────────────────────────────────────

/**
 * applyForJob
 * POST /api/applications/jobs/{jobId}
 *
 * Applies the current authenticated user to the given job.
 * Returns 409 if the user already applied.
 */
export async function applyForJob(jobId: string) {
  try {
    const application = await apiPost<JobApplicationDTO>(
      `/api/applications/jobs/${jobId}`,
      {}
    );
    return { success: true as const, application };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to apply for job",
    };
  }
}

/**
 * withdrawApplication
 * DELETE /api/applications/{applicationId}
 */
export async function withdrawApplication(applicationId: string) {
  try {
    await apiDelete<void>(`/api/applications/${applicationId}`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to withdraw application",
    };
  }
}

/**
 * getApplicationsForJob
 * GET /api/applications/jobs/{jobId}?page=&size=
 *
 * Returns all applicants for a job. Intended for admin/employer views.
 */
export async function getApplicationsForJob(
  jobId: string,
  page = 0,
  size = 20
) {
  try {
    const data = await apiGet<PageResponse<JobApplicationDTO>>(
      `/api/applications/jobs/${jobId}?page=${page}&size=${size}`
    );
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to load applications",
      data: null,
    };
  }
}

/**
 * getMyApplications
 * GET /api/applications/my-applications?page=&size=
 *
 * Returns all jobs the current user has applied for.
 */
export async function getMyApplications(page = 0, size = 20) {
  try {
    const data = await apiGet<PageResponse<JobApplicationDTO>>(
      `/api/applications/my-applications?page=${page}&size=${size}`
    );
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to load your applications",
      data: null,
    };
  }
}

/**
 * checkIfApplied
 * GET /api/applications/jobs/{jobId}/check
 *
 * Returns true if the current user has already applied for this job.
 */
export async function checkIfApplied(jobId: string): Promise<boolean> {
  try {
    const result = await apiGet<{ hasApplied: boolean }>(
      `/api/applications/jobs/${jobId}/check`
    );
    return result.hasApplied;
  } catch {
    return false;
  }
}

/**
 * getApplicationCount
 * GET /api/applications/jobs/{jobId}/count
 */
export async function getApplicationCount(jobId: string): Promise<number> {
  try {
    const result = await apiGet<{ count: number }>(
      `/api/applications/jobs/${jobId}/count`
    );
    return result.count;
  } catch {
    return 0;
  }
}

/**
 * getMyApplicationCount
 * GET /api/applications/my-applications/count
 */
export async function getMyApplicationCount(): Promise<number> {
  try {
    const result = await apiGet<{ count: number }>(
      "/api/applications/my-applications/count"
    );
    return result.count;
  } catch {
    return 0;
  }
}
