import { KurrentDBClient } from '@kurrent/kurrentdb-client';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FundingCauseClosedHandler } from './application/handlers/cause-closed.handler';
import { FundingActionCreatedHandler } from './application/handlers/funding-action-created.handler';
import { DonationsPort } from './application/ports/donations.port';
import { PaymentsGatewaryPort } from './application/ports/payments-gateway.port';
import { DonationsService } from './application/services/donations.service';
import { DonationRepository } from './domain/repositories/donation.repository';
import { FundingActionRepository } from './domain/repositories/funding-action.repository';
import { StripeAdapter } from './infrastructure/adapters/stripe.adapter';
import {
  KURRENTDB_CLIENT,
  KurrentDbConfig,
  kurrentDbConfig,
} from './infrastructure/config/kurrentdb.config';
import stripeConfig from './infrastructure/config/stripe.config';
import { FundingIntegrationService } from './infrastructure/funding-integration.service';
import { DonationsGrpcController } from './infrastructure/grpc/donations-grpc.controller';
import { DonationDbEntity } from './infrastructure/persistence/entities/donation.db-entity';
import { FundingActionAggrDbEntity } from './infrastructure/persistence/entities/funding-action-aggr.db-entity';
import { DonationRepositoryImpl } from './infrastructure/persistence/repositories/donation.repository.impl';
import { FundingActionEventStoreRepository } from './infrastructure/persistence/repositories/funding-action-eventstore.repository';
import { DonationsController } from './infrastructure/presentation/controllers/donations.controller';
import { FundingActionProjector } from './infrastructure/projections/funding-action.projector';
import { ProjectionCheckpointEntity } from './infrastructure/projections/projection-checkpoint.entity';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    ConfigModule.forFeature(kurrentDbConfig),
    TypeOrmModule.forFeature([
      DonationDbEntity,
      FundingActionAggrDbEntity,
      ProjectionCheckpointEntity,
    ]),
  ],
  providers: [
    // Persistence
    {
      provide: DonationRepository,
      useClass: DonationRepositoryImpl,
    },
    {
      provide: FundingActionRepository,
      useClass: FundingActionEventStoreRepository,
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

    // Projectors
    FundingActionProjector,

    // KurrentDB
    {
      provide: KURRENTDB_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): KurrentDBClient =>
        KurrentDBClient.connectionString(
          config.getOrThrow<KurrentDbConfig>('kurrentdb').connectionString,
        ),
    },

    FundingIntegrationService,
  ],
  exports: [FundingIntegrationService],
  controllers: [DonationsController, DonationsGrpcController],
})
export class FundingModule {}
