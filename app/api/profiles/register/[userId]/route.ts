import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const body = await request.json();

  const backendUrl = process.env.INTERNAL_API_URL?.trim() || "http://localhost:8080";

    const response = await fetch(
      `${backendUrl}/api/profiles/register/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profile creation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
