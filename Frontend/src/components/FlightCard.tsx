"use client";

import { useRouter } from "next/navigation";
import type { FlightResult } from "@/lib/types";
import { saveSelectedFlight } from "@/lib/flights"; // أو "@/lib/flights" حسب مسار مشروعك
import { formatUSD } from "@/lib/utils";

interface Props {
  flight: FlightResult;
  onSelect: (f: FlightResult) => void;
  badge?: string | null;
  adults: number;
  children: number;
  infants: number;
  date: string | null;
}

export default function FlightCard({
  flight,
  onSelect,
  badge,
  adults,
  children,
  infants,
  date,
}: Props) {
  const router = useRouter();

  const stopLabel =
    flight.stops === 0
      ? "Nonstop"
      : flight.stops === 1
        ? "1 stop"
        : `${flight.stops} stops`;

  const handleSelect = () => {
    // 1. حفظ الرحلة المختارة في sessionStorage
    saveSelectedFlight(flight as any, date ?? "");

    // 2. استدعاء دالة الاختيار الممررة من الأب (إن وُجدت)
    onSelect(flight);

    // 3. التوجيه لصفحة الحجز مع المعاملات
    router.push(
      `/book?offerId=${encodeURIComponent(flight.id)}&adults=${adults}&children=${children}&infants=${infants}&date=${date ?? ""}`,
    );
  };

  return (
    <article className="group rounded-xl bg-white p-4 transition-shadow hover:shadow-[0_0_0_1px_#222222] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Airline */}
        <div className="flex min-w-0 items-center gap-3 sm:w-[190px] sm:shrink-0">
          <span className="grid h-10 w-14 shrink-0 place-items-center rounded-full bg-faint text-[13px] font-semibold tracking-wide text-hof">
            {flight.airlineCode}
          </span>

          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium text-hof">
              {flight.airlineName}
            </span>

            <span className="tnum block text-[12px] text-foggy">
              {flight.flightNumber}
            </span>
          </span>
        </div>

        {/* Times */}
        <div className="flex flex-1 items-center gap-3 sm:gap-4">
          <div className="w-[86px] shrink-0 text-left">
            <p className="tnum text-[16px] font-medium leading-tight text-hof">
              {flight.departTime}
            </p>

            <p className="mt-0.5 text-[13px] text-foggy">{flight.fromCode}</p>
          </div>

          <div className="relative flex-1 px-1">
            <p className="tnum text-center text-[12px] text-foggy">
              {flight.duration}
            </p>

            <div className="relative my-1.5 h-px bg-bebe">
              <span className="absolute left-0 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full border-[1.5px] border-foggy bg-white" />

              {flight.stops > 0 && (
                <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1">
                  {Array.from({ length: flight.stops }).map((_, i) => (
                    <span
                      key={i}
                      className="h-[5px] w-[5px] rounded-full bg-foggy"
                    />
                  ))}
                </span>
              )}

              <span className="absolute right-0 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-hof" />
            </div>

            <p className="text-center text-[12px] text-foggy">{stopLabel}</p>
          </div>

          <div className="w-[86px] shrink-0 text-right">
            <p className="tnum text-[16px] font-medium leading-tight text-hof">
              {flight.arriveTime}
            </p>

            <p className="mt-0.5 text-[13px] text-foggy">{flight.toCode}</p>
          </div>
        </div>

        <div className="hidden h-14 w-px bg-bebe sm:block" />

        {/* Price & Action */}
        <div className="flex items-center justify-between border-t border-bebe pt-3 sm:w-[130px] sm:shrink-0 sm:flex-col sm:items-end sm:justify-center sm:gap-1 sm:border-0 sm:pt-0">
          <div className="sm:text-right">
            {badge && (
              <span className="mb-1 inline-block rounded-full bg-faint px-2.5 py-0.5 text-[12px] font-semibold text-hof">
                {badge}
              </span>
            )}

            <p className="tnum text-[16px] font-semibold text-hof">
              {formatUSD(flight.priceCents)}
            </p>

            <p className="text-[12px] text-foggy">total · {flight.cabin}</p>
          </div>

          <button
            type="button"
            onClick={handleSelect}
            className="text-[14px] font-medium text-hof underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            Select
          </button>
        </div>
      </div>
    </article>
  );
}