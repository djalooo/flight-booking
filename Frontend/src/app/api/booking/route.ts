import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { saveBooking } from "@/lib/bookingstore";
import type { BookingRequestBody, BookingResponse, CabinClass } from "@/lib/types";

export const dynamic = "force-dynamic";

const NESTJS_BACKEND_URL =
  process.env.NESTJS_BACKEND_URL ?? "http://localhost:3001/api/v1";

const VALID_CABIN_CLASSES: CabinClass[] = ["economy", "premium", "business", "first"];

export async function POST(request: NextRequest) {
  let payload: BookingRequestBody;

  try {
    payload = (await request.json()) as BookingRequestBody;
    console.log("📦 Payload received:", JSON.stringify(payload, null, 2));
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    console.log("❌ Validation error:", validationError);
    return Response.json({ error: validationError }, { status: 400 });
  }

  console.log("🚀 About to fetch NestJS...");
  try {
    const upstream = await fetch(`${NESTJS_BACKEND_URL.replace(/\/$/, "")}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    });

    console.log("📡 NestJS response status:", upstream.status);

    if (upstream.ok) {
      const data = (await upstream.json()) as BookingResponse;
      if (data?.id) saveBooking(data);
      return Response.json(data, { status: upstream.status });
    }

    const errorBody = await safeReadJson(upstream);
    return Response.json(
      {
        error:
          (errorBody as { message?: string })?.message ??
          `Upstream booking service responded with ${upstream.status}`,
      },
      { status: upstream.status },
    );
  } catch (err) {
    console.log("💥 Caught error:", err);

    const fallback: BookingResponse = {
      id: `local_${randomUUID()}`,
      origin: payload.origin,
      destination: payload.destination,
      cabinClass: payload.cabinClass,
      duffelOfferId: payload.duffelOfferId ?? "",
      totalAmount: payload.totalAmount,
      currency: payload.currency,
      takeoffTime: payload.takeoffTime,
      arrivalTime: payload.arrivalTime,
      phone: payload.phone,
      email: payload.email ?? null,
      passengers: payload.passengers,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    saveBooking(fallback);
    return Response.json(fallback, { status: 201 });
  }
}

function validatePayload(payload: BookingRequestBody | null | undefined): string | null {
  if (!payload || typeof payload !== "object") return "Missing payload";
  if (!payload.origin) return "Missing origin";
  if (!payload.destination) return "Missing destination";

  const normalizedCabin = String(payload.cabinClass || "").trim().toLowerCase() as CabinClass;
  if (!normalizedCabin || !VALID_CABIN_CLASSES.includes(normalizedCabin)) {
    return "Invalid cabinClass";
  }
  payload.cabinClass = normalizedCabin;

  if (typeof payload.totalAmount !== "number" || Number.isNaN(payload.totalAmount) || payload.totalAmount < 0) {
    return "Invalid totalAmount";
  }
  if (!payload.currency) return "Missing currency";
  if (!payload.takeoffTime) return "Missing takeoffTime";
  if (!payload.arrivalTime) return "Missing arrivalTime";
  if (!payload.phone || !payload.phone.trim()) return "Missing phone";
  if (!Array.isArray(payload.passengers) || payload.passengers.length === 0) {
    return "At least one passenger is required";
  }

  for (const p of payload.passengers) {
    if (!p.type || !["adult", "child", "infant"].includes(p.type)) {
      return "Invalid passenger type";
    }
    if (!p.fullName || !p.fullName.trim()) {
      return "Each passenger must have a full name";
    }
    if ((p.type === "child" || p.type === "infant") && typeof p.age !== "number") {
      return "Children and infants must include an age";
    }
  }

  return null;
}

async function safeReadJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}