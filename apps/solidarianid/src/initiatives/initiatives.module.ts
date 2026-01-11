import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { DonationCreatedHandler } from './application/handlers/donation-created.handler';
import { GetDonationIntentionHandler } from './application/handlers/get-donation-intention.handler';
import { IsCauseSupportedByUserHandler } from './application/handlers/is-cause-supported-by-user.handler';
import { ActionsPort } from './application/ports/actions.port';
import { CauseSupportsPort } from './application/ports/cause-supports.port';
import { CausesPort } from './application/ports/causes.port';
import { ActionsService } from './application/services/actions.service';
import { CauseSupportsService } from './application/services/cause-supports.service';
import { CausesService } from './application/services/causes.service';
import { InitiativesStatisticsPort } from './domain/ports/initiatives-statistics.port';
import { ActionRepository } from './domain/repositories/action.repository';
import { AnonymousSupporterRepository } from './domain/repositories/anonymous-supporter.repository';
import { CauseSupportRepository } from './domain/repositories/cause-support.repository';
import { CauseRepository } from './domain/repositories/cause.repository';
import { FundingActionRepository } from './domain/repositories/funding-action.repository';
import { ActionDbEntity } from './infrastructure/persistence/entities/action.db-entity';
import { AnonymousUserDbEntity } from './infrastructure/persistence/entities/anonymous-user.db-entity';
import { CauseSupportDbEntity } from './infrastructure/persistence/entities/cause-support.db-entity';
import { CauseDbEntity } from './infrastructure/persistence/entities/cause.db-entity';
import { FundingActionDbEntity } from './infrastructure/persistence/entities/funding-action.db-entity';
import { VolunteeringActionDbEntity } from './infrastructure/persistence/entities/volunteering-action.db-entity';
import { InitiativesStatisticsAdapter } from './infrastructure/persistence/initiatives-statistics.adapter';
import { ActionRepositoryImpl } from './infrastructure/persistence/repositories/action.repository.impl';
import { AnonymousSupporterRepositoryImpl } from './infrastructure/persistence/repositories/anonymous-supporter.repository.impl';
import { CauseSupportRepositoryImpl } from './infrastructure/persistence/repositories/cause-support.repository.impl';
import { CauseRepositoryImpl } from './infrastructure/persistence/repositories/cause.repository.impl';
import { FundingActionRepositoryImpl } from './infrastructure/persistence/repositories/funding-action.repository.impl';
import { ActionsController } from './infrastructure/presentation/controllers/actions.controller';
import { CauseSupportsController } from './infrastructure/presentation/controllers/cause-supports.controller';
import { CauseController } from './infrastructure/presentation/controllers/cause.controller';
import { CausesController } from './infrastructure/presentation/controllers/causes.controller';
import { InitiativesEventsController } from './infrastructure/presentation/controllers/initiatives-events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CauseDbEntity,
      CauseSupportDbEntity,
      ActionDbEntity,
      FundingActionDbEntity,
      VolunteeringActionDbEntity,
      AnonymousUserDbEntity,
    ]),
    IdentityModule,
  ],
  providers: [
    // Persistence
    CauseRepositoryImpl,
    {
      provide: CauseRepository,
      useExisting: CauseRepositoryImpl,
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

    // Handlers
    DonationCreatedHandler,
    GetDonationIntentionHandler,
    IsCauseSupportedByUserHandler,

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
  ],
  controllers: [
    CausesController,
    CauseController,
    CauseSupportsController,
    ActionsController,
    InitiativesEventsController,
  ],
})
export class InitiativesModule {}
