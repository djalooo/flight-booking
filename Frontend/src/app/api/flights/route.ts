import { NextRequest, NextResponse } from "next/server";

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

    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/flights/search`
    );
    backendUrl.searchParams.set("from", from);
    backendUrl.searchParams.set("to", to);
    backendUrl.searchParams.set("date", date);
    backendUrl.searchParams.set("adults", adults);
    backendUrl.searchParams.set("children", children);
    backendUrl.searchParams.set("infants", infants);
    backendUrl.searchParams.set("cabin", cabin);

    const backendRes = await fetch(backendUrl.toString(), {
      cache: "no-store",
    });

    if (!backendRes.ok) {
      throw new Error(`Backend server status: ${backendRes.status}`);
    }

    const data = await backendRes.json();
    return NextResponse.json({ flights: data });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flights from backend" },
      { status: 500 }
    );
  }
}