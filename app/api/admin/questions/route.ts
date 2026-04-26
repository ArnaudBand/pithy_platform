import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080";

async function getToken() {
  const store = await cookies();
  return store.get("token")?.value ?? null;
}

/** GET /api/admin/questions — list all Likert questions */
export async function GET() {
  const token = await getToken();
  const res = await fetch(`${backendUrl}/api/admin/questions`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/** POST /api/admin/questions — create a question */
export async function POST(request: NextRequest) {
  const token = await getToken();
  const body = await request.json();
  const res = await fetch(`${backendUrl}/api/admin/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
