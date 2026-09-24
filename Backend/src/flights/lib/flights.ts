// src/lib/flights.ts - النسخة النهائية النظيفة
export type FlightResult = {
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
  stopCities: string[];
  priceCents: number;
  cabin: "Economy" | "Premium economy" | "Business" | "First";
  co2Kg: number;
};

export type FlightSearchQueryParams = {
  from: string;
  to: string;
  date: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: string;
};