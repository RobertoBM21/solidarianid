import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesModule } from '../communities/communities.module';
import { FundingModule } from '../funding/funding.module';
import { IdentityModule } from '../identity/identity.module';
import { VolunteeringModule } from '../volunteering/volunteering.module';
import { CauseClosedHandler } from './application/handlers/cause-closed.handler';
import { CauseCreatedHandler } from './application/handlers/cause-created.handler';
import { CauseSupportRegisteredHandler } from './application/handlers/cause-support-registered.handler';
import { ActionsPort } from './application/ports/actions.port';
import { CauseDataGetterPort } from './application/ports/cause-data-getter.port';
import { CauseSupportsPort } from './application/ports/cause-supports.port';
import { CausesPort } from './application/ports/causes.port';
import { CollaborationHistoryPort } from './application/ports/collaboration-history.port';
import { GetUserMembershipsPort } from './application/ports/get-user-memberships.port';
import { GetUserPort } from './application/ports/get-user.port';
import { ActionsService } from './application/services/actions.service';
import { CauseSupportsService } from './application/services/cause-supports.service';
import { CausesService } from './application/services/causes.service';
import { CollaborationHistoryService } from './application/services/collaboration-history.service';
import { CollaborationHistoryRetrieverPort } from './domain/ports/collaboration-history-retriever.port';
import { CommunityAuthorizationPort } from './domain/ports/community-authz.port';
import { InitiativesStatisticsPort } from './domain/ports/initiatives-statistics.port';
import { AnonymousSupporterRepository } from './domain/repositories/anonymous-supporter.repository';
import { CauseAggrRepository } from './domain/repositories/cause-aggr.repository';
import { CauseSupportRepository } from './domain/repositories/cause-support.repository';
import { CauseDataGetterAdapter } from './infrastructure/adapters/cause-data-getter.adapter';
import { CollaborationHistoryRetrieverAdapter } from './infrastructure/adapters/collaboration-history-retriever.adapter';
import { CommunityAuthorizationAdapter } from './infrastructure/adapters/community-authz.adapter';
import { MyMembershipsAdapter } from './infrastructure/adapters/my-memberships.adapter';
import { GetUserIntegrationAdapter } from './infrastructure/get-user-integration.adapter';
import { causeSupportPubSubProvider } from './infrastructure/graphql/pubsub.provider';
import { CollaborationGrpcController } from './infrastructure/grpc/collaboration-grpc.controller';
import { InitiativesGrpcController } from './infrastructure/grpc/initiatives-grpc.controller';
import { InitiativesIntegrationService } from './infrastructure/initiatives-integration.service';
import { ActionDbEntity } from './infrastructure/persistence/entities/action.db-entity';
import { AnonymousUserDbEntity } from './infrastructure/persistence/entities/anonymous-user.db-entity';
import { CauseAggrDbEntity } from './infrastructure/persistence/entities/cause-aggr.db-entity';
import { CauseSupportDbEntity } from './infrastructure/persistence/entities/cause-support.db-entity';
import { FundingActionDbEntity } from './infrastructure/persistence/entities/funding-action.db-entity';
import { VolunteeringActionDbEntity } from './infrastructure/persistence/entities/volunteering-action.db-entity';
import { InitiativesStatisticsAdapter } from './infrastructure/persistence/initiatives-statistics.adapter';
import { AnonymousSupporterRepositoryImpl } from './infrastructure/persistence/repositories/anonymous-supporter.repository.impl';
import { CauseAggrRepositoryImpl } from './infrastructure/persistence/repositories/cause-aggr.repository.impl';
import { CauseSupportRepositoryImpl } from './infrastructure/persistence/repositories/cause-support.repository.impl';
import { ActionsController } from './infrastructure/presentation/controllers/actions.controller';
import { CauseSupportsController } from './infrastructure/presentation/controllers/cause-supports.controller';
import { CauseController } from './infrastructure/presentation/controllers/cause.controller';
import { CollaborationController } from './infrastructure/presentation/controllers/collaboration.controller';
import { CauseSupportsResolver } from './infrastructure/presentation/graphql/cause-supports.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CauseAggrDbEntity,
      CauseSupportDbEntity,
      ActionDbEntity,
      FundingActionDbEntity,
      VolunteeringActionDbEntity,
      AnonymousUserDbEntity,
    ]),
    CommunitiesModule,
    IdentityModule,
    FundingModule,
    VolunteeringModule,
  ],
  providers: [
    // Persistence
    {
      provide: CauseAggrRepository,
      useClass: CauseAggrRepositoryImpl,
    },
    {
      provide: CauseSupportRepository,
      useClass: CauseSupportRepositoryImpl,
    },
    {
      provide: AnonymousSupporterRepository,
      useClass: AnonymousSupporterRepositoryImpl,
    },

    // Ports
    {
      provide: InitiativesStatisticsPort,
      useClass: InitiativesStatisticsAdapter,
    },
    {
      provide: CommunityAuthorizationPort,
      useClass: CommunityAuthorizationAdapter,
    },
    {
      provide: CauseDataGetterPort,
      useClass: CauseDataGetterAdapter,
    },
    {
      provide: CausesPort,
      useClass: CausesService,
    },
    {
      provide: CauseSupportsPort,
      useClass: CauseSupportsService,
    },
    {
      provide: ActionsPort,
      useClass: ActionsService,
    },
    {
      provide: CollaborationHistoryPort,
      useClass: CollaborationHistoryService,
    },
    {
      provide: CollaborationHistoryRetrieverPort,
      useClass: CollaborationHistoryRetrieverAdapter,
    },
    {
      provide: GetUserMembershipsPort,
      useClass: MyMembershipsAdapter,
    },
    {
      provide: GetUserPort,
      useClass: GetUserIntegrationAdapter,
    },

    // Handlers
    CauseCreatedHandler,
    CauseClosedHandler,
    CauseSupportRegisteredHandler,

    InitiativesIntegrationService,

    causeSupportPubSubProvider,
    CauseSupportsResolver,
  ],
  exports: [InitiativesIntegrationService],
  controllers: [
    CauseController,
    CauseSupportsController,
    ActionsController,
    CollaborationController,
    InitiativesGrpcController,
    CollaborationGrpcController,
  ],
})
export class InitiativesModule {}
