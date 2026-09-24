// src/lib/providers/index.ts

import type { FlightProvider } from "./base";
import { DuffelProvider } from "./duffel";

export function getProviders(): FlightProvider[] {
  const providers: FlightProvider[] = [];

  if (process.env.DUFFEL_API_KEY) {
    providers.push(new DuffelProvider(process.env.DUFFEL_API_KEY));
  }

  // مستقبلاً:
  // if (process.env.AMADEUS_API_KEY) {
  //   providers.push(new AmadeusProvider(process.env.AMADEUS_API_KEY));
  // }

  if (providers.length === 0) {
    throw new Error("No flight providers configured");
  }

  return providers;
}