import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsPort } from './application/ports/donations.port';
import { PaymentsGatewaryPort } from './application/ports/payments-gateway.port';
import { DonationsService } from './application/services/donations.service';
import { DonationRepository } from './domain/repositories/donation.repository';
import { StripeAdapter } from './infrastructure/adapters/stripe.adapter';
import stripeConfig from './infrastructure/config/stripe.config';
import { DonationDbEntity } from './infrastructure/persistence/entities/donation.db-entity';
import { DonationRepositoryImpl } from './infrastructure/persistence/repositories/donation.repository.impl';
import { DonationsController } from './infrastructure/presentation/controllers/donations.controller';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    TypeOrmModule.forFeature([DonationDbEntity]),
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
  ],
  controllers: [DonationsController],
})
export class CollaborationModule {}
