import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsPort } from './application/ports/donations.port';
import { PaymentsGatewaryPort } from './application/ports/payments-gateway.port';
import { VolunteerLogPort } from './application/ports/volunteer-log.port';
import { DonationsService } from './application/services/donations.service';
import { VolunteerLogService } from './application/services/volunteer-log.service';
import { DonationRepository } from './domain/repositories/donation.repository';
import { VolunteerLogRepository } from './domain/repositories/volunteer-log.repository';
import { StripeAdapter } from './infrastructure/adapters/stripe.adapter';
import stripeConfig from './infrastructure/config/stripe.config';
import { DonationDbEntity } from './infrastructure/persistence/entities/donation.db-entity';
import { VolunteerLogDbEntity } from './infrastructure/persistence/entities/volunteer-log.db-entity';
import { DonationRepositoryImpl } from './infrastructure/persistence/repositories/donation.repository.impl';
import { VolunteerLogRepositoryImpl } from './infrastructure/persistence/repositories/volunteer-log.repository.impl';
import { DonationsEventsController } from './infrastructure/presentation/controllers/donations-events.controller';
import { DonationsController } from './infrastructure/presentation/controllers/donations.controller';
import { VolunteerLogsController } from './infrastructure/presentation/controllers/volunteer-logs.controller';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    TypeOrmModule.forFeature([DonationDbEntity, VolunteerLogDbEntity]),
  ],
  providers: [
    DonationRepositoryImpl,
    {
      provide: DonationRepository,
      useExisting: DonationRepositoryImpl,
    },
    StripeAdapter,
    {
      provide: PaymentsGatewaryPort,
      useExisting: StripeAdapter,
    },
    DonationsService,
    {
      provide: DonationsPort,
      useExisting: DonationsService,
    },
    VolunteerLogRepositoryImpl,
    {
      provide: VolunteerLogRepository,
      useExisting: VolunteerLogRepositoryImpl,
    },
    VolunteerLogService,
    {
      provide: VolunteerLogPort,
      useExisting: VolunteerLogService,
    },
  ],
  controllers: [
    DonationsController,
    DonationsEventsController,
    VolunteerLogsController,
  ],
})
export class CollaborationModule {}
