export type CabinClass = "economy" | "premium" | "business" | "first";

export interface PassengerInput {
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  // أضف الحقول التي يحتاجها تطبيقك
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