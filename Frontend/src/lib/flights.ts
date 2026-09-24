// ============================================
// flights/data.ts - النسخة المحدّثة
// ============================================

import type { CabinClass, FlightResult, PassengerCounts, SelectedFlight } from "@/lib/types";

export interface FlightOffer extends FlightResult {
  image: string;
  imageAlt: string;
  badge?: string;
  rating: number;
  section: SectionKey;
}

export type SectionKey = "popular" | "escapes" | "longhaul" | "nextmonth";

export const SECTIONS: { key: SectionKey; title: string; subtitle: string }[] = [
  {
    key: "popular",
    title: "Popular flights from Algiers",
    subtitle: "Most booked routes this week",
  },
  {
    key: "escapes",
    title: "Weekend escapes under $300",
    subtitle: "Short hops, big change of scene",
  },
  {
    key: "longhaul",
    title: "Long-haul with room to stretch",
    subtitle: "Premium and business cabins",
  },
  {
    key: "nextmonth",
    title: "Available next month",
    subtitle: "Fresh seats released for December",
  },
];

function px(id: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&fit=crop&w=640&h=640`;
}

const IMG = {
  bcn: [px(38682986), px(16447898), px(23466752)],
  cdg: [px(15367279), px(13668463), px(13351967)],
  jfk: [px(34772454), px(11875381)],
  ist: [px(8160968), px(38367547), px(8660463)],
  alg: [px(6558204), px(15110819)],
  fco: [px(30912162), px(38380411)],
  dxb: [px(12909949), px(19664307), px(18889446)],
  lis: [px(36289637), px(17102174), px(17102219)],
};

const OFFERS: FlightOffer[] = [
  {
    id: "offer-alg-bcn-001",
    airlineCode: "AH",
    airlineName: "Air Algérie",
    flightNumber: "AH 2014",
    fromCode: "ALG",
    fromCity: "Algiers",
    toCode: "BCN",
    toCity: "Barcelona",
    departTime: "08:00",
    arriveTime: "11:00",
    duration: "3h 0m",
    stops: 0,
    priceCents: 45000,
    cabin: "economy",
    co2Kg: 142,
    image: IMG.bcn[0],
    imageAlt: "Sunlit pedestrian street lined with trees in Barcelona",
    badge: "Guest favourite",
    rating: 4.92,
    section: "popular",
  },
  {
    id: "offer-alg-cdg-002",
    airlineCode: "AF",
    airlineName: "Air France",
    flightNumber: "AF 1955",
    fromCode: "ALG",
    fromCity: "Algiers",
    toCode: "CDG",
    toCity: "Paris",
    departTime: "07:15",
    arriveTime: "10:30",
    duration: "3h 15m",
    stops: 0,
    priceCents: 48900,
    cabin: "economy",
    co2Kg: 158,
    image: IMG.cdg[0],
    imageAlt: "Paris street view with the Eiffel Tower in the background",
    badge: "Guest favourite",
    rating: 4.88,
    section: "popular",
  },
  {
    id: "offer-alg-ist-003",
    airlineCode: "TK",
    airlineName: "Turkish Airlines",
    flightNumber: "TK 656",
    fromCode: "ALG",
    fromCity: "Algiers",
    toCode: "IST",
    toCity: "Istanbul",
    departTime: "15:40",
    arriveTime: "20:25",
    duration: "3h 45m",
    stops: 0,
    priceCents: 51500,
    cabin: "economy",
    co2Kg: 186,
    image: IMG.ist[0],
    imageAlt: "Domes and minarets of the Blue Mosque in Istanbul",
    rating: 4.81,
    section: "popular",
  },
  {
    id: "offer-alg-fco-004",
    airlineCode: "AZ",
    airlineName: "ITA Airways",
    flightNumber: "AZ 885",
    fromCode: "ALG",
    fromCity: "Algiers",
    toCode: "FCO",
    toCity: "Rome",
    departTime: "11:05",
    arriveTime: "13:40",
    duration: "2h 35m",
    stops: 0,
    priceCents: 42300,
    cabin: "economy",
    co2Kg: 121,
    image: IMG.fco[0],
    imageAlt: "The Colosseum in Rome illuminated at dusk",
    badge: "Rare find",
    rating: 4.79,
    section: "popular",
  },
  {
    id: "offer-alg-lis-005",
    airlineCode: "TP",
    airlineName: "TAP Air Portugal",
    flightNumber: "TP 1044",
    fromCode: "ALG",
    fromCity: "Algiers",
    toCode: "LIS",
    toCity: "Lisbon",
    departTime: "09:20",
    arriveTime: "11:05",
    duration: "2h 45m",
    stops: 0,
    priceCents: 39900,
    cabin: "economy",
    co2Kg: 133,
    image: IMG.lis[0],
    imageAlt: "Yellow trams climbing a steep street in Lisbon",
    rating: 4.74,
    section: "popular",
  },
  {
    id: "offer-alg-dxb-006",
    airlineCode: "EK",
    airlineName: "Emirates",
    flightNumber: "EK 758",
    fromCode: "ALG",
    fromCity: "Algiers",
    toCode: "DXB",
    toCity: "Dubai",
    departTime: "22:10",
    arriveTime: "08:05",
    duration: "6h 55m",
    stops: 1,
    priceCents: 76400,
    cabin: "economy",
    co2Kg: 412,
    image: IMG.dxb[0],
    imageAlt: "Dubai skyline silhouetted against a golden sunset",
    rating: 4.85,
    section: "popular",
  },
  {
    id: "offer-alg-jfk-007",
    airlineCode: "DL",
    airlineName: "Delta Air Lines",
    flightNumber: "DL 145",
    fromCode: "ALG",
    fromCity: "Algiers",
    toCode: "JFK",
    toCity: "New York",
    departTime: "06:00",
    arriveTime: "16:20",
    duration: "12h 20m",
    stops: 1,
    priceCents: 89900,
    cabin: "economy",
    co2Kg: 688,
    image: IMG.jfk[0],
    imageAlt: "Aerial view of the illuminated New York City skyline at night",
    rating: 4.68,
    section: "popular",
  },
  {
    id: "offer-bcn-alg-101",
    airlineCode: "VY",
    airlineName: "Vueling",
    flightNumber: "VY 1300",
    fromCode: "BCN",
    fromCity: "Barcelona",
    toCode: "ALG",
    toCity: "Algiers",
    departTime: "14:30",
    arriveTime: "16:10",
    duration: "1h 40m",
    stops: 0,
    priceCents: 18900,
    cabin: "economy",
    co2Kg: 96,
    image: IMG.alg[0],
    imageAlt: "Historic cathedral facade in Algiers",
    badge: "Best value",
    rating: 4.62,
    section: "escapes",
  },
  {
    id: "offer-cdg-bcn-102",
    airlineCode: "AF",
    airlineName: "Air France",
    flightNumber: "AF 1348",
    fromCode: "CDG",
    fromCity: "Paris",
    toCode: "BCN",
    toCity: "Barcelona",
    departTime: "18:45",
    arriveTime: "20:35",
    duration: "1h 50m",
    stops: 0,
    priceCents: 21400,
    cabin: "economy",
    co2Kg: 88,
    image: IMG.bcn[1],
    imageAlt: "Person sitting against a modern facade in Barcelona",
    rating: 4.71,
    section: "escapes",
  },
  {
    id: "offer-bcn-fco-103",
    airlineCode: "VY",
    airlineName: "Vueling",
    flightNumber: "VY 6000",
    fromCode: "BCN",
    fromCity: "Barcelona",
    toCode: "FCO",
    toCity: "Rome",
    departTime: "12:15",
    arriveTime: "14:10",
    duration: "1h 55m",
    stops: 0,
    priceCents: 19900,
    cabin: "economy",
    co2Kg: 92,
    image: IMG.fco[1],
    imageAlt: "Black and white view of the Colosseum in Rome",
    badge: "Best value",
    rating: 4.58,
    section: "escapes",
  },
  {
    id: "offer-fco-lis-104",
    airlineCode: "TP",
    airlineName: "TAP Air Portugal",
    flightNumber: "TP 833",
    fromCode: "FCO",
    fromCity: "Rome",
    toCode: "LIS",
    toCity: "Lisbon",
    departTime: "07:50",
    arriveTime: "10:10",
    duration: "3h 20m",
    stops: 0,
    priceCents: 24900,
    cabin: "economy",
    co2Kg: 128,
    image: IMG.lis[1],
    imageAlt: "Vintage tram on a narrow street in Lisbon's Alfama district",
    rating: 4.66,
    section: "escapes",
  },
  {
    id: "offer-ist-fco-105",
    airlineCode: "TK",
    airlineName: "Turkish Airlines",
    flightNumber: "TK 1863",
    fromCode: "IST",
    fromCity: "Istanbul",
    toCode: "FCO",
    toCity: "Rome",
    departTime: "09:30",
    arriveTime: "11:10",
    duration: "3h 40m",
    stops: 0,
    priceCents: 27600,
    cabin: "economy",
    co2Kg: 149,
    image: IMG.fco[0],
    imageAlt: "The Colosseum lit up against an evening sky",
    rating: 4.77,
    section: "escapes",
  },
  {
    id: "offer-lis-cdg-106",
    airlineCode: "AF",
    airlineName: "Air France",
    flightNumber: "AF 1825",
    fromCode: "LIS",
    fromCity: "Lisbon",
    toCode: "CDG",
    toCity: "Paris",
    departTime: "16:10",
    arriveTime: "20:05",
    duration: "2h 55m",
    stops: 0,
    priceCents: 23100,
    cabin: "economy",
    co2Kg: 118,
    image: IMG.cdg[1],
    imageAlt: "Cars moving beneath the Eiffel Tower in Paris",
    rating: 4.7,
    section: "escapes",
  },
  {
    id: "offer-cdg-jfk-201",
    airlineCode: "AF",
    airlineName: "Air France",
    flightNumber: "AF 22",
    fromCode: "CDG",
    fromCity: "Paris",
    toCode: "JFK",
    toCity: "New York",
    departTime: "13:25",
    arriveTime: "16:55",
    duration: "8h 30m",
    stops: 0,
    priceCents: 189000,
    cabin: "business",
    co2Kg: 612,
    image: IMG.jfk[1],
    imageAlt: "Aerial shot of dense New York City architecture",
    badge: "Lie-flat seat",
    rating: 4.95,
    section: "longhaul",
  },
  {
    id: "offer-dxb-jfk-202",
    airlineCode: "EK",
    airlineName: "Emirates",
    flightNumber: "EK 201",
    fromCode: "DXB",
    fromCity: "Dubai",
    toCode: "JFK",
    toCity: "New York",
    departTime: "02:45",
    arriveTime: "08:30",
    duration: "13h 45m",
    stops: 0,
    priceCents: 134500,
    cabin: "business",
    co2Kg: 940,
    image: IMG.jfk[0],
    imageAlt: "New York City skyline glowing at night from above",
    rating: 4.91,
    section: "longhaul",
  },
  {
    id: "offer-jfk-cdg-203",
    airlineCode: "DL",
    airlineName: "Delta Air Lines",
    flightNumber: "DL 264",
    fromCode: "JFK",
    fromCity: "New York",
    toCode: "CDG",
    toCity: "Paris",
    departTime: "19:25",
    arriveTime: "08:45",
    duration: "7h 20m",
    stops: 0,
    priceCents: 98700,
    cabin: "premium",
    co2Kg: 566,
    image: IMG.cdg[2],
    imageAlt: "Rooftop view across the Paris skyline in daylight",
    rating: 4.83,
    section: "longhaul",
  },
  {
    id: "offer-ist-dxb-204",
    airlineCode: "TK",
    airlineName: "Turkish Airlines",
    flightNumber: "TK 762",
    fromCode: "IST",
    fromCity: "Istanbul",
    toCode: "DXB",
    toCity: "Dubai",
    departTime: "01:55",
    arriveTime: "07:10",
    duration: "4h 15m",
    stops: 0,
    priceCents: 61200,
    cabin: "business",
    co2Kg: 318,
    image: IMG.dxb[1],
    imageAlt: "Rolex Towers in Dubai against a clear blue sky",
    rating: 4.87,
    section: "longhaul",
  },
  {
    id: "offer-bcn-jfk-205",
    airlineCode: "AA",
    airlineName: "American Airlines",
    flightNumber: "AA 67",
    fromCode: "BCN",
    fromCity: "Barcelona",
    toCode: "JFK",
    toCity: "New York",
    departTime: "10:40",
    arriveTime: "13:20",
    duration: "8h 40m",
    stops: 0,
    priceCents: 112400,
    cabin: "premium",
    co2Kg: 634,
    image: IMG.jfk[1],
    imageAlt: "Skyscraper shadows across Manhattan",
    rating: 4.72,
    section: "longhaul",
  },
  {
    id: "offer-alg-bcn-301",
    airlineCode: "AH",
    airlineName: "Air Algérie",
    flightNumber: "AH 2018",
    fromCode: "ALG",
    fromCity: "Algiers",
    toCode: "BCN",
    toCity: "Barcelona",
    departTime: "17:35",
    arriveTime: "20:30",
    duration: "2h 55m",
    stops: 0,
    priceCents: 41200,
    cabin: "economy",
    co2Kg: 139,
    image: IMG.bcn[2],
    imageAlt: "Modern high-rise in a Barcelona residential district",
    badge: "New fare",
    rating: 4.65,
    section: "nextmonth",
  },
  {
    id: "offer-cdg-ist-302",
    airlineCode: "TK",
    airlineName: "Turkish Airlines",
    flightNumber: "TK 1828",
    fromCode: "CDG",
    fromCity: "Paris",
    toCode: "IST",
    toCity: "Istanbul",
    departTime: "20:05",
    arriveTime: "01:15",
    duration: "3h 10m",
    stops: 0,
    priceCents: 46800,
    cabin: "economy",
    co2Kg: 201,
    image: IMG.ist[1],
    imageAlt: "Ferry passenger looking out over the Istanbul skyline",
    rating: 4.8,
    section: "nextmonth",
  },
  {
    id: "offer-lis-dxb-303",
    airlineCode: "EK",
    airlineName: "Emirates",
    flightNumber: "EK 192",
    fromCode: "LIS",
    fromCity: "Lisbon",
    toCode: "DXB",
    toCity: "Dubai",
    departTime: "15:25",
    arriveTime: "01:40",
    duration: "7h 15m",
    stops: 0,
    priceCents: 68300,
    cabin: "economy",
    co2Kg: 452,
    image: IMG.dxb[2],
    imageAlt: "Dubai towers silhouetted against a sunset sky",
    rating: 4.78,
    section: "nextmonth",
  },
  {
    id: "offer-fco-alg-304",
    airlineCode: "AZ",
    airlineName: "ITA Airways",
    flightNumber: "AZ 884",
    fromCode: "FCO",
    fromCity: "Rome",
    toCode: "ALG",
    toCity: "Algiers",
    departTime: "14:50",
    arriveTime: "16:25",
    duration: "2h 35m",
    stops: 0,
    priceCents: 38700,
    cabin: "economy",
    co2Kg: 121,
    image: IMG.alg[1],
    imageAlt: "Sunlit alley walls in a Mediterranean old town",
    rating: 4.6,
    section: "nextmonth",
  },
  {
    id: "offer-ist-lis-305",
    airlineCode: "TP",
    airlineName: "TAP Air Portugal",
    flightNumber: "TP 1442",
    fromCode: "IST",
    fromCity: "Istanbul",
    toCode: "LIS",
    toCity: "Lisbon",
    departTime: "08:15",
    arriveTime: "11:40",
    duration: "5h 25m",
    stops: 0,
    priceCents: 52900,
    cabin: "economy",
    co2Kg: 244,
    image: IMG.lis[2],
    imageAlt: "Classical building facade in central Lisbon",
    rating: 4.69,
    section: "nextmonth",
  },
  {
    id: "offer-dxb-cdg-306",
    airlineCode: "AF",
    airlineName: "Air France",
    flightNumber: "AF 655",
    fromCode: "DXB",
    fromCity: "Dubai",
    toCode: "CDG",
    toCity: "Paris",
    departTime: "09:55",
    arriveTime: "15:05",
    duration: "7h 10m",
    stops: 0,
    priceCents: 71500,
    cabin: "economy",
    co2Kg: 468,
    image: IMG.cdg[0],
    imageAlt: "Paris street scene near the Eiffel Tower",
    rating: 4.74,
    section: "nextmonth",
  },
];

export const ALL_OFFERS = OFFERS;

export const DEMO_FLIGHTS: Record<string, FlightOffer> = Object.fromEntries(
  OFFERS.map((offer) => [offer.id, offer]),
);

export const CITY_OPTIONS = Array.from(
  new Map(
    OFFERS.flatMap((offer) => [
      [offer.fromCode, { code: offer.fromCode, city: offer.fromCity }],
      [offer.toCode, { code: offer.toCode, city: offer.toCity }],
    ]) as [string, { code: string; city: string }][],
  ).values(),
).sort((a, b) => a.city.localeCompare(b.city));

export function getFlightById(offerId: string | null | undefined) {
  if (!offerId) return null;
  return DEMO_FLIGHTS[offerId] ?? null;
}

export function getDefaultFlight(): FlightOffer {
  return OFFERS[0];
}

export function getOffersBySection(key: SectionKey) {
  return OFFERS.filter((offer) => offer.section === key);
}

export function filterOffers(query: { from?: string; to?: string }) {
  const from = query.from?.trim().toLowerCase();
  const to = query.to?.trim().toLowerCase();
  if (!from && !to) return null;

  return OFFERS.filter((offer) => {
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

export function saveSelectedFlight(offer: FlightOffer, date: string): void {
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