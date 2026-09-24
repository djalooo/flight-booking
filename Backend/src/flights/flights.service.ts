import { Injectable } from '@nestjs/common';
import { searchFlights } from './lib/duffel';
import { mapDuffelOffersToFlights } from './lib/mappers';

@Injectable()
export class FlightsService {
  async search(params: {
    from: string;
    to: string;
    date: string;
    adults: number;
    children: number;
    infants: number;
    cabin: string;
  }) {
    const cabinMap: Record<string, 'economy' | 'premium_economy' | 'business' | 'first'> = {
      Economy: 'economy',
      'Premium economy': 'premium_economy',
      Business: 'business',
      First: 'first',
    };

    const offers = await searchFlights({
      origin: params.from,
      destination: params.to,
      date: params.date,
      passengers: {
        adults: params.adults,
        children: params.children,
        infants: params.infants,
      },
      cabinClass: cabinMap[params.cabin] ?? 'economy',
    });

    return mapDuffelOffersToFlights(offers, params.from, params.to, params.cabin);
  }
}