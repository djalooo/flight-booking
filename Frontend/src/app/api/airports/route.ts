// src/app/api/airports/route.ts
import { NextRequest, NextResponse } from "next/server";
import airportsData from "@/data/airports.json";

// 1. تعريف واجهة نوع بيانات المطار لتفادي أخطاء TypeScript (Implicit any)
interface AirportItem {
  iata: string;
  name: string;
  city: string;
  country?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

    if (!query) {
      return NextResponse.json([]);
    }

    // 2. معالجة إمكانية كون البيانات مصفوفة مباشرة أو كائن يحتوي على خاصية airports
    const rawAirports: AirportItem[] = Array.isArray(airportsData)
      ? (airportsData as AirportItem[])
      : ((airportsData as { airports?: AirportItem[] }).airports ?? []);

    // 3. التصفية مع تحديد نوع البارامتر airport: AirportItem
    const matchedAirports = rawAirports
    .filter((airport: AirportItem) => {
    return (
      airport.iata.toLowerCase().includes(query) ||
      airport.city.toLowerCase().includes(query) ||
      airport.name.toLowerCase().includes(query) ||
      (airport.country ?? "").toLowerCase().includes(query)
    );
    })
    .sort((a, b) => {
    // أولوية 1: المدينة تبدأ بنفس الكلمة
    const aCity = a.city.toLowerCase().startsWith(query) ? 0 : 1;
    const bCity = b.city.toLowerCase().startsWith(query) ? 0 : 1;
    if (aCity !== bCity) return aCity - bCity;

    // أولوية 2: كود IATA يطابق
    const aIata = a.iata.toLowerCase().startsWith(query) ? 0 : 1;
    const bIata = b.iata.toLowerCase().startsWith(query) ? 0 : 1;
    if (aIata !== bIata) return aIata - bIata;

    // أولوية 3: المدينة تحتوي الكلمة
    const aCityIncludes = a.city.toLowerCase().includes(query) ? 0 : 1;
    const bCityIncludes = b.city.toLowerCase().includes(query) ? 0 : 1;
    return aCityIncludes - bCityIncludes;
    });

    // 4. تحويل النتائج للواجهة مع تحديد نوع البارامتر a: AirportItem
    const formattedResults = matchedAirports.slice(0, 10).map((a: AirportItem) => ({
      code: a.iata,
      city: a.city,
      name: a.name,
      country: a.country ?? "",
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Airports API Error:", error);
    return NextResponse.json({ error: "Failed to fetch airports" }, { status: 500 });
  }
}