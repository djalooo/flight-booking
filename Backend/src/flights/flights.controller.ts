import { Controller, Get, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('search')
  async search(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('date') date: string,
    @Query('adults') adults: string,
    @Query('children') children: string,
    @Query('infants') infants: string,
    @Query('cabin') cabin: string,
  ) {
    return this.flightsService.search({
      from,
      to,
      date,
      adults: Number(adults ?? '1'),
      children: Number(children ?? '0'),
      infants: Number(infants ?? '0'),
      cabin: cabin ?? 'Economy',
    });
  }
}