import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteeringCauseClosedHandler } from './application/handlers/cause-closed.handler';
import { VolunteeringActionCreatedHandler } from './application/handlers/volunteering-action-created.handler';
import { VolunteerLogPort } from './application/ports/volunteer-log.port';
import { VolunteerLogService } from './application/services/volunteer-log.service';
import { VolunteerLogRepository } from './domain/repositories/volunteer-log.repository';
import { VolunteeringActionRepository } from './domain/repositories/volunteering-action.repository';
import { VolunteerLogDbEntity } from './infrastructure/persistence/entities/volunteer-log.db-entity';
import { VolunteeringActionAggrDbEntity } from './infrastructure/persistence/entities/volunteering-action-aggr.db-entity';
import { VolunteerLogRepositoryImpl } from './infrastructure/persistence/repositories/volunteer-log.repository.impl';
import { VolunteeringActionRepositoryImpl } from './infrastructure/persistence/repositories/volunteering-action.repository.impl';
import { VolunteerLogsController } from './infrastructure/presentation/controllers/volunteer-logs.controller';
import { VolunteeringIntegrationService } from './infrastructure/volunteering-integration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VolunteerLogDbEntity,
      VolunteeringActionAggrDbEntity,
    ]),
  ],
  providers: [
    {
      provide: VolunteerLogRepository,
      useClass: VolunteerLogRepositoryImpl,
    },
    {
      provide: VolunteeringActionRepository,
      useClass: VolunteeringActionRepositoryImpl,
    },
    {
      provide: VolunteerLogPort,
      useClass: VolunteerLogService,
    },
    VolunteeringActionCreatedHandler,
    VolunteeringCauseClosedHandler,
    VolunteeringIntegrationService,
  ],
  exports: [VolunteeringIntegrationService],
  controllers: [VolunteerLogsController],
})
export class VolunteeringModule {}
