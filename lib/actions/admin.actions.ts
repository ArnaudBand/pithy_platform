"use server";

/**
 * admin.actions.ts
 *
 * Server actions for admin user management.
 * All backed by the Java Spring Boot API.
 *
 * ─── Basic Users (UserController) ───────────────────────────────────────────
 *  GET    /api/users                  → list all users (basic)   (ADMIN only)
 *  DELETE /api/users/{id}             → delete user
 *
 * ─── Enriched Admin (AdminController) ───────────────────────────────────────
 *  GET    /api/admin/users            → all users + enrollments + payments
 *  GET    /api/admin/users/{id}       → single user summary
 */

import { apiDelete, apiGet, apiPut } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN" | "GUEST";
export type PaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "CANCELLED";
export type AssessmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type ScenarioAssessmentStatus = "NOT_PAID" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface AdminUserDTO {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminEnrollmentInfo {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  courseCurrency: string;
  enrolledAt: string;
  // null when course was free
  paymentStatus: PaymentStatus | null;
  amountPaid: number | null;
  transactionReference: string | null;
  paidAt: string | null;
  // Course progress
  lessonsTotal: number;
  lessonsCompleted: number;
  progressPercent: number; // 0–100
}

export interface AdminUserSummaryDTO {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  /** Admin has temporarily disabled this account — user cannot log in */
  isDisabled: boolean;
  /** Admin has blocked this account — locked at the security layer */
  isBlocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  enrollmentCount: number;
  hasPaid: boolean;
  totalAmountPaid: number;
  enrollments: AdminEnrollmentInfo[];
  // Regular assessment
  assessmentStatus: AssessmentStatus;
  assessmentCompletedAt: string | null;
  assessmentPersonalityType: string | null; // e.g. "INTJ", null if not completed
  // Scenario assessment
  hasScenarioPaid: boolean;
  scenarioAssessmentStatus: ScenarioAssessmentStatus;
  scenarioCompletedAt: string | null;
  scenarioPersonalityType: string | null; // null if not completed
}

// ─── Enriched Admin Actions ───────────────────────────────────────────────────

/** GET /api/admin/users?page=&size= — paginated users with enrollments + payment history */
export async function getAdminUsers(page = 0, size = 50): Promise<
  | { success: true; users: AdminUserSummaryDTO[]; totalElements: number; totalPages: number }
  | { success: false; message: string }
> {
  try {
    const data = await apiGet<{ content: AdminUserSummaryDTO[]; totalElements: number; totalPages: number }>(
      `/api/admin/users?page=${page}&size=${Math.min(size, 100)}`
    );
    return { success: true, users: data.content, totalElements: data.totalElements, totalPages: data.totalPages };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch users";
    return { success: false, message };
  }
}

/** GET /api/admin/users/{id} — single user enriched summary */
export async function getAdminUserSummary(id: string): Promise<
  | { success: true; user: AdminUserSummaryDTO }
  | { success: false; message: string }
> {
  try {
    const user = await apiGet<AdminUserSummaryDTO>(`/api/admin/users/${id}`);
    return { success: true, user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch user";
    return { success: false, message };
  }
}

// ─── User Account Management ──────────────────────────────────────────────────

/**
 * PUT /api/admin/users/{id}/role
 * Changes the user's role. Existing JWTs are invalidated server-side.
 */
export async function changeUserRole(id: string, role: UserRole): Promise<
  | { success: true; user: AdminUserSummaryDTO }
  | { success: false; message: string }
> {
  try {
    const user = await apiPut<AdminUserSummaryDTO>(`/api/admin/users/${id}/role`, { role });
    return { success: true, user };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to change role" };
  }
}

/**
 * PUT /api/admin/users/{id}/disable
 * Toggles the disabled flag. Disabled users cannot log in.
 */
export async function toggleUserDisabled(id: string): Promise<
  | { success: true; user: AdminUserSummaryDTO }
  | { success: false; message: string }
> {
  try {
    const user = await apiPut<AdminUserSummaryDTO>(`/api/admin/users/${id}/disable`, {});
    return { success: true, user };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to toggle disabled" };
  }
}

/**
 * PUT /api/admin/users/{id}/block
 * Toggles the blocked flag. Blocked accounts are locked at the security layer.
 */
export async function toggleUserBlocked(id: string): Promise<
  | { success: true; user: AdminUserSummaryDTO }
  | { success: false; message: string }
> {
  try {
    const user = await apiPut<AdminUserSummaryDTO>(`/api/admin/users/${id}/block`, {});
    return { success: true, user };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Failed to toggle blocked" };
  }
}

// ─── Basic User Actions ───────────────────────────────────────────────────────

/** DELETE /api/users/{id} — delete a user */
export async function deleteUser(id: string): Promise<
  | { success: true }
  | { success: false; message: string }
> {
  try {
    await apiDelete(`/api/users/${id}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete user";
    return { success: false, message };
  }
}
