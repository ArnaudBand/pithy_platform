import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const backendUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080";

async function getToken() {
  const store = await cookies();
  return store.get("token")?.value ?? null;
}

/** PUT /api/admin/questions/[questionId] — update a question */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const token = await getToken();
  const body = await request.json();
  const res = await fetch(`${backendUrl}/api/admin/questions/${questionId}`, {
    method: "PUT",
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

/** DELETE /api/admin/questions/[questionId] — soft-delete a question */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const token = await getToken();
  const res = await fetch(`${backendUrl}/api/admin/questions/${questionId}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
