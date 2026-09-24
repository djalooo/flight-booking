// src/lib/mappers.ts
import type { FlightResult } from "./flights";

function timeToMinutes(iso: string): number {
  if (!iso) return 0;
  const t = new Date(iso);
  return t.getHours() * 60 + t.getMinutes();
}

function formatTime(iso: string): string {
  if (!iso) return "--:--";
  const t = new Date(iso);
  return t.toTimeString().slice(0, 5);
}

function isoDurationToMinutes(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] ?? "0") * 60) + parseInt(match[2] ?? "0");
}

function minutesToDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function mapCabin(c: string): "Economy" | "Premium economy" | "Business" | "First" {
  if (c.includes("premium")) return "Premium economy";
  if (c.includes("business")) return "Business";
  if (c.includes("first")) return "First";
  return "Economy";
}

export function mapDuffelOffersToFlights(offers: any[], fallbackFrom: string, fallbackTo: string, fallbackCabin: string): FlightResult[] {
  if (!Array.isArray(offers)) return [];

  return offers.map((offer: any, i: number) => {
    const slice = offer.slices?.[0];
    const segments = slice?.segments ?? [];
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const depart = firstSegment?.departing_at ?? "";
    const arrive = lastSegment?.arriving_at ?? "";

    const departMinutes = timeToMinutes(depart);
    const arriveMinutes = timeToMinutes(arrive);
    const durationMin = slice?.duration ? isoDurationToMinutes(slice.duration) : Math.max(0, arriveMinutes - departMinutes);

    const stops = Math.max(0, segments.length - 1);
    const stopCities: string[] = segments
      .slice(0, -1)
      .map((s: any) => s.destination?.city_name ?? s.destination?.iata_code ?? "")
      .filter(Boolean);

    return {
      id: offer.id ?? `offer-${i}`,
      airlineCode: firstSegment?.operating_carrier?.iata_code ?? firstSegment?.marketing_carrier?.iata_code ?? "??",
      airlineName: firstSegment?.operating_carrier?.name ?? firstSegment?.marketing_carrier?.name ?? "Unknown",
      flightNumber: `${firstSegment?.marketing_carrier?.iata_code ?? ""} ${firstSegment?.marketing_carrier_flight_number ?? ""}`.trim(),
      fromCode: firstSegment?.origin?.iata_code ?? fallbackFrom,
      fromCity: firstSegment?.origin?.city_name ?? fallbackFrom,
      toCode: lastSegment?.destination?.iata_code ?? fallbackTo,
      toCity: lastSegment?.destination?.city_name ?? fallbackTo,
      departTime: formatTime(depart),
      arriveTime: formatTime(arrive),
      departMinutes,
      arriveMinutes,
      durationMin,
      duration: minutesToDuration(durationMin),
      stops,
      stopCities,
      priceCents: Math.round(parseFloat(offer.total_amount ?? "0") * 100),
      cabin: mapCabin(offer.cabin_class ?? fallbackCabin),
      co2Kg: Math.round(offer.total_emissions_kg ?? 0),
    };
  });
}