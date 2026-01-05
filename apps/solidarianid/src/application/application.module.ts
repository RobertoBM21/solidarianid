import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { CommunitiesService } from './services/communities.service';
import { CausesService } from './services/causes.service';
import { CausesServicePort } from '../domain/ports/causes.service.port';

@Module({
  imports: [InfrastructureModule],
  providers: [
    CommunitiesService,
    CausesService,
    {
      provide: CausesServicePort,
      useExisting: CausesService,
    },
  ],
  exports: [CommunitiesService, CausesServicePort],
})
export class ApplicationModule {}
