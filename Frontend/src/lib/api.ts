const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: string;
}

export async function searchFlights(params: SearchParams) {
  const query = new URLSearchParams({
    from: params.from,
    to: params.to,
    date: params.date,
    adults: String(params.adults ?? 1),
    children: String(params.children ?? 0),
    infants: String(params.infants ?? 0),
    cabin: params.cabin ?? 'Economy',
  });

  // استخدام دالة fetch للاتصال بخادم NestJS
  const response = await fetch(`${BASE_URL}/flights/search?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error not found: ${response.status}`);
  }

  return await response.json();
}