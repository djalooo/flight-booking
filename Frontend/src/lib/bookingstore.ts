import type { BookingResponse } from "@/lib/types";

type Store = Map<string, BookingResponse>;

const globalForBookings = globalThis as typeof globalThis & {
  __skyfareBookingStore?: Store;
};

const store: Store =
  globalForBookings.__skyfareBookingStore ?? new Map<string, BookingResponse>();

if (!globalForBookings.__skyfareBookingStore) {
  globalForBookings.__skyfareBookingStore = store;
}

export function saveBooking(booking: BookingResponse) {
  store.set(booking.id, booking);
}

export function getBooking(id: string | null | undefined): BookingResponse | null {
  if (!id) return null;
  return store.get(id) ?? null;
}
