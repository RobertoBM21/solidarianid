import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundingCauseClosedHandler } from './application/handlers/cause-closed.handler';
import { FundingActionCreatedHandler } from './application/handlers/funding-action-created.handler';
import { DonationsPort } from './application/ports/donations.port';
import { PaymentsGatewaryPort } from './application/ports/payments-gateway.port';
import { DonationsService } from './application/services/donations.service';
import { DonationRepository } from './domain/repositories/donation.repository';
import { FundingActionRepository } from './domain/repositories/funding-action.repository';
import { StripeAdapter } from './infrastructure/adapters/stripe.adapter';
import stripeConfig from './infrastructure/config/stripe.config';
import { FundingIntegrationService } from './infrastructure/funding-integration.service';
import { DonationsGrpcController } from './infrastructure/grpc/donations-grpc.controller';
import { DonationDbEntity } from './infrastructure/persistence/entities/donation.db-entity';
import { FundingActionAggrDbEntity } from './infrastructure/persistence/entities/funding-action-aggr.db-entity';
import { DonationRepositoryImpl } from './infrastructure/persistence/repositories/donation.repository.impl';
import { FundingActionRepositoryImpl } from './infrastructure/persistence/repositories/funding-action.repository.impl';
import { DonationsController } from './infrastructure/presentation/controllers/donations.controller';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    TypeOrmModule.forFeature([DonationDbEntity, FundingActionAggrDbEntity]),
  ],
  providers: [
    // Persistence
    {
      provide: DonationRepository,
      useClass: DonationRepositoryImpl,
    },
    {
      provide: FundingActionRepository,
      useClass: FundingActionRepositoryImpl,
    },

    // Ports
    {
      provide: PaymentsGatewaryPort,
      useClass: StripeAdapter,
    },
    {
      provide: DonationsPort,
      useClass: DonationsService,
    },

    // Handlers
    FundingCauseClosedHandler,
    FundingActionCreatedHandler,

    FundingIntegrationService,
  ],
  exports: [FundingIntegrationService],
  controllers: [DonationsController, DonationsGrpcController],
})
export class FundingModule {}
