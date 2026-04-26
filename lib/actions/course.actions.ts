"use server";

/**
 * course.actions.ts
 *
 * Server actions for courses, lessons, enrollments, and progress tracking.
 * All backed by the Java Spring Boot API.
 *
 * ─── Courses ────────────────────────────────────────────────────────────────
 *  GET    /api/courses                            → list all courses (public)
 *  GET    /api/courses/{id}                       → get single course (public)
 *
 * ─── Lessons ────────────────────────────────────────────────────────────────
 *  GET    /api/lessons/course/{courseId}          → list lessons for a course
 *                                                   (free lessons are visible to all;
 *                                                    paid lessons require enrollment)
 *  GET    /api/lessons/{lessonId}                 → get a single lesson
 *                                                   (403 if paid and not enrolled)
 *  PUT    /api/lessons/{lessonId}/progress        → update watch progress
 *  GET    /api/lessons/course/{courseId}/progress → get all progress for a course
 *
 * ─── Enrollments ────────────────────────────────────────────────────────────
 *  GET    /api/enrollments/my-courses             → list user's enrollments
 *  GET    /api/enrollments/{enrollmentId}         → get enrollment detail with progress
 */

import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Mirrors Java: CourseResponse */
export interface CourseDTO {
  id: string;
  title: string;
  description: string;
  /** BigDecimal — serialised as a number by Jackson */
  price: number;
  currency: string;
  createdAt: string;
}

/** Mirrors Java: LessonSectionResponse */
export interface LessonSectionDTO {
  id: string;
  subtitle: string;
  content?: string;
  videoUrl?: string;
  /** Video chapter start in seconds */
  startTime?: number;
  /** Video chapter end in seconds */
  endTime?: number;
  orderIndex: number;
  createdAt: string;
}

/** Mirrors Java: LessonProgressResponse */
export interface LessonProgressDTO {
  id: string;
  lessonId: string;
  isCompleted: boolean;
  progressPercentage: number;
  lastWatchedPosition: number;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

/**
 * Mirrors Java: LessonResponse
 *
 * `overview`, `videoUrl`, and `sections` content are only populated by the
 * backend when the lesson is free OR the user is enrolled.  A non-enrolled
 * user calling GET /api/lessons/{lessonId} on a paid lesson receives a 403.
 */
export interface LessonDTO {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  /** Full lesson content — only present for free lessons or enrolled users */
  overview?: string;
  /** Main lesson video URL — only present for free lessons or enrolled users */
  videoUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  isFree: boolean;
  sections: LessonSectionDTO[];
  createdAt: string;
  /** Progress for the authenticated user — null if not started */
  progress?: LessonProgressDTO | null;
}

/** Mirrors Java: EnrollmentSectionResponse (lightweight — no content) */
export interface EnrollmentSectionDTO {
  id: string;
  subtitle: string;
  startTime?: number;
  endTime?: number;
  orderIndex: number;
  durationSeconds?: number;
}

/** Mirrors Java: EnrollmentLessonResponse */
export interface EnrollmentLessonDTO {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  orderIndex: number;
  isFree: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  lastWatchedPosition: number;
  startedAt?: string;
  completedAt?: string;
  sections: EnrollmentSectionDTO[];
}

/** Mirrors Java: EnrollmentResponse */
export interface EnrollmentDTO {
  id: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  coursePrice: number;
  courseCurrency: string;
  enrolledAt: string;
  lessons: EnrollmentLessonDTO[];
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}

// ─── Admin Request types ──────────────────────────────────────────────────────

/** Mirrors Java: CourseRequest */
export interface CourseRequestPayload {
  title: string;
  description?: string;
  price: number;
  currency: string;
}

/** Mirrors Java: LessonSectionRequest */
export interface LessonSectionPayload {
  subtitle: string;
  content?: string;
  videoUrl?: string;
  startTime?: number;
  endTime?: number;
  orderIndex: number;
}

/** Mirrors Java: LessonRequest */
export interface LessonRequestPayload {
  courseId: string;
  title: string;
  description?: string;
  overview?: string;
  videoUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  isFree?: boolean;
  sections?: LessonSectionPayload[];
}

// ─── Course Actions ───────────────────────────────────────────────────────────

/**
 * getAllCourses
 * GET /api/courses
 *
 * Public endpoint — any visitor can browse the course catalogue.
 */
export async function getAllCourses() {
  try {
    const courses = await apiGet<CourseDTO[]>("/api/courses", false);
    return { success: true as const, courses };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load courses",
      courses: [] as CourseDTO[],
    };
  }
}

/**
 * getCourseById
 * GET /api/courses/{id}
 *
 * Public endpoint — returns title, description, price, currency.
 */
export async function getCourseById(courseId: string) {
  try {
    const course = await apiGet<CourseDTO>(`/api/courses/${courseId}`, false);
    return { success: true as const, course };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Course not found",
    };
  }
}

// ─── Lesson Actions ───────────────────────────────────────────────────────────

/**
 * getCourseLessons
 * GET /api/lessons/course/{courseId}
 *
 * Returns all lessons for a course.  The backend enforces access control:
 *  - Free lessons → overview + videoUrl + sections are populated for everyone.
 *  - Paid lessons → overview + videoUrl + sections are populated only for
 *    enrolled users; non-enrolled users see title/description/isFree only so
 *    the frontend can render a locked preview.
 */
export async function getCourseLessons(courseId: string) {
  try {
    const lessons = await apiGet<LessonDTO[]>(
      `/api/lessons/course/${courseId}`
    );
    return { success: true as const, lessons };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load lessons",
      lessons: [] as LessonDTO[],
    };
  }
}

/**
 * getLessonById
 * GET /api/lessons/{lessonId}
 *
 * Returns the full lesson detail.
 *  - Returns the lesson if it is free, or if the user is enrolled.
 *  - Returns `{ enrolled: false }` if the lesson is paid and the user is not
 *    enrolled, so the UI can redirect to a payment/enrollment flow.
 */
export async function getLessonById(lessonId: string) {
  try {
    const lesson = await apiGet<LessonDTO>(`/api/lessons/${lessonId}`);
    return { success: true as const, lesson, enrolled: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load lesson";
    // 403 from the backend means the user is not enrolled
    const notEnrolled =
      message.toLowerCase().includes("enroll") ||
      message.toLowerCase().includes("403") ||
      message.toLowerCase().includes("access");
    return {
      success: false as const,
      enrolled: !notEnrolled,
      message,
    };
  }
}

/**
 * updateLessonProgress
 * PUT /api/lessons/{lessonId}/progress
 * Body: { progressPercentage, lastWatchedPosition, isCompleted }
 *
 * Called while the user watches a lesson to persist their watch position and
 * mark the lesson complete when they finish.
 */
export async function updateLessonProgress(
  lessonId: string,
  data: {
    progressPercentage: number;
    lastWatchedPosition: number;
    isCompleted: boolean;
  }
) {
  try {
    const progress = await apiPut<LessonProgressDTO>(
      `/api/lessons/${lessonId}/progress`,
      {
        progressPercentage: data.progressPercentage,
        lastWatchedPosition: data.lastWatchedPosition,
        isCompleted: data.isCompleted,
      }
    );
    return { success: true as const, progress };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to update progress",
    };
  }
}

/**
 * getCourseProgress
 * GET /api/lessons/course/{courseId}/progress
 *
 * Returns the authenticated user's progress for every lesson in the course.
 * Useful for rendering the sidebar progress bar and per-lesson completion icons.
 */
export async function getCourseProgress(courseId: string) {
  try {
    const progress = await apiGet<LessonProgressDTO[]>(
      `/api/lessons/course/${courseId}/progress`
    );
    return { success: true as const, progress };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to load progress",
      progress: [] as LessonProgressDTO[],
    };
  }
}

// ─── Enrollment Actions ───────────────────────────────────────────────────────

/**
 * getMyEnrollments
 * GET /api/enrollments/my-courses
 *
 * Returns all courses the authenticated user is enrolled in, together with
 * per-lesson progress and aggregate course progress.
 */
export async function getMyEnrollments() {
  try {
    const enrollments = await apiGet<EnrollmentDTO[]>(
      "/api/enrollments/my-courses"
    );
    return { success: true as const, enrollments };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to load enrollments",
      enrollments: [] as EnrollmentDTO[],
    };
  }
}

/**
 * getEnrollmentDetails
 * GET /api/enrollments/{enrollmentId}
 *
 * Returns a single enrollment with the full lesson + section list and
 * per-lesson progress for the authenticated user.
 */
export async function getEnrollmentDetails(enrollmentId: string) {
  try {
    const enrollment = await apiGet<EnrollmentDTO>(
      `/api/enrollments/${enrollmentId}`
    );
    return { success: true as const, enrollment };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to load enrollment",
    };
  }
}

/**
 * isEnrolledInCourse
 * GET /api/enrollments/check/{courseId}
 *
 * Directly checks whether the authenticated user is enrolled in a given course
 * via a lightweight EXISTS query on the backend — avoids loading the full
 * enrollment list and is immune to lazy-loading issues.
 */
export async function isEnrolledInCourse(courseId: string): Promise<boolean> {
  try {
    const result = await apiGet<{ enrolled: boolean }>(
      `/api/enrollments/check/${courseId}`
    );
    return result.enrolled;
  } catch {
    return false;
  }
}

// ─── Admin Course Actions ─────────────────────────────────────────────────────

/**
 * createCourse
 * POST /api/courses  (ADMIN only)
 *
 * Creates a new course. Requires the user to have the ADMIN role.
 */
export async function createCourse(payload: CourseRequestPayload) {
  try {
    const course = await apiPost<CourseDTO>("/api/courses", payload);
    return { success: true as const, course };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}

/**
 * updateCourse
 * PUT /api/courses/{id}  (ADMIN only)
 *
 * Updates an existing course by ID.
 */
export async function updateCourse(courseId: string, payload: CourseRequestPayload) {
  try {
    const course = await apiPut<CourseDTO>(`/api/courses/${courseId}`, payload);
    return { success: true as const, course };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to update course",
    };
  }
}

/**
 * deleteCourse
 * DELETE /api/courses/{id}  (ADMIN only)
 */
export async function deleteCourse(courseId: string) {
  try {
    await apiDelete<void>(`/api/courses/${courseId}`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to delete course",
    };
  }
}

// ─── Admin Lesson Actions ─────────────────────────────────────────────────────

/**
 * createLesson
 * POST /api/lessons  (ADMIN only)
 */
export async function createLesson(payload: LessonRequestPayload) {
  try {
    const lesson = await apiPost<LessonDTO>("/api/lessons", payload);
    return { success: true as const, lesson };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create lesson",
    };
  }
}

/**
 * updateLesson
 * PUT /api/lessons/{lessonId}  (ADMIN only)
 */
export async function updateLesson(lessonId: string, payload: LessonRequestPayload) {
  try {
    const lesson = await apiPut<LessonDTO>(`/api/lessons/${lessonId}`, payload);
    return { success: true as const, lesson };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to update lesson",
    };
  }
}

/**
 * deleteLesson
 * DELETE /api/lessons/{lessonId}  (ADMIN only)
 */
export async function deleteLesson(lessonId: string) {
  try {
    await apiDelete<void>(`/api/lessons/${lessonId}`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to delete lesson",
    };
  }
}

/**
 * getLessonByIdAdmin
 * GET /api/lessons/{lessonId}/admin  (ADMIN only)
 *
 * Returns the full lesson content regardless of enrollment status.
 * Used by admins to preview lessons without needing to be enrolled.
 */
export async function getLessonByIdAdmin(lessonId: string) {
  try {
    const lesson = await apiGet<LessonDTO>(`/api/lessons/${lessonId}/admin`);
    return { success: true as const, lesson };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load lesson",
    };
  }
}

// ─── Enrollment & Payment Actions (user-facing) ───────────────────────────────

/**
 * enrollInCourse
 * POST /api/enrollments/enroll/{courseId}
 *
 * Directly enrols the authenticated user in a course.
 * Only used for FREE courses — paid courses go through Flutterwave.
 */
export async function enrollInCourse(courseId: string) {
  try {
    const enrollment = await apiPost<EnrollmentDTO>(
      `/api/enrollments/enroll/${courseId}`,
      {}
    );
    return { success: true as const, enrollment };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to enroll in course",
    };
  }
}

/** Response shape from POST /api/payments/initiate */
interface PaymentInitiationResult {
  paymentLink: string;
  transactionReference: string;
}

/**
 * initiatePayment
 * POST /api/payments/initiate
 *
 * Creates a pending Payment record in the database and calls the Flutterwave
 * API to generate a hosted checkout link.  The caller should redirect the
 * user's browser to `paymentLink` after receiving this response.
 *
 * @param courseId    UUID of the course to purchase
 * @param redirectUrl URL Flutterwave will redirect back to after checkout
 *                    (typically the frontend /payment-callback page)
 */
export async function initiatePayment(courseId: string, redirectUrl: string) {
  try {
    const result = await apiPost<PaymentInitiationResult>(
      "/api/payments/initiate",
      { courseId, redirectUrl }
    );
    return {
      success: true as const,
      paymentLink: result.paymentLink,
      transactionReference: result.transactionReference,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Failed to initiate payment",
    };
  }
}

/**
 * verifyPayment
 * POST /api/payments/verify
 *
 * Called by the frontend payment-callback page after Flutterwave redirects
 * back.  The backend re-verifies the transaction with Flutterwave, marks the
 * Payment as SUCCESSFUL, and creates the Enrollment record.
 *
 * @param transactionId  Flutterwave transaction ID (from redirect URL param)
 * @param txRef          Internal transaction reference (from redirect URL param)
 */
export async function verifyPayment(transactionId: string, txRef: string) {
  try {
    await apiPost<void>("/api/payments/verify", { transactionId, txRef });
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message:
        error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}
