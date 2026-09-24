"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Warning } from "@/components/icons";
import {
  buildPassengerList,
  clearSelectedFlight,
  loadSelectedFlight,
  parsePassengerCounts,
} from "@/lib/flights";
import { DEFAULT_DEPARTURE_DATE, formatPassengerLabel } from "@/lib/format";
import type {
  BookingRequestBody,
  BookingResponse,
  CabinClass,
  PassengerCounts,
  SelectedFlight,
} from "@/lib/types";

const SPACING = {
  section: "mt-8",
  sectionTitle: "mt-1",
  cardBody: "mt-6",
} as const;

type PassengerFormState = {
  type: "adult" | "child" | "infant";
  position: number;
  fullName: string;
  age: string;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export function BookPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const counts: PassengerCounts = useMemo(
    () => parsePassengerCounts(searchParams),
    [searchParams],
  );

  const offerId = searchParams.get("offerId");
  const departureDate = searchParams.get("date") ?? DEFAULT_DEPARTURE_DATE;

  const [sessionFlight, setSessionFlight] = useState<SelectedFlight | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const saved = loadSelectedFlight();
    if (saved && (!offerId || saved.offerId === offerId)) {
      setSessionFlight(saved);
    } else {
      setNotFound(true);
    }
  }, [offerId]);

  const flight = useMemo(() => {
    if (!sessionFlight) return null;
    return {
      id: sessionFlight.offerId,
      fromCode: sessionFlight.origin,
      toCode: sessionFlight.destination,
      departTime: sessionFlight.departTime,
      arriveTime: sessionFlight.arriveTime,
      duration: sessionFlight.duration,
      cabin: sessionFlight.cabinClass,
      priceCents: sessionFlight.priceCents,
      airlineName: sessionFlight.airlineName,
    };
  }, [sessionFlight]);

  const passengerSlots = useMemo(() => buildPassengerList(counts), [counts]);

  const [passengers, setPassengers] = useState<PassengerFormState[]>(() =>
    passengerSlots.map((slot) => ({
      type: slot.type,
      position: slot.position,
      fullName: "",
      age: "",
    })),
  );
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });

  const totalCents = flight
    ? flight.priceCents * (counts.adults + counts.children + counts.infants)
    : 0;

  const { takeoffTime, arrivalTime } = useMemo(() => {
    if (!flight) return { takeoffTime: "", arrivalTime: "" };

    const baseDate = new Date(`${departureDate}T00:00:00Z`);
    const [depH, depM] = flight.departTime.split(":").map(Number);
    const [arrH, arrM] = flight.arriveTime.split(":").map(Number);

    const depDate = new Date(baseDate);
    depDate.setUTCHours(depH, depM, 0, 0);

    const arrDate = new Date(baseDate);
    arrDate.setUTCHours(arrH, arrM, 0, 0);

    if (arrDate.getTime() <= depDate.getTime()) {
      arrDate.setUTCDate(arrDate.getUTCDate() + 1);
    }

    return {
      takeoffTime: depDate.toISOString(),
      arrivalTime: arrDate.toISOString(),
    };
  }, [departureDate, flight]);

  function updatePassenger(index: number, patch: Partial<PassengerFormState>) {
    setPassengers((current) =>
      current.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submit.status === "submitting" || !flight) return;

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setSubmit({ status: "error", message: "Phone number is required." });
      return;
    }

    for (const p of passengers) {
      if (!p.fullName.trim()) {
        setSubmit({
          status: "error",
          message: `${formatPassengerLabel(p.type, p.position)} needs a full name.`,
        });
        return;
      }
      if (p.type === "child" && p.age.trim() === "") {
        setSubmit({
          status: "error",
          message: `${formatPassengerLabel(p.type, p.position)} needs an age.`,
        });
        return;
      }
    }

    setSubmit({ status: "submitting" });

    const payload: BookingRequestBody = {
      origin: flight.fromCode,
      destination: flight.toCode,
      cabinClass: (flight.cabin || "economy").toLowerCase() as CabinClass,
      duffelOfferId: flight.id,
      airlineName: flight.airlineName,
      totalAmount: totalCents / 100,
      currency: "USD",
      takeoffTime,
      arrivalTime,
      phone: trimmedPhone,
      email: email.trim() || undefined,
      passengers: passengers.map((p) => ({
        type: p.type,
        fullName: p.fullName.trim(),
        position: p.position,
        age: p.type === "adult" ? undefined : Number.parseInt(p.age, 10) || 0,
      })),
    };

    fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          let message = `Booking failed (${res.status}).`;
          try {
            const data = (await res.json()) as { error?: string };
            if (data?.error) message = data.error;
          } catch {
            /* ignore */
          }
          throw new Error(message);
        }
        return (await res.json()) as BookingResponse;
      })
      .then((booking) => {
        clearSelectedFlight();
        router.push(`/thank-you?bookingId=${encodeURIComponent(booking.id)}`);
      })
      .catch((err: unknown) => {
        setSubmit({
          status: "error",
          message:
            err instanceof Error ? err.message : "Unable to complete booking.",
        });
      });
  }

  if (notFound && !sessionFlight) {
    return (
      <div className="page-gutter mx-auto max-w-[1440px] py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full py-2 text-body font-medium text-hof transition-colors hover:text-foggy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>
        <p className="mt-8 text-body text-foggy">
          No flight selected. Please go back and choose a flight.
        </p>
      </div>
    );
  }

  return (
    <div className="page-gutter mx-auto max-w-[1440px] py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full py-2 text-body font-medium text-hof transition-colors hover:text-foggy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <h1 className="mt-3 text-heading font-bold text-hof">
        Confirm and book
      </h1>

      <div className="mt-8 max-w-2xl">
        <form onSubmit={handleSubmit} noValidate>
          <h2 className="text-heading-sm font-medium text-hof">
            Who&apos;s travelling
          </h2>
          <p className={`${SPACING.sectionTitle} text-body text-foggy`}>
            Names must match the traveller&apos;s government-issued ID.
          </p>

          <div
            className={`${SPACING.cardBody} divide-y divide-bebe overflow-hidden rounded-card-lg bg-white ring-1 ring-bebe/60`}
          >
            {passengers.map((passenger, index) => (
              <PassengerSection
                key={`${passenger.type}-${passenger.position}`}
                passenger={passenger}
                onChange={(patch) => updatePassenger(index, patch)}
              />
            ))}
          </div>

          <h2 className={`${SPACING.section} text-heading-sm font-medium text-hof`}>
            Contact details
          </h2>
          <p className={`${SPACING.sectionTitle} text-body text-foggy`}>
            We&apos;ll send your ticket and any flight updates here.
          </p>

          <div
            className={`${SPACING.cardBody} overflow-hidden rounded-card-lg bg-white p-5 ring-1 ring-bebe/60 sm:p-6`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Phone number"
                required
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+213 xx xx xx xx"
              />
              <TextField
                label="Email"
                optional
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {submit.status === "error" && (
            <div
              role="alert"
              className={`${SPACING.section} flex items-start gap-3 rounded-input bg-white p-4 ring-1 ring-rausch/40`}
            >
              <Warning className="mt-0.5 h-5 w-5 shrink-0 text-rausch" />
              <p className="text-body text-hof">{submit.message}</p>
            </div>
          )}

          <div className={`${SPACING.section} border-t border-bebe pt-6`}>
            <button
              type="submit"
              disabled={submit.status === "submitting"}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-input bg-[#FF385C] px-4 text-ui font-medium text-white transition-colors hover:bg-[#E00B41] disabled:cursor-not-allowed disabled:bg-grey sm:w-auto sm:min-w-[220px]"
            >
              {submit.status === "submitting" ? (
                <>
                  <Spinner />
                  Confirming…
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
            <p className="mt-3 text-body text-foggy">
              By selecting Confirm Booking, you agree to the fare rules and the
              Skyfare terms of service.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function PassengerSection({
  passenger,
  onChange,
}: {
  passenger: PassengerFormState;
  onChange: (patch: Partial<PassengerFormState>) => void;
}) {
  const label = formatPassengerLabel(passenger.type, passenger.position);
  const showAge = passenger.type === "child";

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-ui font-medium text-hof">{label}</h3>
        <span className="rounded-full bg-faint px-3 py-1 text-caption font-semibold uppercase tracking-wide text-foggy">
          {passenger.type}
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={showAge ? "" : "sm:col-span-2"}>
          <TextField
            label="Full name"
            required
            type="text"
            autoComplete="name"
            value={passenger.fullName}
            onChange={(value) => onChange({ fullName: value })}
            placeholder="As shown on ID"
          />
        </div>
        {showAge && (
          <TextField
            label="Age"
            required
            type="number"
            value={passenger.age}
            onChange={(value) => onChange({ age: value })}
            placeholder={passenger.type === "infant" ? "0" : "8"}
            min={passenger.type === "infant" ? 0 : 2}
            max={passenger.type === "infant" ? 1 : 11}
          />
        )}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  optional,
  autoComplete,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-body font-medium text-hof">
        {label}
        {optional && <span className="font-normal text-foggy"> (optional)</span>}
      </span>
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-input border border-deco bg-white px-3.5 text-body text-hof transition-colors outline-none focus:border-hof"
      />
    </label>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-30"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
      />
    </svg>
  );
}