//
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import type { BookingRequestBody, BookingResponse, CabinClass } from "@/lib/types";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001";

const VALID_CABIN_CLASSES: CabinClass[] = ["economy", "premium", "business", "first"];

export async function POST(request: NextRequest) {
  let payload: BookingRequestBody;

  try {
    payload = (await request.json()) as BookingRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const upstream = await fetch(`${BACKEND_URL}/api/v1/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });

  if (upstream.ok) {
    const data = (await upstream.json()) as BookingResponse;
    return Response.json(data, { status: upstream.status });
  }

  const errorBody = await upstream.json().catch(() => null);
  return Response.json(
    { error: (errorBody as { message?: string })?.message ?? `Upstream booking service responded with ${upstream.status}` },
    { status: upstream.status }
  );
}

function validatePayload(payload: BookingRequestBody | null | undefined): string | null {
  if (!payload || typeof payload !== "object") return "Missing payload";
  if (!payload.origin) return "Missing origin";
  if (!payload.destination) return "Missing destination";
  const normalizedCabin = String(payload.cabinClass || "").trim().toLowerCase() as CabinClass;
  if (!normalizedCabin || !VALID_CABIN_CLASSES.includes(normalizedCabin)) return "Invalid cabinClass";
  payload.cabinClass = normalizedCabin;
  if (typeof payload.totalAmount !== "number" || Number.isNaN(payload.totalAmount) || payload.totalAmount < 0) return "Invalid totalAmount";
  if (!payload.currency) return "Missing currency";
  if (!payload.takeoffTime) return "Missing takeoffTime";
  if (!payload.arrivalTime) return "Missing arrivalTime";
  if (!payload.phone || !payload.phone.trim()) return "Missing phone";
  if (!Array.isArray(payload.passengers) || payload.passengers.length === 0) return "At least one passenger is required";
  for (const p of payload.passengers) {
    if (!p.type || !["adult", "child", "infant"].includes(p.type)) return "Invalid passenger type";
    if (!p.fullName || !p.fullName.trim()) return "Each passenger must have a full name";
    if ((p.type === "child" || p.type === "infant") && typeof p.age !== "number") return "Children and infants must include an age";
  }
  return null;
}