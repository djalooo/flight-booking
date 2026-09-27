import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const res = await fetch(`${BACKEND_URL}/api/v1/bookings/${params.id}`);
  if (!res.ok) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }
  const data = await res.json();
  return Response.json(data);
}