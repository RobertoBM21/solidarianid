import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { IsCauseSupportedByUserHandler } from './application/handlers/is-cause-supported-by-user.handler';
import { ActionsPort } from './application/ports/actions.port';
import { CauseSupportsPort } from './application/ports/cause-supports.port';
import { CausesPort } from './application/ports/causes.port';
import { ActionsService } from './application/services/actions.service';
import { CauseSupportsService } from './application/services/cause-supports.service';
import { CausesService } from './application/services/causes.service';
import { ActionRepository } from './domain/repositories/action.repository';
import { AnonymousSupporterRepository } from './domain/repositories/anonymous-supporter.repository';
import { CauseSupportRepository } from './domain/repositories/cause-support.repository';
import { CauseRepository } from './domain/repositories/cause.repository';
import { ActionDbEntity } from './infrastructure/persistence/entities/action.db-entity';
import { AnonymousUserDbEntity } from './infrastructure/persistence/entities/anonymous-user.db-entity';
import { CauseSupportDbEntity } from './infrastructure/persistence/entities/cause-support.db-entity';
import { CauseDbEntity } from './infrastructure/persistence/entities/cause.db-entity';
import { ActionRepositoryImpl } from './infrastructure/persistence/repositories/action.repository.impl';
import { AnonymousSupporterRepositoryImpl } from './infrastructure/persistence/repositories/anonymous-supporter.repository.impl';
import { CauseSupportRepositoryImpl } from './infrastructure/persistence/repositories/cause-support.repository.impl';
import { CauseRepositoryImpl } from './infrastructure/persistence/repositories/cause.repository.impl';
import { ActionsController } from './infrastructure/presentation/controllers/actions.controller';
import { CauseSupportsController } from './infrastructure/presentation/controllers/cause-supports.controller';
import { CauseController } from './infrastructure/presentation/controllers/cause.controller';
import { CausesController } from './infrastructure/presentation/controllers/causes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CauseDbEntity,
      CauseSupportDbEntity,
      ActionDbEntity,
      AnonymousUserDbEntity,
    ]),
    IdentityModule,
  ],
  providers: [
    IsCauseSupportedByUserHandler,
    ActionRepositoryImpl,
    {
      provide: ActionRepository,
      useClass: ActionRepositoryImpl,
    },
    ActionsService,
    {
      provide: ActionsPort,
      useExisting: ActionsService,
    },
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
  ],
  controllers: [
    CausesController,
    CauseController,
    CauseSupportsController,
    ActionsController,
  ],
})
export class InitiativesModule {}
