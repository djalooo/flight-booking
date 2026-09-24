const DUFFEL_URL ="https://api.duffel.com/air/offer_requests?return_offers=true";

type PassengerType ="adult" | "child" | "infant_without_seat";

interface Passenger {
  type: PassengerType;
}

export async function searchFlights({
  origin,
  destination,
  date,
  passengers,
  cabinClass,
}: {
  origin: string;
  destination: string;
  date: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass:
    | "economy"
    | "premium_economy"
    | "business"
    | "first";
}) {
  const passengerList: Passenger[] = [
    ...Array.from(
      { length: passengers.adults },
      () => ({
        type: "adult" as PassengerType,
      })
    ),
    ...Array.from(
      { length: passengers.children },
      () => ({
        type: "child" as PassengerType,
      })
    ),
    ...Array.from(
      { length: passengers.infants },
      () => ({
        type: "infant_without_seat" as PassengerType,
      })
    ),
  ];

  const response = await fetch(DUFFEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
      "Duffel-Version": "v2",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        slices: [
          {
            origin,
            destination,
            departure_date: date,
          },
        ],
        passengers: passengerList,
        cabin_class: cabinClass,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Duffel API Error:", {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });

    throw new Error("Duffel request failed");
  }

  const json = await response.json();
  
  return json.data.offers;
}