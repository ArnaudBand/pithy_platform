"use server";

/**
 * payment.actions.ts
 *
 * Admin-only server actions for payment data.
 * All backed by the Java Spring Boot API (ADMIN role required).
 *
 * ─── Endpoints ───────────────────────────────────────────────────────────────
 *  GET  /api/admin/payments            → all course payments
 *  GET  /api/admin/payments/scenario   → all scenario-assessment purchases
 *  GET  /api/admin/payments/summary    → aggregated revenue + count stats
 */

import { apiGet } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "CANCELLED";

/**
 * A single Flutterwave course-payment record.
 * Maps to the `payments` database table.
 */
export interface AdminCoursePaymentDTO {
  /** Internal UUID of the payment record */
  paymentId: string;
  /** UUID of the user who made the payment */
  userId: string;
  /** Email of the user who made the payment */
  userEmail: string;
  /** UUID of the course that was purchased */
  courseId: string;
  /** Title of the course that was purchased */
  courseTitle: string;
  /** Amount charged (BigDecimal → number) */
  amount: number;
  /** Currency code, e.g. "UGX" */
  currency: string;
  /** PENDING | SUCCESSFUL | FAILED | CANCELLED */
  status: PaymentStatus;
  /** Payment method reported by Flutterwave (card, mobilemoney, etc.) or null */
  paymentMethod: string | null;
  /** Internal transaction reference (TXN-xxxx) */
  transactionReference: string;
  /** Flutterwave transaction ID used to verify the payment, or null */
  flutterwaveTransactionId: string | null;
  /** ISO-8601 timestamp when the payment record was created */
  createdAt: string;
  /** ISO-8601 timestamp when the payment was confirmed, or null if not yet completed */
  completedAt: string | null;
}

/**
 * A single scenario-assessment access purchase.
 * Maps to the `scenario_assessment_access` table.
 * Always 5,000 UGX per purchase.
 */
export interface AdminScenarioPaymentDTO {
  /** Internal UUID of the access record */
  accessId: string;
  /** UUID of the user who purchased access */
  userId: string;
  /** Email of the user who purchased access */
  userEmail: string;
  /** Fixed amount: 5000 */
  amountPaid: number;
  /** Always "UGX" */
  currency: string;
  /** ISO-8601 timestamp when access was granted */
  paidAt: string;
  /** Flutterwave transaction reference, or null */
  transactionRef: string | null;
}

/**
 * Aggregated payment statistics shown on the admin payments dashboard.
 */
export interface AdminPaymentSummaryDTO {
  // ── Course payments ────────────────────────────────────────────────────────
  /** Total number of course payment records (all statuses) */
  totalCoursePayments: number;
  /** Payments with status SUCCESSFUL */
  successfulCoursePayments: number;
  /** Payments with status PENDING */
  pendingCoursePayments: number;
  /** Payments with status FAILED */
  failedCoursePayments: number;
  /** Payments with status CANCELLED */
  cancelledCoursePayments: number;
  /** Sum of all SUCCESSFUL course payment amounts */
  totalCourseRevenue: number;

  // ── Scenario payments ──────────────────────────────────────────────────────
  /** Total number of scenario-assessment access purchases */
  totalScenarioPayments: number;
  /** totalScenarioPayments × 5,000 UGX */
  totalScenarioRevenue: number;

  // ── Combined ───────────────────────────────────────────────────────────────
  /** totalCourseRevenue + totalScenarioRevenue */
  totalRevenue: number;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/payments
 * Returns every course payment record with user + course info.
 * Sorted newest-first on the client (createdAt desc).
 */
export async function getAdminCoursePayments(page = 0, size = 50): Promise<
  | { success: true; payments: AdminCoursePaymentDTO[] }
  | { success: false; message: string }
> {
  try {
    const data = await apiGet<{ content: AdminCoursePaymentDTO[] } | AdminCoursePaymentDTO[]>(
      `/api/admin/payments?page=${page}&size=${Math.min(size, 100)}`
    );
    // Backend returns a Spring Page object; extract the content array
    const payments = Array.isArray(data) ? data : (data as { content: AdminCoursePaymentDTO[] }).content ?? [];
    return { success: true, payments };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch course payments";
    return { success: false, message };
  }
}

/**
 * GET /api/admin/payments/scenario
 * Returns every scenario-assessment access purchase with user info.
 * Sorted newest-first on the client (paidAt desc).
 */
export async function getAdminScenarioPayments(page = 0, size = 50): Promise<
  | { success: true; payments: AdminScenarioPaymentDTO[] }
  | { success: false; message: string }
> {
  try {
    const data = await apiGet<{ content: AdminScenarioPaymentDTO[] } | AdminScenarioPaymentDTO[]>(
      `/api/admin/payments/scenario?page=${page}&size=${Math.min(size, 100)}`
    );
    // Backend returns a Spring Page object; extract the content array
    const payments = Array.isArray(data) ? data : (data as { content: AdminScenarioPaymentDTO[] }).content ?? [];
    return { success: true, payments };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch scenario payments";
    return { success: false, message };
  }
}

/**
 * GET /api/admin/payments/summary
 * Returns aggregated revenue and count stats for both payment types.
 */
export async function getAdminPaymentSummary(): Promise<
  | { success: true; summary: AdminPaymentSummaryDTO }
  | { success: false; message: string }
> {
  try {
    const summary = await apiGet<AdminPaymentSummaryDTO>("/api/admin/payments/summary");
    return { success: true, summary };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch payment summary";
    return { success: false, message };
  }
}
