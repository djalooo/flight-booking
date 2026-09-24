export type CabinClass = "economy" | "premium" | "business" | "first";

export interface PassengerInput {
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
}

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
  duration: string;
  stops: number;
  priceCents: number;
  cabin: CabinClass;
  co2Kg: number;
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface SelectedFlight {
  offerId: string;
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  cabinClass: CabinClass;
  priceCents: number;
  currency: string;
  airlineName: string;
}

export interface BookingRequestBody {
  origin: string;
  destination: string;
  cabinClass: CabinClass;
  duffelOfferId: string;
  airlineName?: string;
  totalAmount: number;
  currency: string;
  takeoffTime: string;
  arrivalTime: string;
  phone: string;
  email?: string;
  passengers: PassengerInput[];
}

export interface BookingResponse {
  id: string;
  origin: string;
  destination: string;
  cabinClass: CabinClass;
  duffelOfferId: string;
  airlineName?: string | null;
  totalAmount: number;
  currency: string;
  takeoffTime: string;
  arrivalTime: string;
  phone: string;
  email?: string | null;
  status: string;
  createdAt: string;
  passengers: PassengerInput[];
}