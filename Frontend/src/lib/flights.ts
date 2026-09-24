export type Cabin = "Economy" | "Premium_Economy" | "Business" | "First";

export interface FlightResult {
  id: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  departTime: string;
  arriveTime: string;
  departMinutes: number;
  arriveMinutes: number;
  durationMin: number;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabin: Cabin;
}

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