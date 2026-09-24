"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Mail, Phone, Warning } from "@/components/icons";
import { formatDateLong, formatPassengerLabel, formatPrice } from "@/lib/format";
import type { BookingResponse } from "@/lib/types";

type State =
  | { status: "loading" }
  | { status: "ready"; booking: BookingResponse }
  | { status: "missing" }
  | { status: "error"; message: string };

export function ThankYouClient() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!bookingId) {
      setState({ status: "missing" });
      return;
    }

    let cancelled = false;

    fetch(`/api/bookings/${encodeURIComponent(bookingId)}`)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("missing");
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(data?.error ?? `Failed to load booking (${res.status})`);
        }
        return (await res.json()) as BookingResponse;
      })
      .then((booking) => {
        if (!cancelled) setState({ status: "ready", booking });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof Error && err.message === "missing") {
          setState({ status: "missing" });
          return;
        }
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Failed to load booking.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (state.status === "loading") {
    return (
      <div className="rounded-card-lg bg-white p-12 text-center">
        <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-bebe border-t-hof" />
        <p className="mt-4 text-body text-foggy">Loading your booking…</p>
      </div>
    );
  }

  if (state.status === "missing" || state.status === "error") {
  return (
    <div className="rounded-card-lg bg-white p-10 text-center sm:p-12">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rausch/10 text-rausch">
        <Check className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-heading-sm font-medium text-hof">
        Thank you
      </h1>
      <p className="mx-auto mt-2 max-w-md text-body text-foggy">
        We will contact you soon.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-input bg-hof px-5 text-ui font-medium text-white transition-opacity hover:opacity-90"
      >
        Search another flight
      </Link>
    </div>
  );
}

  const { booking } = state;
  const passengers = booking.passengers ?? [];

  return (
    <div className="grid gap-4">
      <section className="rounded-card-lg bg-white px-6 py-12 text-center sm:px-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rausch/10 text-rausch">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-heading font-bold text-hof">
          Booking Confirmed!
        </h1>
        <p className="mx-auto mt-2 max-w-md text-body text-foggy">
          Your seats are held. We&apos;ve sent the itinerary
          {booking.email ? ` to ${booking.email}` : " to your phone"}.
        </p>

        <div className="mx-auto mt-7 inline-flex flex-col items-center rounded-card border border-dashed border-deco px-6 py-4">
          <span className="text-caption font-semibold uppercase tracking-[0.08em] text-foggy">
            Booking reference
          </span>
          <span className="mt-1.5 font-mono text-ui font-medium text-hof">
            {booking.id}
          </span>
        </div>
      </section>

      <section className="rounded-card-lg bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-subheading font-medium text-hof">
            {booking.origin} → {booking.destination}
          </h2>
          {booking.cabinClass && (
            <span className="rounded-full bg-faint px-3 py-1 text-micro font-semibold capitalize text-hof">
              {booking.cabinClass}
            </span>
          )}
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-4">
          <Tile label="Date" value={formatDateLong(booking.departureDate)} />
          <Tile label="Departure" value={timeOf(booking.takeoffTime)} />
          <Tile label="Arrival" value={timeOf(booking.arrivalTime)} />
          <Tile
            label="Duration"
            value={
              booking.flightDuration
                ? `${Math.floor(booking.flightDuration / 60)}h ${
                    booking.flightDuration % 60
                  }m`
                : "—"
            }
          />
        </dl>
      </section>

      <section className="rounded-card-lg bg-white p-6 sm:p-8">
        <h2 className="text-subheading font-medium text-hof">
          Travellers ({passengers.length})
        </h2>
        <ul className="mt-4 divide-y divide-bebe">
          {passengers.map((p, index) => (
            <li
              key={`${p.type}-${p.position}-${index}`}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-ui font-medium text-hof">
                  {p.fullName}
                </p>
                <p className="text-body text-foggy">
                  {formatPassengerLabel(p.type, p.position)}
                  {p.type !== "adult" && typeof p.age === "number"
                    ? ` · age ${p.age}`
                    : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-faint px-3 py-1 text-micro font-medium capitalize text-foggy">
                {p.type}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card-lg bg-white p-6 sm:p-8">
        <h2 className="text-subheading font-medium text-hof">Contact</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <ContactTile
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={booking.phone ?? "—"}
          />
          <ContactTile
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={booking.email ?? "Not provided"}
          />
        </dl>
        <div className="mt-6 flex items-center justify-between border-t border-bebe pt-5">
          <span className="text-ui font-medium text-hof">Total paid</span>
          <span className="text-ui font-semibold text-hof">
            {typeof booking.totalAmount === "number"
              ? formatPrice(
                  Math.round(booking.totalAmount * 100),
                  booking.currency ?? "USD",
                )
              : "—"}
          </span>
        </div>
      </section>

      <div className="py-4">
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center rounded-input bg-hof px-5 text-ui font-medium text-white transition-opacity hover:opacity-90 sm:mx-auto sm:w-auto sm:min-w-[260px]"
        >
          Search another flight
        </Link>
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card bg-faint p-4">
      <dt className="text-micro font-medium uppercase tracking-wide text-foggy">
        {label}
      </dt>
      <dd className="mt-1 text-ui font-medium text-hof">{value || "—"}</dd>
    </div>
  );
}

function ContactTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-card bg-faint p-4">
      <span className="mt-0.5 text-hof">{icon}</span>
      <div className="min-w-0">
        <dt className="text-micro font-medium uppercase tracking-wide text-foggy">
          {label}
        </dt>
        <dd className="mt-0.5 truncate text-ui font-medium text-hof">{value}</dd>
      </div>
    </div>
  );
}

function timeOf(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString("en-US", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
