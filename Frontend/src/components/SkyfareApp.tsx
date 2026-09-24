"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronDown, Plane } from "lucide-react";
import SearchCapsule from "./SearchCapsule";
import FlightCard from "./FlightCard";
import { ResultsSkeleton } from "./Skeletons";
import type { AirportInfo, Cabin } from "@/lib/airports";
import type { FlightResult } from "@/lib/flights";
import { cn, formatDateLong } from "@/lib/utils";

type SortKey = "cheapest" | "fastest" | "earliest";

const SORT_OPTIONS: Array<{ key: SortKey; label: string; description: string }> = [
  { key: "cheapest", label: "Cheapest", description: "Lowest fare first" },
  { key: "fastest", label: "Fastest", description: "Shortest trip first" },
  { key: "earliest", label: "Earliest", description: "Soonest departure first" },
];

export default function SkyfareApp() {
  const [from, setFrom] = useState<AirportInfo | null>(null);
  const [to, setTo] = useState<AirportInfo | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabin, setCabin] = useState<Cabin>("Economy");

  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("cheapest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);

  const runSearch = useCallback(
    async (override?: { from?: AirportInfo | null; to?: AirportInfo | null; date?: string | null }) => {
      const f = override?.from !== undefined ? override.from : from;
      const t = override?.to !== undefined ? override.to : to;
      const d = override?.date !== undefined ? override.date : date;
      if (!f || !t || !d) return;
      if (f.code === t.code) {
        setError("Origin and destination must be different.");
        return;
      }
      setLoading(true);
      setError(null);
      setSearched(true);
      try {
        const params = new URLSearchParams({
          from: f.code,
          to: t.code,
          date: d,
          adults: String(adults),
          children: String(children),
          infants: String(infants),
          cabin,
        });
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");
        setFlights(Array.isArray(data) ? data : data.flights ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
        setFlights([]);
      } finally {
        setLoading(false);
      }
    },
    [from, to, date, adults, children, infants, cabin]
  );

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const handlePax = (k: "adults" | "children" | "infants", v: number) => {
    if (k === "adults") {
      setAdults(v);
      if (infants > v) setInfants(v);
    } else if (k === "children") setChildren(v);
    else setInfants(v);
  };

  const visible = useMemo(() => {
    let list = [...flights];
    if (sortKey === "cheapest") list.sort((a, b) => a.priceCents - b.priceCents);
    if (sortKey === "fastest") list.sort((a, b) => a.durationMin - b.durationMin);
    if (sortKey === "earliest") list.sort((a, b) => a.departMinutes - b.departMinutes);
    return list;
  }, [flights, sortKey]);

  const cheapestId = useMemo(() => {
    if (flights.length === 0) return null;
    return [...flights].sort((a, b) => a.priceCents - b.priceCents)[0].id;
  }, [flights]);

  const totalPax = adults + children + infants;
  const selectedSort = SORT_OPTIONS.find((option) => option.key === sortKey) ?? SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-faint">
      {/* Hero */}
      <section
        id="search"
        className="mx-auto max-w-[880px] px-5 pb-8 pt-10 text-center sm:pt-14"
      >
        <h1 className="text-[28px] font-bold leading-[1.2] tracking-[-0.01em] text-hof">
          Find your next flight
        </h1>
        <p className="mx-auto mt-2.5 max-w-[520px] text-[16px] leading-snug text-foggy">
          Compare times, stops and prices across airlines — one quiet search,
          every option.
        </p>

        <div className="mt-7 text-left">
          <SearchCapsule
            from={from}
            to={to}
            date={date}
            adults={adults}
            children={children}
            infants={infants}
            cabin={cabin}
            loading={loading}
            onFrom={setFrom}
            onTo={setTo}
            onSwap={() => {
              const f = from;
              setFrom(to);
              setTo(f);
            }}
            onDate={setDate}
            onPax={handlePax}
            onCabin={setCabin}
            onSearch={() => {
              runSearch();
              setTimeout(
                () =>
                  document
                    .getElementById("results")
                    ?.scrollIntoView({ behavior: "smooth" }),
                60,
              );
            }}
          />
        </div>
      </section>

      {/* Empty state — shown before first search */}
      {!searched && (
        <div className="state mx-auto flex max-w-[280px] flex-col items-center px-6 pb-16 pt-4 text-center">
          <div className="state__icon grid h-14 w-14 place-items-center rounded-full bg-faint">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="text-foggy"
            >
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path>
            </svg>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-foggy">
            Enter your route and search to see prices.
          </p>
        </div>
      )}

      {/* Results — only rendered when searched */}
      {searched && (
        <main
          id="results"
          className="mx-auto max-w-[1120px] scroll-mt-20 px-5 pb-8 sm:px-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[22px] font-medium leading-[1.18] tracking-[-0.02em] text-hof">
                {loading
                  ? "Searching flights…"
                  : `${visible.length} flight${visible.length === 1 ? "" : "s"}`}
              </h2>
              <p className="tnum mt-1 text-[14px] text-foggy">
                {from && to && date
                  ? `${from.city} (${from.code}) → ${to.city} (${to.code}) · ${formatDateLong(date)} · ${totalPax} traveler${totalPax > 1 ? "s" : ""} · ${cabin}`
                  : ""}
              </p>
            </div>

            {/* Sort menu — no "Sort by" text */}
            <div ref={sortRef} className="relative self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setSortOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-full bg-white px-4 text-left shadow-capsule transition-shadow hover:shadow-[0_0_0_1px_rgba(34,34,34,.28),0_3px_10px_rgba(0,0,0,.1)]",
                  sortOpen &&
                    "shadow-[0_0_0_1px_rgba(34,34,34,.28),0_3px_10px_rgba(0,0,0,.1)]",
                )}
              >
                <ArrowUpDown className="h-4 w-4 text-hof" strokeWidth={2} />
                <span className="text-[14px] font-semibold text-hof">
                  {selectedSort.label}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-foggy transition-transform duration-200",
                    sortOpen && "rotate-180",
                  )}
                />
              </button>

              {sortOpen && (
                <div
                  role="listbox"
                  aria-label="Sort flights"
                  className="absolute left-1/2 top-[calc(100%+8px)] z-40 w-60 -translate-x-1/2 overflow-hidden rounded-2xl bg-white p-2 shadow-popover sm:right-0 sm:left-auto sm:translate-x-0"
                >
                  {SORT_OPTIONS.map((option) => {
                    const active = sortKey === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setSortKey(option.key);
                          setSortOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors hover:bg-faint",
                          active && "bg-faint",
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-[14px] text-hof",
                              active && "font-semibold",
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="block text-[12px] text-foggy">
                            {option.description}
                          </span>
                        </span>
                        <span className="grid h-5 w-5 place-items-center">
                          {active && (
                            <Check
                              className="h-4 w-4 text-hof"
                              strokeWidth={2.2}
                            />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <ResultsSkeleton count={6} />
            ) : error ? (
              <div className="grid place-items-center rounded-xl bg-white px-6 py-16 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-faint">
                  <Plane
                    className="h-6 w-6 -rotate-12 text-foggy"
                    strokeWidth={1.8}
                  />
                </span>
                <p className="mt-4 text-[16px] font-medium text-hof">
                  We couldn&apos;t load flights
                </p>
                <p className="mt-1 text-[14px] text-foggy">{error}</p>
                <button
                  onClick={() => runSearch()}
                  className="mt-5 h-10 rounded-lg bg-hof px-6 text-[14px] font-medium text-white transition-colors hover:bg-black"
                >
                  Try again
                </button>
              </div>
            ) : visible.length === 0 ? (
              <div className="grid place-items-center rounded-xl bg-white px-6 py-16 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-faint">
                  <Plane
                    className="h-6 w-6 -rotate-12 text-foggy"
                    strokeWidth={1.8}
                  />
                </span>
                <p className="mt-4 text-[16px] font-medium text-hof">
                  No flights found
                </p>
                <p className="mt-1 max-w-[320px] text-[14px] text-foggy">
                  Try picking a different date or cabin class.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visible.map((f) => (
                  <FlightCard
                    key={f.id}
                    flight={f}
                    badge={f.id === cheapestId ? "Best price" : null}
                    onSelect={() => setSelectedFlight(f)}
                    adults={adults}
                    children={children}
                    infants={infants}
                    date={date}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
