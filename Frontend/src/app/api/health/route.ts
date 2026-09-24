export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/flights/search?from=ALG&to=BCN&date=2024-12-01&adults=1`
    );
    return Response.json({ ok: res.ok });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}