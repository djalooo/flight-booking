// ============================================
// src/lib/flights.ts
// ============================================

import type { Cabin } from "@/lib/airports";
import type { CabinClass, FlightResult, PassengerCounts, SelectedFlight } from "@/lib/types";

export type SectionKey = "popular" | "escapes" | "longhaul" | "nextmonth";

// ============================================
// الدوال المساعدة
// ============================================

export async function searchFlights(params: {
  from: string;
  to: string;
  date: string;
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
}): Promise<FlightResult[]> {
  const url = new URL("/api/flights", window.location.origin);
  url.searchParams.set("from", params.from);
  url.searchParams.set("to", params.to);
  url.searchParams.set("date", params.date);
  url.searchParams.set("adults", String(params.adults));
  url.searchParams.set("children", String(params.children));
  url.searchParams.set("infants", String(params.infants));
  url.searchParams.set("cabin", params.cabin);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch flights from backend");
  const data = await res.json();
  return data.flights;
}

export function getFlightById(offerId: string | null | undefined, flights: Record<string, FlightResult>) {
  if (!offerId) return null;
  return flights[offerId] ?? null;
}

export function getOffersBySection(key: SectionKey, offers: FlightResult[]) {
  return offers.filter((offer) => (offer as any).section === key);
}

export function filterOffers(
  offers: FlightResult[],
  query: { from?: string; to?: string }
) {
  const from = query.from?.trim().toLowerCase();
  const to = query.to?.trim().toLowerCase();
  if (!from && !to) return null;

  return offers.filter((offer) => {
    const matchFrom =
      !from ||
      offer.fromCode.toLowerCase().includes(from) ||
      offer.fromCity.toLowerCase().includes(from);
    const matchTo =
      !to ||
      offer.toCode.toLowerCase().includes(to) ||
      offer.toCity.toLowerCase().includes(to);
    return matchFrom && matchTo;
  });
}

export function parsePassengerCounts(params: {
  get(key: string): string | null;
}): PassengerCounts {
  return {
    adults: Math.max(1, clampCount(params.get("adults")) ?? 1),
    children: clampCount(params.get("children")) ?? 0,
    infants: clampCount(params.get("infants")) ?? 0,
  };
}

function clampCount(raw: string | null): number | null {
  if (raw === null || raw === "") return null;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.min(value, 9);
}

export function buildPassengerList(counts: PassengerCounts) {
  const list: { type: "adult" | "child" | "infant"; position: number }[] = [];
  for (let i = 1; i <= counts.adults; i += 1) list.push({ type: "adult", position: i });
  for (let i = 1; i <= counts.children; i += 1) list.push({ type: "child", position: i });
  for (let i = 1; i <= counts.infants; i += 1) list.push({ type: "infant", position: i });
  return list;
}

// ============================================
// sessionStorage - حفظ وقراءة بيانات الرحلة المختارة
// ============================================

const SESSION_KEY = "skyfare_selected_flight";

export function saveSelectedFlight(offer: FlightResult & {
  cabin: CabinClass;
  airlineName: string;
}, date: string): void {
  const selected: SelectedFlight = {
    offerId: offer.id,
    origin: offer.fromCode,
    destination: offer.toCode,
    originCity: offer.fromCity,
    destinationCity: offer.toCity,
    departTime: offer.departTime,
    arriveTime: offer.arriveTime,
    duration: offer.duration,
    cabinClass: offer.cabin,
    // TODO: التحقق من السعر عبر offerId في الـ backend قبل الحفظ
    priceCents: offer.priceCents,
    currency: "USD",
    airlineName: offer.airlineName,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(selected));
}

export function loadSelectedFlight(): SelectedFlight | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SelectedFlight;
  } catch {
    return null;
  }
}

export function clearSelectedFlight(): void {
  sessionStorage.removeItem(SESSION_KEY);
}