import type { NextRequest } from "next/server";
import { getBooking } from "@/lib/bookingstore";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const booking = getBooking(params.id);
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }
  return Response.json(booking);
}