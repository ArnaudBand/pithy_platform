/**
 * Core HTTP client for the Java Spring Boot backend.
 * All requests are routed through here so auth headers are handled in one place.
 */

import { cookies } from "next/headers";
import env from "@/env";

const BASE_URL = env.api.baseUrl;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function getHeaders(includeAuth = true): Promise<HeadersInit> {
  const headers: HeadersInit = { "Content-Type": "application/json" };

  if (includeAuth) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = res.statusText;
    try {
      // Read the raw body once — try JSON first, fall back to plain text
      const text = await res.text();
      try {
        const body = JSON.parse(text);
        message = (body.message ?? body.error ?? text) || message;
      } catch {
        // Backend returned plain text (e.g. "Error: Name is null")
        message = text || message;
      }
    } catch {
      // Failed to read body at all — keep statusText
    }
    throw new Error(message);
  }

  // Some endpoints return 200 with an empty body (e.g. ResponseEntity<Void>).
  // Attempting res.json() on an empty body throws a SyntaxError, so we read
  // the body as text first and only parse if there is something to parse.
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// ---------------------------------------------------------------------------
// Public methods
// ---------------------------------------------------------------------------

export async function apiGet<T>(path: string, auth = true, token?: string): Promise<T> {
  const headers = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : await getHeaders(auth);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  auth = true,
  /** Optional explicit token — bypasses the cookie lookup when provided. */
  token?: string
): Promise<T> {
  const headers = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : await getHeaders(auth);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  auth = true,
  token?: string
): Promise<T> {
  const headers = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : await getHeaders(auth);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return handleResponse<T>(res);
}

/**
 * apiPostFormData / apiPutFormData
 * For multipart/form-data endpoints (Spring @RequestParam with optional file uploads).
 * Content-Type is intentionally NOT set — fetch adds the boundary automatically
 * when the body is a FormData instance.
 */
export async function apiPostFormData<T>(
  path: string,
  formData: FormData,
  auth = true
): Promise<T> {
  const cookieStore = await cookies();
  const token = auth ? cookieStore.get("token")?.value : undefined;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
    cache: "no-store",
  });
  return handleResponse<T>(res);
}

export async function apiPutFormData<T>(
  path: string,
  formData: FormData,
  auth = true
): Promise<T> {
  const cookieStore = await cookies();
  const token = auth ? cookieStore.get("token")?.value : undefined;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers,
    body: formData,
    cache: "no-store",
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, auth = true, token?: string): Promise<T> {
  const headers = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : await getHeaders(auth);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers,
    cache: "no-store",
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  auth = true
): Promise<T> {
  const headers = await getHeaders(auth);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return handleResponse<T>(res);
}

