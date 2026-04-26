import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080";

async function getToken() {
  const store = await cookies();
  return store.get("token")?.value ?? null;
}

/** GET /api/admin/scenario-assessments — all scenario assessments with user/result detail */
export async function GET() {
  const token = await getToken();
  const res = await fetch(`${backendUrl}/api/admin/scenario-assessments`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
