"use server";

/**
 * auth.actions.ts
 *
 * Server actions for authentication — backed exclusively by the Java Spring Boot API.
 * All shapes are derived from the actual Java DTOs:
 *
 *  POST   /api/users/register                → UserRegistrationRequest  → RegistrationResponse
 *  POST   /api/users/login                   → UserLoginRequest         → LoginResponse
 *  GET    /api/users/verify?token=…          → —                        → SuccessResponse
 *  POST   /api/users/resend-verification     → ?email=…                 → SuccessResponse
 *  POST   /api/users/forgot-password         → ForgotPasswordRequest    → SuccessResponse
 *  POST   /api/users/reset-password          → PasswordResetRequest     → SuccessResponse
 *  GET    /api/users/{id}                    → —                        → UserResponse       (auth required)
 *  GET    /api/users/email/{email}           → —                        → UserResponse       (auth required)
 *  PUT    /api/users/{id}                    → UserUpdateRequest        → UserResponse       (auth required)
 *  PUT    /api/users/{id}/change-password    → PasswordChangeRequest    → SuccessResponse    (auth required)
 *  DELETE /api/users/{id}                    → —                        → SuccessResponse    (auth required)
 */

import { cookies } from "next/headers";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

// ─────────────────────────────────────────────────────────────────────────────
// Types that mirror the Java DTOs exactly
// ─────────────────────────────────────────────────────────────────────────────

/** UserResponse — returned by /register (inside wrapper) and GET /users/{id} */
export interface AuthUser {
  id: string;           // UUID serialised as string
  email: string;
  createdAt: string;    // LocalDateTime serialised as ISO string
  /** Role extracted from the JWT claims — not part of the API response */
  role: "ADMIN" | "USER" | "GUEST";
}

/** LoginResponse — returned by POST /users/login */
export interface AuthSession extends AuthUser {
  lastLoginAt: string;
  token: string;
}

/** The wrapper object returned by POST /users/register */
interface RegistrationResponse {
  message: string;
  user: AuthUser;
}

/** Generic success / error envelopes the Java API uses */
interface ApiSuccess {
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cookie helpers
// ─────────────────────────────────────────────────────────────────────────────

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days — matches backend refresh window

async function setTokenCookie(token: string) {
  (await cookies()).set(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    // "lax" is required so the cookie is sent when the browser follows a
    // cross-site redirect back to our app (e.g. from Flutterwave checkout).
    // "strict" blocks the cookie on that first returning GET, causing
    // getCurrentUser() to return null and bouncing the user to sign-in.
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  });
}

async function clearTokenCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

async function getTokenFromCookie(): Promise<string | null> {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null;
}

/**
 * Decode the JWT payload (base64url) without verifying the signature.
 * Safe to use server-side for extracting the subject (user UUID) and email.
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(part, "base64").toString("utf8"));
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public auth actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * register
 * POST /api/users/register
 * Body: { email, password }
 * Returns the user object on success.
 * The backend sends an email-verification link automatically.
 */
export async function register(email: string, password: string) {
  try {
    const data = await apiPost<RegistrationResponse>(
      "/api/users/register",
      { email, password },
      false // public endpoint — no auth header
    );
    return { success: true, message: data.message, user: data.user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return { success: false, message };
  }
}

/**
 * login
 * POST /api/users/login
 * Body: { email, password }
 * Stores the JWT in an httpOnly cookie on success.
 */
export async function login(email: string, password: string) {
  try {
    const data = await apiPost<AuthSession>(
      "/api/users/login",
      { email, password },
      false // public endpoint
    );

    await setTokenCookie(data.token);

    // Decode the JWT we just stored so callers know the role immediately —
    // the backend's LoginResponse doesn't include a role field.
    const payload = decodeJwtPayload(data.token);
    const roles = payload.roles as string[] | undefined;
    const role = (roles?.[0] ?? "USER") as AuthUser["role"];

    // Check profile existence HERE — within the same server action so the
    // cookie we just set is already readable by apiGet (no cross-request race).
    let profileExists = false;
    if (role !== "ADMIN") {
      profileExists = await hasProfile(data.id, data.token);
    }

    return { success: true, user: { ...data, role }, profileExists };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return { success: false, message };
  }
}

/**
 * logout
 * Removes the JWT cookie — no backend call needed.
 */
export async function logout() {
  await clearTokenCookie();
  return { success: true };
}

/**
 * getCurrentUser
 * Reads the JWT from the cookie, decodes the user ID, then fetches the full
 * UserResponse from GET /api/users/{id}.
 * Returns null when the user is not logged in.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = await getTokenFromCookie();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    // JwtService sets sub = userDetails.getUsername() which is the email,
    // not the UUID — so we must use the /email/{email} endpoint.
    const subject = payload.sub as string | undefined;
    if (!subject) return null;

    // The API now returns role directly — no JWT claim parsing needed.
    const user = await apiGet<AuthUser>(
      `/api/users/email/${encodeURIComponent(subject)}`
    );

    // Defensive fallback: if the API somehow doesn't include role, read it
    // from the JWT "roles" claim (e.g. ["ADMIN"]).
    if (!user.role) {
      const roles = payload.roles as string[] | undefined;
      (user as AuthUser).role = (roles?.[0] ?? "USER") as AuthUser["role"];
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * isAdmin
 * Returns true if the current user has the ADMIN role.
 * Safe to call from both server components and client components (via server action).
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

/**
 * verifyEmail
 * GET /api/users/verify?token={token}
 * Called from the email-verification link the user clicks.
 */
export async function verifyEmail(token: string) {
  try {
    const data = await apiGet<ApiSuccess>(
      `/api/users/verify?token=${encodeURIComponent(token)}`,
      false // public endpoint
    );
    return { success: true, message: data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return { success: false, message };
  }
}

/**
 * resendVerification
 * POST /api/users/resend-verification?email={email}
 */
export async function resendVerification(email: string) {
  try {
    const data = await apiPost<ApiSuccess>(
      `/api/users/resend-verification?email=${encodeURIComponent(email)}`,
      undefined,
      false // public endpoint
    );
    return { success: true, message: data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not resend verification";
    return { success: false, message };
  }
}

/**
 * forgotPassword
 * POST /api/users/forgot-password
 * Body: { email }
 * Always returns success (the backend never reveals whether the email exists).
 */
export async function forgotPassword(email: string) {
  try {
    const data = await apiPost<ApiSuccess>(
      "/api/users/forgot-password",
      { email },
      false // public endpoint
    );
    return { success: true, message: data.message };
  } catch {
    // Backend intentionally swallows errors here — mirror that behaviour
    return { success: true, message: "If the email exists, a password reset link has been sent." };
  }
}

/**
 * resetPassword
 * POST /api/users/reset-password
 * Body: { token, newPassword }
 * newPassword must be ≥ 8 characters (Java @Size constraint).
 */
export async function resetPassword(token: string, newPassword: string) {
  try {
    const data = await apiPost<ApiSuccess>(
      "/api/users/reset-password",
      { token, newPassword },
      false // public endpoint
    );
    return { success: true, message: data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password reset failed";
    return { success: false, message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated user actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getUserById
 * GET /api/users/{id}
 * Requires a valid JWT cookie.
 */
export async function getUserById(id: string) {
  try {
    const user = await apiGet<AuthUser>(`/api/users/${id}`);
    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "User not found";
    return { success: false, message };
  }
}

/**
 * getUserByEmail
 * GET /api/users/email/{email}
 * Requires a valid JWT cookie.
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await apiGet<AuthUser>(`/api/users/email/${encodeURIComponent(email)}`);
    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "User not found";
    return { success: false, message };
  }
}

/**
 * updateUser
 * PUT /api/users/{id}
 * Body: fields accepted by UserUpdateRequest on the Java side.
 * Requires a valid JWT cookie.
 */
export async function updateUser(id: string, fields: Record<string, unknown>) {
  try {
    const user = await apiPut<AuthUser>(`/api/users/${id}`, fields);
    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return { success: false, message };
  }
}

/**
 * changePassword
 * PUT /api/users/{id}/change-password
 * Body: { oldPassword, newPassword }
 * Requires a valid JWT cookie.
 */
export async function changePassword(
  id: string,
  oldPassword: string,
  newPassword: string
) {
  try {
    const data = await apiPut<ApiSuccess>(
      `/api/users/${id}/change-password`,
      { oldPassword, newPassword }
    );
    return { success: true, message: data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Password change failed";
    return { success: false, message };
  }
}

/**
 * deleteUser
 * DELETE /api/users/{id}
 * Requires a valid JWT cookie.
 */
export async function deleteUser(id: string) {
  try {
    const data = await apiDelete<ApiSuccess>(`/api/users/${id}`);
    return { success: true, message: data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Deletion failed";
    return { success: false, message };
  }
}

/**
 * hasProfile
 * GET /api/profiles/{userId}
 * Returns true if the user has completed their profile, false otherwise.
 * Used after login to decide whether to redirect to dashboard or create-profile.
 * Requires a valid JWT cookie (set by login()).
 */
export async function hasProfile(userId: string, token?: string): Promise<boolean> {
  try {
    await apiGet(`/api/profiles/${userId}`, true, token);
    return true;
  } catch {
    return false;
  }
}
