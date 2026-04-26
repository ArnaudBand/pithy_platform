"use server";

/**
 * profile.actions.ts
 *
 * Server actions for profile management — backed by the Java Spring Boot API.
 * Endpoints (all require a valid JWT cookie except where noted):
 *
 *  POST   /api/profiles/register/{userId}  → ProfileRegistrationRequest  → ProfileResponse
 *  GET    /api/profiles/{userId}           → —                           → ProfileResponse
 *  PUT    /api/profiles/{userId}           → ProfileRegistrationRequest  → ProfileResponse
 *  DELETE /api/profiles/{userId}           → —                           → string message
 */

import { cookies } from "next/headers";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api/client";

/**
 * Reads the JWT token directly from the cookie store within this server action
 * context. This is more reliable than letting client.ts read cookies via its
 * own import, because when a server action is invoked from a client component
 * the request context may not propagate correctly into imported utility modules.
 */
async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get("token")?.value;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirroring the Java DTOs exactly
// ─────────────────────────────────────────────────────────────────────────────

/** Maps to Java enum UserCategory */
export type UserCategory = "STUDENT" | "EMPLOYEE" | "OWNER";

/** Maps to Java ProfileRegistrationRequest */
export interface ProfileRequest {
  // Common (required)
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  category: UserCategory;

  // Common (optional)
  bio?: string;

  // STUDENT-specific
  major?: string;
  educationLevel?: string;
  institutionName?: string;
  faculty?: string;
  subject?: string;
  yearOfGraduation?: string;

  // EMPLOYEE-specific
  companyName?: string;
  position?: string;
  department?: string;
  employmentType?: string;
  yearsOfExperience?: string;

  // OWNER-specific
  businessName?: string;
  businessType?: string;
  registrationNumber?: string;
  industry?: string;
}

/** Student details nested inside ProfileResponse */
export interface StudentProfile {
  major?: string;
  educationLevel?: string;
  institutionName?: string;
  faculty?: string;
  subject?: string;
  yearOfGraduation?: string;
}

// ─── Raw API response shape ───────────────────────────────────────────────────
// The Java endpoint returns { profile: Profile, details: Student|Employee|Owner }

interface RawProfileCore {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  bio?: string;
  category: UserCategory;
}

/** Student entity uses snake_case for two fields (JPA column names leak through) */
interface RawStudentDetails {
  major?: string;
  educationLevel?: string;
  institution_name?: string;   // ← snake_case from JPA entity
  faculty?: string;
  subject?: string;
  year_of_graduation?: string; // ← snake_case from JPA entity
}

interface RawEmployeeDetails {
  companyName?: string;
  position?: string;
  department?: string;
  employmentType?: string;
  yearsOfExperience?: string;
}

interface RawOwnerDetails {
  businessName?: string;
  businessType?: string;
  registrationNumber?: string;
  industry?: string;
}

interface RawProfileApiResponse {
  profile: RawProfileCore;
  details: RawStudentDetails & RawEmployeeDetails & RawOwnerDetails;
}

/** Employee details nested inside ProfileResponse */
export interface EmployeeProfile {
  companyName?: string;
  position?: string;
  department?: string;
  employmentType?: string;
  yearsOfExperience?: string;
}

/** Owner details nested inside ProfileResponse */
export interface OwnerProfile {
  businessName?: string;
  businessType?: string;
  registrationNumber?: string;
  industry?: string;
}

/** Full profile response returned by GET / POST / PUT */
export interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  bio?: string;
  category: UserCategory;
  student?: StudentProfile;
  employee?: EmployeeProfile;
  owner?: OwnerProfile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * createProfile
 * POST /api/profiles/register/{userId}
 * Creates a new profile for the given user. Requires JWT cookie.
 */
export async function createProfile(userId: string, data: ProfileRequest) {
  try {
    const token = await getToken();
    const profile = await apiPost<ProfileResponse>(
      `/api/profiles/register/${userId}`,
      data,
      true,
      token
    );
    return { success: true, profile };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile creation failed";
    return { success: false, message };
  }
}

/**
 * getProfile
 * GET /api/profiles/{userId}
 * Retrieves the profile and category-specific details for a user.
 *
 * The Java API returns { profile: {...}, details: {...} }.
 * This function normalises that into a single ProfileResponse so components
 * don't need to know about the wrapper or the snake_case field names.
 */
export async function getProfile(userId: string) {
  try {
    const raw = await apiGet<RawProfileApiResponse>(`/api/profiles/${userId}`, true);
    const { profile: core, details } = raw;

    const normalized: ProfileResponse = {
      id: core.id,
      firstName: core.firstName,
      lastName: core.lastName,
      phoneNumber: core.phoneNumber,
      address: core.address,
      bio: core.bio,
      category: core.category,
    };

    if (core.category === "STUDENT" && details) {
      normalized.student = {
        major: details.major,
        educationLevel: details.educationLevel,
        institutionName: details.institution_name, // normalise snake_case → camelCase
        faculty: details.faculty,
        subject: details.subject,
        yearOfGraduation: details.year_of_graduation, // normalise snake_case → camelCase
      };
    } else if (core.category === "EMPLOYEE" && details) {
      normalized.employee = {
        companyName: details.companyName,
        position: details.position,
        department: details.department,
        employmentType: details.employmentType,
        yearsOfExperience: details.yearsOfExperience,
      };
    } else if (core.category === "OWNER" && details) {
      normalized.owner = {
        businessName: details.businessName,
        businessType: details.businessType,
        registrationNumber: details.registrationNumber,
        industry: details.industry,
      };
    }

    return { success: true, profile: normalized };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile not found";
    return { success: false, message };
  }
}

/**
 * updateProfile
 * PUT /api/profiles/{userId}
 * Updates an existing profile. Sends only the fields that changed.
 */
export async function updateProfile(userId: string, data: Partial<ProfileRequest>) {
  try {
    const token = await getToken();
    const profile = await apiPut<ProfileResponse>(
      `/api/profiles/${userId}`,
      data,
      true,
      token
    );
    return { success: true, profile };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile update failed";
    return { success: false, message };
  }
}

/**
 * deleteProfile
 * DELETE /api/profiles/{userId}
 */
export async function deleteProfile(userId: string) {
  try {
    const token = await getToken();
    await apiDelete(`/api/profiles/${userId}`, true, token);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile deletion failed";
    return { success: false, message };
  }
}
