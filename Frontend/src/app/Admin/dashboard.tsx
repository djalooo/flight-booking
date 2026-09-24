"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Passenger = {
  id: string;
  bookingId: string;
  type: "adult" | "child" | "infant";
  fullName: string;
  age?: number;
  position: number;
};

type Booking = {
  id: string;
  origin: string;
  destination: string;
  cabinClass: string;
  duffelOfferId: string;
  airlineName?: string;
  totalAmount: string;
  currency: string;
  takeoffTime: string;
  arrivalTime: string | null;
  phone: string;
  email?: string;
  status: string;
  createdAt: string;
  passengers: Passenger[];
};

const STATUSES = ["pending", "confirmed"] as const;
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
};

const AIRPORT_NAMES: Record<string, string> = {
  BCN: "Barcelona",
  DXB: "Dubai",
  JFK: "New York",
  LHR: "London",
  LAX: "Los Angeles",
  NRT: "Tokyo",
  SFO: "San Francisco",
  CDG: "Paris",
  ORD: "Chicago",
  MIA: "Miami",
  FCO: "Rome",
  DUB: "Dublin",
  BOS: "Boston",
  HND: "Tokyo Haneda",
  SIN: "Singapore",
  SEA: "Seattle",
  DEN: "Denver",
  ALG: "Algiers",
};

const airportLabel = (code: string) => `${AIRPORT_NAMES[code] ?? code} (${code})`;
const pad = (n: number) => String(n).padStart(2, "0");

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fmtDuration = (fromIso: string, toIso: string) => {
  const minutes = Math.max(
    0,
    Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000)
  );
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
};

const passengerTypeLabel = (p: Passenger) => {
  if (p.type === "child") return `Child : ${String(p.age ?? 0).padStart(2, "0")}`;
  return p.type === "infant" ? "Infant" : "Adult";
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "all";
  const setStatusFilter = (s: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (s === "all") params.delete("status");
    else params.set("status", s);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };
  const [selected, setSelected] = useState<Booking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`);
      if (!res.ok) throw new Error("Failed to load bookings");
      setBookings(await res.json());
      setError(null);
    } catch {
      setError("Could not load bookings. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  useEffect(() => {
    if (!deleteTarget) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDeleteTarget(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteTarget]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!q) return true;
      return [
        b.origin,
        b.destination,
        b.cabinClass,
        b.phone,
        b.email ?? "",
        ...b.passengers.map((p) => p.fullName),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [bookings, search, statusFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    return { total, confirmed, pending, revenue };
  }, [bookings]);

  async function updateStatus(id: string, status: string) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) await loadBookings();
  }

  async function deleteBooking(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setSelected((s) => (s && s.id === id ? null : s));
    setDeleteTarget(null);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) await loadBookings();
  }

  const fmtMoney = (n: number) =>
    "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-faint">
      <main className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.43] text-hof">
            Flight bookings
          </h1>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total bookings" value={String(stats.total)} />
          <StatCard label="Confirmed" value={String(stats.confirmed)} />
          <StatCard label="Pending" value={String(stats.pending)} />
          <StatCard label="Revenue" value={fmtMoney(stats.revenue)} />
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-white px-4 py-3 text-[14px] text-hof">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-rausch" />
            {error}
          </div>
        )}

        <div className="mt-12 flex flex-col gap-5">
          <div className="flex items-center gap-1">
            <h2 className="text-[22px] font-medium leading-[1.18] tracking-[-0.02em] text-hof">
              All bookings
            </h2>
            <ChevronRight />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-14 w-full max-w-[560px] items-center rounded-full bg-white pl-6 pr-2 shadow-search">
              <div className="flex flex-1 flex-col">
                <span className="text-[12px] font-semibold text-hof">Search</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Passenger, airport or cabin class"
                  className="w-full bg-transparent text-[14px] text-hof outline-none placeholder:text-foggy"
                />
              </div>
              <button
                type="button"
                aria-label="Search"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-rausch text-white transition hover:bg-rausch-600"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" />
                  <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="inline-flex rounded-full border border-bebe bg-white text-hof p-1 px-1">
              {["all", ...STATUSES].map((s) => {
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`h-8 whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition duration-200
                      ${active ? "bg-hof text-white shadow-sm" : "text-hof hover:bg-white/50"}`}
                  >
                    {s === "all" ? "All" : STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-[14px]">
              <thead>
                <tr className="border-b border-bebe text-left text-[12px] font-semibold text-foggy">
                  <Th>Passenger name</Th>
                  <Th>Number of passengers</Th>
                  <Th>Route</Th>
                  <Th>Takeoff</Th>
                  <Th>Cabin</Th>
                  <Th>Price</Th>
                  <Th>Status</Th>
                  <th className="px-5 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-bebe">
                {loading ? (
                  <EmptyRow>Loading bookings…</EmptyRow>
                ) : filtered.length === 0 ? (
                  <EmptyRow>No bookings match your filters.</EmptyRow>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className="transition hover:bg-faint">
                      <td className="px-5 py-4">
                        <div className="font-medium text-hof">
                          {b.passengers[0]?.fullName ?? "—"}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-hof">{b.passengers.length}</td>
                      <td className="px-5 py-4 text-hof">
                        <span className="font-medium">{b.origin}</span>
                        <span className="mx-1.5 text-grey-500">→</span>
                        <span className="font-medium">{b.destination}</span>
                      </td>
                      <td className="px-5 py-4 text-foggy">{fmtDate(b.takeoffTime)}</td>
                      <td className="px-5 py-4 capitalize text-foggy">{b.cabinClass}</td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-hof">
                          ${Number(b.totalAmount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusSelect
                          value={b.status}
                          onChange={(s) => updateStatus(b.id, s)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            label={`Delete booking ${b.id}`}
                            onClick={() => setDeleteTarget(b.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M2.5 4.5h11M6.5 4.5V3.25C6.5 2.56 7.06 2 7.75 2h.5c.69 0 1.25.56 1.25 1.25V4.5M4 4.5l.62 8.06A1.75 1.75 0 006.37 14.25h3.26a1.75 1.75 0 001.75-1.69L12 4.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </IconButton>
                          <IconButton
                            label={`View details for booking ${b.id}`}
                            onClick={() => setSelected(b)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                              />
                              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selected && (
        <DetailsModal booking={selected} onClose={() => setSelected(null)} />
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-hof/50 p-6"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[400px] rounded-xl bg-white p-6 shadow-overlay"
          >
            <h2 className="text-[18px] font-semibold text-hof">Delete booking?</h2>
            <p className="mt-2 text-[14px] text-foggy">
              This action cannot be undone. The booking will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-lg border border-bebe px-5 text-[14px] font-medium text-hof transition hover:bg-faint"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBooking(deleteTarget)}
                className="h-10 rounded-lg bg-rausch px-5 text-[14px] font-medium text-white transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsModal({ booking: b, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-hof/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] rounded-t-xl bg-white shadow-overlay sm:rounded-xl"
      >
        <div className="relative flex items-center justify-center border-b border-bebe px-6 py-4">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-faint"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="#222" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-[16px] font-semibold text-hof">Booking details</span>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[28px] font-bold leading-[1.2] text-hof">{b.origin}</div>
              <div className="text-[13px] text-foggy">Origin</div>
            </div>
            <div className="flex flex-1 flex-col items-center px-4">
              <div className="mt-1 flex w-full items-center gap-1">
                <span className="h-px flex-1 bg-bebe" />
                <PlaneIcon />
                <span className="h-px flex-1 bg-bebe" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-bold leading-[1.2] text-hof">{b.destination}</div>
              <div className="text-[13px] text-foggy">Destination</div>
            </div>
          </div>

          <Section title="Passengers">
            {b.passengers.map((p, index) => (
              <Row key={p.id ?? index} label={p.fullName} value={passengerTypeLabel(p)} />
            ))}
            <Row label="Phone number" value={b.phone || "—"} />
            <Row label="Email" value={b.email ?? "—"} />
          </Section>

          <Section title="Flight">
            <Row label="Route" value={`${airportLabel(b.origin)} → ${airportLabel(b.destination)}`} />
            {b.airlineName && (
            <Row label="Airline" value={b.airlineName} />  // ← أضف هذا
            )}
            <Row label="Takeoff" value={fmtDate(b.takeoffTime)} />
            {b.arrivalTime && (
              <>
                <Row label="Arrival" value={fmtDate(b.arrivalTime)} />
                <Row label="Duration" value={fmtDuration(b.takeoffTime, b.arrivalTime)} />
              </>
            )}
            <Row label="Cabin" value={b.cabinClass} capitalize />
          </Section>

          <Section title="Payment">
            <Row label="Total price" value={`$${Number(b.totalAmount).toFixed(2)}`} strong />
            <Row label="Currency" value={b.currency} />
            <Row label="Status" value={STATUS_LABEL[b.status] ?? b.status} />
          </Section>

          <Section title="Record">
            <Row label="Created" value={fmtDate(b.createdAt)} />
          </Section>
        </div>

        <div className="flex items-center justify-end border-t border-bebe px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 rounded-lg bg-hof px-5 text-[14px] font-medium text-white transition hover:bg-black"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-bebe pt-5">
      <h3 className="text-[16px] font-semibold text-hof">{title}</h3>
      <dl className="mt-3 flex flex-col gap-2.5">{children}</dl>
    </div>
  );
}

function Row({ label, value, strong, capitalize }: { label: string; value: string; strong?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[14px]">
      <dt className="text-foggy">{label}</dt>
      <dd className={`text-right text-hof ${strong ? "font-semibold" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function StatusSelect({ value, onChange, label = "Status" }: { value: string; onChange: (s: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        className={`flex h-7 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition
          ${value === "confirmed" ? "border-transparent bg-hof text-white" : "border-bebe bg-white text-hof hover:border-hof"}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${value === "confirmed" ? "bg-white" : "bg-foggy"}`} />
        {STATUS_LABEL[value]}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-9 z-10 overflow-hidden rounded-xl border border-bebe bg-white shadow-overlay">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { onChange(s); setOpen(false); }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-[13px] transition hover:bg-faint
                ${s === value ? "font-medium text-hof" : "text-foggy"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s === "confirmed" ? "bg-hof" : "bg-foggy"}`} />
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 font-semibold">{children}</th>;
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className="flex h-9 w-9 items-center justify-center rounded-full text-hof transition hover:bg-faint">
      {children}
    </button>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={8} className="px-5 py-16 text-center text-foggy">{children}</td>
    </tr>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-[12px] font-medium text-foggy">{label}</p>
      <p className="mt-1 text-[22px] font-semibold leading-[1.18] tracking-[-0.02em] text-hof">{value}</p>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3l5 5-5 5" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M2 12l20-8-8 20-2-9-10-3z" stroke="#222" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}