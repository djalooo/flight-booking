import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  airlineName: text("airline_name").notNull(),
  airlineCode: text("airline_code").notNull(),
  flightNumber: text("flight_number").notNull(),
  fromAirport: text("from_airport").notNull(),
  fromCity: text("from_city").notNull(),
  toAirport: text("to_airport").notNull(),
  toCity: text("to_city").notNull(),
  departureTime: text("departure_time").notNull(), // e.g. "08:30"
  arrivalTime: text("arrival_time").notNull(), // e.g. "14:45"
  durationMinutes: integer("duration_minutes").notNull(), // e.g. 675
  stops: integer("stops").notNull().default(0), // 0, 1, 2
  stopAirport: text("stop_airport"), // e.g. "AMS"
  stopDuration: text("stop_duration"), // e.g. "1h 40m"
  priceEconomy: integer("price_economy").notNull(),
  pricePremium: integer("price_premium").notNull(),
  priceBusiness: integer("price_business").notNull(),
  priceFirst: integer("price_first").notNull(),
  aircraft: text("aircraft").notNull().default("Boeing 787-9"),
  carbonKg: integer("carbon_kg").notNull().default(240),
  amenities: text("amenities").notNull().default("Wi-Fi,In-seat Power,On-demand Video,Meal Included"),
  seatPitch: text("seat_pitch").notNull().default("32 in"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingReference: text("booking_reference").notNull().unique(),
  flightId: integer("flight_id").references(() => flights.id),
  flightNumber: text("flight_number").notNull(),
  airlineName: text("airline_name").notNull(),
  airlineCode: text("airline_code").notNull(),
  fromAirport: text("from_airport").notNull(),
  fromCity: text("from_city").notNull(),
  toAirport: text("to_airport").notNull(),
  toCity: text("to_city").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  travelDate: text("travel_date").notNull(),
  returnDate: text("return_date"),
  cabinClass: text("cabin_class").notNull().default("Economy"),
  passengerName: text("passenger_name").notNull(),
  passengerEmail: text("passenger_email").notNull(),
  adultsCount: integer("adults_count").notNull().default(1),
  childrenCount: integer("children_count").notNull().default(0),
  infantsCount: integer("infants_count").notNull().default(0),
  seatNumber: text("seat_number").notNull().default("14A"),
  totalPrice: integer("total_price").notNull(),
  status: text("status").notNull().default("Confirmed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Flight = typeof flights.$inferSelect;
export type NewFlight = typeof flights.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
