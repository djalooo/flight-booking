import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightsModule } from './flights/flights.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BookingsModule } from './booking/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    FlightsModule,
    BookingsModule, // ← أضف هذا السطر ✅
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}