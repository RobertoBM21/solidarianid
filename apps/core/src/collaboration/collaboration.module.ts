import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesModule } from '../communities/communities.module';
import { InitiativesModule } from '../initiatives/initiatives.module';
import { CollaborationHistoryPort } from './application/ports/collaboration-history.port';
import { DonationsPort } from './application/ports/donations.port';
import { GetMySupportsPort } from './application/ports/get-my-supports.port';
import { GetUserMembershipsPort } from './application/ports/get-user-memberships.port';
import { PaymentsGatewaryPort } from './application/ports/payments-gateway.port';
import { RequestDonationIntentionPort } from './application/ports/request-donation-intention.port';
import { VolunteerLogPort } from './application/ports/volunteer-log.port';
import { CollaborationHistoryService } from './application/services/collaboration-history.service';
import { DonationsService } from './application/services/donations.service';
import { VolunteerLogService } from './application/services/volunteer-log.service';
import { CollaborationHistoryRetrieverPort } from './domain/ports/collaboration-history-retriever.port';
import { DonationRepository } from './domain/repositories/donation.repository';
import { VolunteerLogRepository } from './domain/repositories/volunteer-log.repository';
import { StripeAdapter } from './infrastructure/adapters/stripe.adapter';
import stripeConfig from './infrastructure/config/stripe.config';
import { GetMySupportsAdapter } from './infrastructure/get-my-supports.adapter';
import { CollaborationGrpcController } from './infrastructure/grpc/collaboration-grpc.controller';
import { DonationsGrpcController } from './infrastructure/grpc/donations-grpc.controller';
import { MyMembershipsAdapter } from './infrastructure/my-memberships.adapter';
import { CollaborationHistoryRetrieverAdapter } from './infrastructure/persistence/adapters/collaboration-history-retriever.adapter';
import { DonationDbEntity } from './infrastructure/persistence/entities/donation.db-entity';
import { VolunteerLogDbEntity } from './infrastructure/persistence/entities/volunteer-log.db-entity';
import { DonationRepositoryImpl } from './infrastructure/persistence/repositories/donation.repository.impl';
import { VolunteerLogRepositoryImpl } from './infrastructure/persistence/repositories/volunteer-log.repository.impl';
import { CollaborationController } from './infrastructure/presentation/controllers/collaboration.controller';
import { DonationsController } from './infrastructure/presentation/controllers/donations.controller';
import { VolunteerLogsController } from './infrastructure/presentation/controllers/volunteer-logs.controller';
import { RequestDonationIntentionAdapter } from './infrastructure/request-donation-intention.adapter';

@Module({
  imports: [
    ConfigModule.forFeature(stripeConfig),
    TypeOrmModule.forFeature([DonationDbEntity, VolunteerLogDbEntity]),
    CommunitiesModule,
    InitiativesModule,
  ],
  providers: [
    // Persistence
    {
      provide: DonationRepository,
      useClass: DonationRepositoryImpl,
    },
    {
      provide: VolunteerLogRepository,
      useClass: VolunteerLogRepositoryImpl,
    },

    // Ports
    {
      provide: GetUserMembershipsPort,
      useClass: MyMembershipsAdapter,
    },
    {
      provide: RequestDonationIntentionPort,
      useClass: RequestDonationIntentionAdapter,
    },
    {
      provide: GetMySupportsPort,
      useClass: GetMySupportsAdapter,
    },
    {
      provide: PaymentsGatewaryPort,
      useClass: StripeAdapter,
    },
    {
      provide: DonationsPort,
      useClass: DonationsService,
    },
    {
      provide: VolunteerLogPort,
      useClass: VolunteerLogService,
    },
    {
      provide: CollaborationHistoryPort,
      useClass: CollaborationHistoryService,
    },
    {
      provide: CollaborationHistoryRetrieverPort,
      useClass: CollaborationHistoryRetrieverAdapter,
    },
  ],
  controllers: [
    DonationsController,
    DonationsGrpcController,
    VolunteerLogsController,
    CollaborationGrpcController,
    CollaborationController,
  ],
})
export class CollaborationModule {}
