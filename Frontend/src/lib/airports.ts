export type Cabin = "Economy" | "Premium economy" | "Business" | "First";

export interface AirportInfo {
  code: string;
  city: string;
  name: string;
  country?: string;
}

export const CABINS: Cabin[] = [
  "Economy",
  "Premium economy",
  "Business",
  "First",
];