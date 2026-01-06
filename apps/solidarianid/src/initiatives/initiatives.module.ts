import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CausesService } from './application/services/causes.service';
import { CausesServicePort } from './domain/ports/causes.port';
import { CauseRepository } from './domain/repositories/cause.repository';
import { CauseDbEntity } from './infrastructure/persistence/entities/cause.db-entity';
import { CauseRepositoryImpl } from './infrastructure/persistence/repositories/cause.repository.impl';
import { CausesController } from './infrastructure/presentation/controllers/causes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CauseDbEntity])],
  providers: [
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
  controllers: [CausesController],
})
export class InitiativesModule {}
