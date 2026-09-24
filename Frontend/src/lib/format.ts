export const DEFAULT_DEPARTURE_DATE = "2026-12-12";

export function formatPrice(cents: number, currency = "USD") {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

export function formatDateLong(iso: string | null | undefined) {
  if (!iso) return "";
  // Accept either full ISO or YYYY-MM-DD
  const base = iso.length > 10 ? iso : `${iso}T00:00:00Z`;
  const date = new Date(base);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(iso: string | null | undefined) {
  if (!iso) return "";
  const base = iso.length > 10 ? iso : `${iso}T00:00:00Z`;
  const date = new Date(base);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

export function formatPassengerLabel(type: "adult" | "child" | "infant", position: number) {
  const capitalised = type.charAt(0).toUpperCase() + type.slice(1);
  return `${capitalised} ${position}`;
}

export function parseDurationToMinutes(duration: string | number | undefined | null): number {
  if (duration === undefined || duration === null) return 0;
  if (typeof duration === "number") return Math.round(duration);
  const trimmed = duration.trim();
  // Already a number string
  const direct = Number.parseInt(trimmed, 10);
  if (!Number.isNaN(direct) && /^\d+$/.test(trimmed)) return direct;

  let total = 0;
  const hours = trimmed.match(/(\d+)\s*h/);
  const minutes = trimmed.match(/(\d+)\s*m/);
  if (hours) total += Number.parseInt(hours[1], 10) * 60;
  if (minutes) total += Number.parseInt(minutes[1], 10);
  return total;
}
