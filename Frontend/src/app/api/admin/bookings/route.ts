import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/api/v1/bookings`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).pathname.split("/").pop();
  const res = await fetch(`${BACKEND_URL}/api/v1/bookings/${id}`, {
    method: "DELETE",
  });
  return new NextResponse(null, { status: res.status });
}

export async function PATCH(request: Request) {
  const id = new URL(request.url).pathname.split("/").pop();
  const body = await request.json();
  const res = await fetch(`${BACKEND_URL}/api/v1/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}