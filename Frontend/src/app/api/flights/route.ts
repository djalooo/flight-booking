import { CABINS, type Cabin } from "@/lib/airports";
import { searchFlights } from "@/lib/flights";

export const dynamic = "force-dynamic";

function parseCabin(v: string | null): Cabin {
  if (v && (CABINS as readonly string[]).includes(v)) return v as Cabin;
  return "Economy";
}

function clampInt(v: string | null, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(v ?? "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = (url.searchParams.get("from") ?? "").toUpperCase().trim();
  const to = (url.searchParams.get("to") ?? "").toUpperCase().trim();
  const date = (url.searchParams.get("date") ?? "").trim();
  const adults = clampInt(url.searchParams.get("adults"), 1, 1, 9);
  const children = clampInt(url.searchParams.get("children"), 0, 0, 8);
  const infants = clampInt(url.searchParams.get("infants"), 0, 0, 5);
  const cabin = parseCabin(url.searchParams.get("cabin"));

  if (!from || !to) {
    return Response.json({ error: "Missing origin or destination." }, { status: 400 });
  }
  if (from === to) {
    return Response.json({ error: "Origin and destination must differ." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "Missing or invalid date (YYYY-MM-DD)." }, { status: 400 });
  }

  // simulate network / provider latency so skeleton state is visible
  const delay = Math.min(1200, 450 + Math.random() * 500);
  await new Promise((r) => setTimeout(r, delay));

  const backendUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/flights/search`);
  backendUrl.searchParams.set("from", from);
  backendUrl.searchParams.set("to", to);
  backendUrl.searchParams.set("date", date);
  backendUrl.searchParams.set("adults", String(adults));
  backendUrl.searchParams.set("children", String(children));
  backendUrl.searchParams.set("infants", String(infants));
  backendUrl.searchParams.set("cabin", cabin);

  const backendRes = await fetch(backendUrl.toString());
  if (!backendRes.ok) throw new Error("Failed to fetch flights from backend");
  const flights = await backendRes.json();
  return Response.json({
    flights,
    meta: { from, to, date, adults, children, infants, cabin, count: flights.length },
  });
}
