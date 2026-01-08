import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsPort } from './application/ports/actions.port';
import { ActionsService } from './application/services/actions.service';
import { CausesService } from './application/services/causes.service';
import { CausesServicePort } from './domain/ports/causes.port';
import { ActionRepository } from './domain/repositories/action.repository';
import { CauseRepository } from './domain/repositories/cause.repository';
import { ActionDbEntity } from './infrastructure/persistence/entities/action.db-entity';
import { CauseDbEntity } from './infrastructure/persistence/entities/cause.db-entity';
import { ActionRepositoryImpl } from './infrastructure/persistence/repositories/action.repository.impl';
import { CauseRepositoryImpl } from './infrastructure/persistence/repositories/cause.repository.impl';
import { ActionsController } from './infrastructure/presentation/controllers/actions.controller';
import { CausesController } from './infrastructure/presentation/controllers/causes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CauseDbEntity, ActionDbEntity])],
  providers: [
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
      useClass: CauseRepositoryImpl,
    },
    CausesService,
    {
      provide: CausesServicePort,
      useExisting: CausesService,
    },
  ],
  controllers: [CausesController, ActionsController],
})
export class InitiativesModule {}
