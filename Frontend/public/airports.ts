export interface AirportInfo {
  code: string;
  city: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const AIRPORTS: AirportInfo[] = [
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl", country: "United States", lat: 40.641, lon: -73.778 },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Intl", country: "United States", lat: 33.941, lon: -118.408 },
  { code: "SFO", city: "San Francisco", name: "San Francisco Intl", country: "United States", lat: 37.621, lon: -122.379 },
  { code: "ORD", city: "Chicago", name: "O'Hare Intl", country: "United States", lat: 41.974, lon: -87.907 },
  { code: "MIA", city: "Miami", name: "Miami Intl", country: "United States", lat: 25.793, lon: -80.29 },
  { code: "SEA", city: "Seattle", name: "Seattle-Tacoma Intl", country: "United States", lat: 47.45, lon: -122.308 },
  { code: "BOS", city: "Boston", name: "Logan Intl", country: "United States", lat: 42.365, lon: -71.009 },
  { code: "DFW", city: "Dallas", name: "Dallas/Fort Worth Intl", country: "United States", lat: 32.899, lon: -97.04 },
  { code: "DEN", city: "Denver", name: "Denver Intl", country: "United States", lat: 39.856, lon: -104.673 },
  { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson Intl", country: "United States", lat: 33.64, lon: -84.427 },
  { code: "LHR", city: "London", name: "Heathrow", country: "United Kingdom", lat: 51.47, lon: -0.454 },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", lat: 49.009, lon: 2.547 },
  { code: "AMS", city: "Amsterdam", name: "Schiphol", country: "Netherlands", lat: 52.31, lon: 4.768 },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Airport", country: "Germany", lat: 50.037, lon: 8.562 },
  { code: "MAD", city: "Madrid", name: "Barajas", country: "Spain", lat: 40.498, lon: -3.567 },
  { code: "FCO", city: "Rome", name: "Fiumicino", country: "Italy", lat: 41.8, lon: 12.238 },
  { code: "BCN", city: "Barcelona", name: "El Prat", country: "Spain", lat: 41.297, lon: 2.078 },
  { code: "NRT", city: "Tokyo", name: "Narita Intl", country: "Japan", lat: 35.772, lon: 140.392 },
  { code: "SIN", city: "Singapore", name: "Changi", country: "Singapore", lat: 1.364, lon: 103.991 },
  { code: "SYD", city: "Sydney", name: "Kingsford Smith", country: "Australia", lat: -33.939, lon: 151.175 },
  { code: "YYZ", city: "Toronto", name: "Pearson Intl", country: "Canada", lat: 43.677, lon: -79.624 },
  { code: "MEX", city: "Mexico City", name: "Benito Juárez Intl", country: "Mexico", lat: 19.436, lon: -99.072 },
];

export const airportByCode = (code: string): AirportInfo | undefined =>
  AIRPORTS.find((a) => a.code === code);

export const CABINS = ["Economy", "Premium economy", "Business", "First"] as const;
export type Cabin = (typeof CABINS)[number];

export const CABIN_MULTIPLIER: Record<Cabin, number> = {
  Economy: 1,
  "Premium economy": 1.55,
  Business: 2.6,
  First: 3.9,
};
