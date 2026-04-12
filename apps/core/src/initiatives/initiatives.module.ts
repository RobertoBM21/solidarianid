import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesModule } from '../communities/communities.module';
import { IdentityModule } from '../identity/identity.module';
import { CauseClosedHandler } from './application/handlers/cause-closed.handler';
import { CauseCreatedHandler } from './application/handlers/cause-created.handler';
import { CauseSupportRegisteredHandler } from './application/handlers/cause-support-registered.handler';
import { DonationCreatedHandler } from './application/handlers/donation-created.handler';
import { FundingActionCreatedHandler } from './application/handlers/funding-action-created.handler';
import { GetDonationIntentionHandler } from './application/handlers/get-donation-intention.handler';
import { GetMySupportsHandler } from './application/handlers/get-my-supports.handler';
import { VolunteeringActionCreatedHandler } from './application/handlers/volunteering-action-created.handler';
import { ActionsPort } from './application/ports/actions.port';
import { CauseDataGetterPort } from './application/ports/cause-data-getter.port';
import { CauseSupportsPort } from './application/ports/cause-supports.port';
import { CausesPort } from './application/ports/causes.port';
import { ActionsService } from './application/services/actions.service';
import { CauseSupportsService } from './application/services/cause-supports.service';
import { CausesService } from './application/services/causes.service';
import { CommunityAuthorizationPort } from './domain/ports/community-authz.port';
import { InitiativesStatisticsPort } from './domain/ports/initiatives-statistics.port';
import { UserCheckerPort } from './domain/ports/user-checker.port';
import { ActionRepository } from './domain/repositories/action.repository';
import { AnonymousSupporterRepository } from './domain/repositories/anonymous-supporter.repository';
import { CauseAggrRepository } from './domain/repositories/cause-aggr.repository';
import { CauseSupportRepository } from './domain/repositories/cause-support.repository';
import { FundingActionRepository } from './domain/repositories/funding-action.repository';
import { CommunitiesIntegrationAdapter } from './infrastructure/communities-integration.adapter';
import { causeSupportPubSubProvider } from './infrastructure/graphql/pubsub.provider';
import { InitiativesGrpcController } from './infrastructure/grpc/initiatives-grpc.controller';
import { IdentityIntegrationAdapter } from './infrastructure/identity-integration.adapter';
import { ActionDbEntity } from './infrastructure/persistence/entities/action.db-entity';
import { AnonymousUserDbEntity } from './infrastructure/persistence/entities/anonymous-user.db-entity';
import { CauseAggrDbEntity } from './infrastructure/persistence/entities/cause-aggr.db-entity';
import { CauseSupportDbEntity } from './infrastructure/persistence/entities/cause-support.db-entity';
import { FundingActionDbEntity } from './infrastructure/persistence/entities/funding-action.db-entity';
import { VolunteeringActionDbEntity } from './infrastructure/persistence/entities/volunteering-action.db-entity';
import { InitiativesStatisticsAdapter } from './infrastructure/persistence/initiatives-statistics.adapter';
import { ActionRepositoryImpl } from './infrastructure/persistence/repositories/action.repository.impl';
import { AnonymousSupporterRepositoryImpl } from './infrastructure/persistence/repositories/anonymous-supporter.repository.impl';
import { CauseAggrRepositoryImpl } from './infrastructure/persistence/repositories/cause-aggr.repository.impl';
import { CauseSupportRepositoryImpl } from './infrastructure/persistence/repositories/cause-support.repository.impl';
import { FundingActionRepositoryImpl } from './infrastructure/persistence/repositories/funding-action.repository.impl';
import { ActionsController } from './infrastructure/presentation/controllers/actions.controller';
import { CauseSupportsController } from './infrastructure/presentation/controllers/cause-supports.controller';
import { CauseController } from './infrastructure/presentation/controllers/cause.controller';
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
  ],
  providers: [
    // Persistence
    CauseAggrRepositoryImpl,
    {
      provide: CauseAggrRepository,
      useExisting: CauseAggrRepositoryImpl,
    },
    CauseSupportRepositoryImpl,
    {
      provide: CauseSupportRepository,
      useExisting: CauseSupportRepositoryImpl,
    },
    AnonymousSupporterRepositoryImpl,
    {
      provide: AnonymousSupporterRepository,
      useExisting: AnonymousSupporterRepositoryImpl,
    },
    ActionRepositoryImpl,
    {
      provide: ActionRepository,
      useExisting: ActionRepositoryImpl,
    },
    FundingActionRepositoryImpl,
    {
      provide: FundingActionRepository,
      useExisting: FundingActionRepositoryImpl,
    },
    InitiativesStatisticsAdapter,
    {
      provide: InitiativesStatisticsPort,
      useExisting: InitiativesStatisticsAdapter,
    },

    CommunitiesIntegrationAdapter,
    {
      provide: CommunityAuthorizationPort,
      useExisting: CommunitiesIntegrationAdapter,
    },
    {
      provide: CauseDataGetterPort,
      useExisting: CommunitiesIntegrationAdapter,
    },

    IdentityIntegrationAdapter,
    {
      provide: UserCheckerPort,
      useExisting: IdentityIntegrationAdapter,
    },

    // Handlers
    CauseCreatedHandler,
    CauseClosedHandler,
    CauseSupportRegisteredHandler,
    VolunteeringActionCreatedHandler,
    FundingActionCreatedHandler,
    DonationCreatedHandler,
    GetDonationIntentionHandler,
    GetMySupportsHandler,

    // Services / Ports
    CausesService,
    {
      provide: CausesPort,
      useExisting: CausesService,
    },
    CauseSupportsService,
    {
      provide: CauseSupportsPort,
      useExisting: CauseSupportsService,
    },
    ActionsService,
    {
      provide: ActionsPort,
      useExisting: ActionsService,
    },

    causeSupportPubSubProvider,
    CauseSupportsResolver,
  ],
  controllers: [
    CauseController,
    CauseSupportsController,
    ActionsController,
    InitiativesGrpcController,
  ],
})
export class InitiativesModule {}
