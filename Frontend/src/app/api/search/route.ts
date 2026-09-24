/*import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const adults = searchParams.get("adults") ?? "1";
    const children = searchParams.get("children") ?? "0";
    const infants = searchParams.get("infants") ?? "0";
    const cabin = searchParams.get("cabin") ?? "Economy";

    if (!from || !to || !date) {
      return NextResponse.json(
        { error: "المعاملات الأساسية مفقودة (from, to, date)" },
        { status: 400 }
      );
    }

    // إرسال الطلب إلى خادم NestJS Backend (port 3001)
    const query = new URLSearchParams({
      from,
      to,
      date,
      adults,
      children,
      infants,
      cabin,
    });


    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

    const backendRes = await fetch(`${backendUrl}/api/v1/flights/search?${query.toString()}`, {
      cache: "no-store",
    });

    if (!backendRes.ok) {
      throw new Error(`NestJS server status: ${backendRes.status}`);
    }

    const data = await backendRes.json();
    
    // إرجاع البيانات الناتجة عن NestJS إلى الـ Frontend
    return NextResponse.json({ flights: data });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flights from backend" },
      { status: 500 }
    );
  }
}*/