import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateBookingDto {
  origin: string;
  destination: string;
  cabinClass: string;
  duffelOfferId: string;
  airlineName?: string;
  totalAmount: number;
  currency: string;
  takeoffTime: string;
  arrivalTime: string;
  phone: string;
  email?: string;
  passengers: {
    type: 'adult' | 'child' | 'infant';
    fullName: string;
    age?: number;
    position: number;
  }[];
}

export interface UpdateBookingDto {
  status?: string;
  cabinClass?: string;
  totalAmount?: number;
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: { passengers: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { passengers: true },
    });
  }

  async create(dto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        origin: dto.origin,
        destination: dto.destination,
        cabinClass: dto.cabinClass,
        duffelOfferId: dto.duffelOfferId,
        airlineName: dto.airlineName ?? null,
        totalAmount: dto.totalAmount,
        currency: dto.currency,
        takeoffTime: new Date(dto.takeoffTime),
        arrivalTime: new Date(dto.arrivalTime),
        phone: dto.phone,
        email: dto.email,
        passengers: {
          create: dto.passengers.map((p) => ({
            type: p.type,
            fullName: p.fullName,
            age: p.age ?? null,
            position: p.position,
          })),
        },
      },
      include: { passengers: true },
    });
  }

  async update(id: string, dto: UpdateBookingDto) {
    return this.prisma.booking.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.cabinClass && { cabinClass: dto.cabinClass }),
        ...(dto.totalAmount !== undefined && { totalAmount: dto.totalAmount }),
      },
      include: { passengers: true },
    });
  }

  async remove(id: string) {
    return this.prisma.booking.delete({
      where: { id },
    });
  }
}